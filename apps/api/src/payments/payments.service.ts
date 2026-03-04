import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  CinetPayService,
  FlutterwaveService,
  PaymentProvider,
  PaymentResult,
} from '@cowri/payments';
import { PrismaService } from '../prisma/prisma.service';
import { InitPaymentDto, OpenDisputeDto, ResolveDisputeDto } from './dto';

const ESCROW_RELEASE_DELAY_MS = 48 * 60 * 60 * 1000; // 48 hours
const ESCROW_AUTO_RELEASE_DELAY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly cinetpay: CinetPayService;
  private readonly flutterwave: FlutterwaveService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @InjectQueue('escrow') private readonly escrowQueue: Queue,
  ) {
    this.cinetpay = new CinetPayService({
      apiKey: config.getOrThrow('CINETPAY_API_KEY'),
      siteId: config.getOrThrow('CINETPAY_SITE_ID'),
      secretKey: config.getOrThrow('CINETPAY_SECRET_KEY'),
    });

    this.flutterwave = new FlutterwaveService({
      publicKey: config.getOrThrow('FLUTTERWAVE_PUBLIC_KEY'),
      secretKey: config.getOrThrow('FLUTTERWAVE_SECRET_KEY'),
      encryptionKey: config.getOrThrow('FLUTTERWAVE_ENCRYPTION_KEY'),
      webhookSecret: config.getOrThrow('FLUTTERWAVE_WEBHOOK_SECRET'),
    });
  }

  private getProvider(name: 'cinetpay' | 'flutterwave'): PaymentProvider {
    return name === 'cinetpay' ? this.cinetpay : this.flutterwave;
  }

  // ── Init Payment ────────────────────────────────────────────────────

  async initPayment(userId: string, dto: InitPaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { buyer: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.buyerId !== userId) {
      throw new ForbiddenException('Only the buyer can initiate payment');
    }
    if (order.status !== 'CREATED' && order.status !== 'PAYMENT_PENDING') {
      throw new BadRequestException(`Cannot pay an order in status ${order.status}`);
    }

    const provider = this.getProvider(dto.provider);
    const callbackUrl = `${this.config.get('APP_URL')}/api/payments/webhook/${dto.provider}`;
    const returnUrl = `${this.config.get('APP_URL')}/orders/${order.id}/confirmation`;

    const result = await provider.initPayment({
      amount: order.totalFCFA,
      currency: 'XOF',
      orderId: order.id,
      description: `Cowri order ${order.orderNumber}`,
      customerEmail: order.buyer.email,
      customerName: `${order.buyer.firstName} ${order.buyer.lastName}`,
      callbackUrl,
      returnUrl,
      channels: dto.channels,
      metadata: { orderNumber: order.orderNumber },
    });

    // Persist payment record
    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        provider: dto.provider,
        transactionId: result.transactionId,
        status: 'PENDING',
        amount: order.totalFCFA,
        currency: 'XOF',
        paymentUrl: result.paymentUrl,
      },
    });

    // Transition order to PAYMENT_PENDING
    if (order.status === 'CREATED') {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAYMENT_PENDING' },
      });
    }

    return { paymentUrl: result.paymentUrl, transactionId: result.transactionId };
  }

  // ── Handle Webhook ──────────────────────────────────────────────────

  async handleWebhook(
    providerName: 'cinetpay' | 'flutterwave',
    rawBody: string,
    signature: string,
  ) {
    const provider = this.getProvider(providerName);
    const result = provider.verifyWebhook(rawBody, signature);

    if (!result.valid || !result.payment) {
      this.logger.warn(`Invalid ${providerName} webhook signature`);
      return { received: false };
    }

    await this.processPaymentResult(result.payment);
    return { received: true };
  }

  // ── Verify Payment (manual check) ──────────────────────────────────

  async verifyPayment(transactionId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { transactionId },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const provider = this.getProvider(payment.provider as 'cinetpay' | 'flutterwave');
    const result = await provider.verifyPayment(transactionId);

    await this.processPaymentResult(result);

    return this.prisma.payment.findUnique({ where: { transactionId } });
  }

  // ── Process Payment Result (shared logic) ───────────────────────────

  private async processPaymentResult(result: PaymentResult) {
    const payment = await this.prisma.payment.findUnique({
      where: { transactionId: result.transactionId },
      include: { order: { include: { escrow: true } } },
    });

    if (!payment) {
      this.logger.warn(`Payment not found for txn ${result.transactionId}`);
      return;
    }

    // Update payment record
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: result.status,
        rawData: result.raw as any,
      },
    });

    // If payment succeeded, transition order to PAID and mark escrow HOLDING
    if (result.status === 'SUCCESS' && payment.order.status === 'PAYMENT_PENDING') {
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAID', paidAt: new Date() },
      });

      this.logger.log(`Payment confirmed for order ${payment.orderId}`);
    }
  }

  // ── Schedule Escrow Release (called when delivery is confirmed) ─────

  async scheduleEscrowRelease(orderId: string) {
    const escrow = await this.prisma.escrow.findUnique({
      where: { orderId },
    });
    if (!escrow || escrow.status !== 'HOLDING') return;

    const releaseAt = new Date(Date.now() + ESCROW_RELEASE_DELAY_MS);

    await this.prisma.escrow.update({
      where: { id: escrow.id },
      data: { status: 'RELEASE_SCHEDULED', releaseScheduledAt: releaseAt },
    });

    // Schedule Bull job: release funds 48h after delivery confirmation
    await this.escrowQueue.add(
      'release-escrow',
      { escrowId: escrow.id, orderId },
      { delay: ESCROW_RELEASE_DELAY_MS, jobId: `release-${escrow.id}` },
    );

    this.logger.log(
      `Escrow ${escrow.id} release scheduled at ${releaseAt.toISOString()}`,
    );
  }

  // ── Schedule Auto-Release (7 day fallback, called at DELIVERED) ─────

  async scheduleAutoRelease(orderId: string) {
    const escrow = await this.prisma.escrow.findUnique({
      where: { orderId },
    });
    if (!escrow || escrow.status !== 'HOLDING') return;

    await this.escrowQueue.add(
      'auto-release-escrow',
      { escrowId: escrow.id, orderId },
      { delay: ESCROW_AUTO_RELEASE_DELAY_MS, jobId: `auto-release-${escrow.id}` },
    );

    this.logger.log(
      `Auto-release job scheduled for escrow ${escrow.id} in 7 days`,
    );
  }

  // ── Open Dispute ────────────────────────────────────────────────────

  async openDispute(userId: string, dto: OpenDisputeDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { escrow: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.buyerId !== userId) {
      throw new ForbiddenException('Only the buyer can open a dispute');
    }
    if (!['DELIVERED', 'COMPLETED'].includes(order.status)) {
      throw new BadRequestException('Can only dispute after delivery');
    }

    // Move escrow to DISPUTED and cancel any scheduled release
    if (order.escrow && ['HOLDING', 'RELEASE_SCHEDULED'].includes(order.escrow.status)) {
      await this.prisma.escrow.update({
        where: { id: order.escrow.id },
        data: { status: 'DISPUTED', releaseScheduledAt: null },
      });

      // Remove scheduled Bull jobs
      const releaseJob = await this.escrowQueue.getJob(`release-${order.escrow.id}`);
      if (releaseJob) await releaseJob.remove();

      const autoReleaseJob = await this.escrowQueue.getJob(`auto-release-${order.escrow.id}`);
      if (autoReleaseJob) await autoReleaseJob.remove();
    }

    const dispute = await this.prisma.dispute.create({
      data: {
        orderId: dto.orderId,
        openedBy: userId,
        reason: dto.reason,
        status: 'OPEN',
      },
    });

    return dispute;
  }

  // ── Resolve Dispute (admin) ─────────────────────────────────────────

  async resolveDispute(
    disputeId: string,
    adminId: string,
    dto: ResolveDisputeDto,
  ) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { order: { include: { escrow: true } } },
    });

    if (!dispute) throw new NotFoundException('Dispute not found');
    if (dispute.status !== 'OPEN') {
      throw new BadRequestException('Dispute is already resolved');
    }

    const escrow = dispute.order.escrow;

    return this.prisma.$transaction(async (tx) => {
      // Update dispute
      const resolved = await tx.dispute.update({
        where: { id: disputeId },
        data: {
          status: dto.favorOf === 'buyer' ? 'RESOLVED_BUYER' : 'RESOLVED_SELLER',
          resolvedBy: adminId,
          resolution: dto.resolution,
          resolvedAt: new Date(),
        },
      });

      // Handle escrow based on resolution
      if (escrow) {
        if (dto.favorOf === 'buyer') {
          // Refund to buyer
          await tx.escrow.update({
            where: { id: escrow.id },
            data: { status: 'REFUNDED', releasedAt: new Date() },
          });

          // Trigger refund via payment provider
          const payment = await tx.payment.findFirst({
            where: { orderId: dispute.orderId, status: 'SUCCESS' },
          });
          if (payment) {
            const provider = this.getProvider(
              payment.provider as 'cinetpay' | 'flutterwave',
            );
            try {
              await provider.refund({
                transactionId: payment.transactionId,
                amount: payment.amount,
                reason: `Dispute resolved in favor of buyer: ${dto.resolution}`,
              });
            } catch (err) {
              this.logger.error(`Refund failed for payment ${payment.id}`, err);
            }
          }
        } else {
          // Release to seller
          await tx.escrow.update({
            where: { id: escrow.id },
            data: { status: 'RELEASED', releasedAt: new Date() },
          });
        }
      }

      return resolved;
    });
  }
}
