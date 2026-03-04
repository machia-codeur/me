import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';

interface EscrowJobData {
  escrowId: string;
  orderId: string;
}

@Processor('escrow')
export class EscrowProcessor {
  private readonly logger = new Logger(EscrowProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Release escrow 48h after delivery confirmation by buyer.
   * Only releases if escrow is still in RELEASE_SCHEDULED status
   * (not DISPUTED).
   */
  @Process('release-escrow')
  async handleReleaseEscrow(job: Job<EscrowJobData>) {
    const { escrowId, orderId } = job.data;
    this.logger.log(`Processing escrow release for ${escrowId}`);

    const escrow = await this.prisma.escrow.findUnique({
      where: { id: escrowId },
    });

    if (!escrow) {
      this.logger.warn(`Escrow ${escrowId} not found, skipping`);
      return;
    }

    // Only release if still scheduled (not disputed/already released)
    if (escrow.status !== 'RELEASE_SCHEDULED') {
      this.logger.log(
        `Escrow ${escrowId} is in status ${escrow.status}, skipping release`,
      );
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.escrow.update({
        where: { id: escrowId },
        data: { status: 'RELEASED', releasedAt: new Date() },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
    });

    this.logger.log(`Escrow ${escrowId} released, order ${orderId} completed`);
  }

  /**
   * Auto-release escrow 7 days after delivery if no dispute was opened.
   * Fallback safety net — if the buyer doesn't explicitly complete the
   * order and no dispute is filed, funds are released to the seller.
   */
  @Process('auto-release-escrow')
  async handleAutoReleaseEscrow(job: Job<EscrowJobData>) {
    const { escrowId, orderId } = job.data;
    this.logger.log(`Processing auto-release for escrow ${escrowId}`);

    const escrow = await this.prisma.escrow.findUnique({
      where: { id: escrowId },
    });

    if (!escrow) {
      this.logger.warn(`Escrow ${escrowId} not found, skipping`);
      return;
    }

    // Only auto-release if still HOLDING or RELEASE_SCHEDULED
    if (!['HOLDING', 'RELEASE_SCHEDULED'].includes(escrow.status)) {
      this.logger.log(
        `Escrow ${escrowId} is in status ${escrow.status}, skipping auto-release`,
      );
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.escrow.update({
        where: { id: escrowId },
        data: { status: 'RELEASED', releasedAt: new Date() },
      });

      // Only complete the order if it's in DELIVERED status
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (order && order.status === 'DELIVERED') {
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'COMPLETED', completedAt: new Date() },
        });
      }
    });

    this.logger.log(
      `Escrow ${escrowId} auto-released after 7-day window, order ${orderId}`,
    );
  }
}
