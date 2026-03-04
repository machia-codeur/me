import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Inject, forwardRef } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';

/** Valid status transitions */
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  CREATED: [OrderStatus.PAYMENT_PENDING, OrderStatus.CANCELLED],
  PAYMENT_PENDING: [OrderStatus.PAID, OrderStatus.CANCELLED],
  PAID: [OrderStatus.PROCESSING],
  PROCESSING: [OrderStatus.SHIPPED],
  SHIPPED: [OrderStatus.DELIVERED],
  DELIVERED: [OrderStatus.COMPLETED],
  COMPLETED: [],
  CANCELLED: [],
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
  ) {}

  // ── Generate order number: COWRI-CI-2026-XXXXX ──────────────────────

  private async generateOrderNumber(countryCode: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `COWRI-${countryCode || 'XX'}-${year}-`;

    // Get the latest order number with this prefix to increment
    const lastOrder = await this.prisma.order.findFirst({
      where: { orderNumber: { startsWith: prefix } },
      orderBy: { createdAt: 'desc' },
      select: { orderNumber: true },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSeq = parseInt(lastOrder.orderNumber.split('-').pop() || '0', 10);
      sequence = lastSeq + 1;
    }

    return `${prefix}${String(sequence).padStart(5, '0')}`;
  }

  // ── Create Order ───────────────────────────────────────────────────

  async create(buyerId: string, dto: CreateOrderDto) {
    // Fetch all products and variants for the items
    const productIds = [...new Set(dto.items.map((i) => i.productId))];
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, status: 'ACTIVE' },
      include: { variants: true, seller: { select: { id: true, country: true } } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products are not available');
    }

    // All items must belong to the same seller
    const sellerIds = [...new Set(products.map((p) => p.sellerId))];
    if (sellerIds.length !== 1) {
      throw new BadRequestException('All items in an order must be from the same seller');
    }
    const sellerId = sellerIds[0];
    const sellerCountry = products[0].seller.country;

    if (buyerId === sellerId) {
      throw new BadRequestException('You cannot buy your own products');
    }

    // Validate quantities and compute totals
    let totalFCFA = 0;
    let totalUSD = 0;

    const orderItemsData = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) {
          throw new BadRequestException(
            `Variant ${item.variantId} not found for product ${product.title}`,
          );
        }
        if (variant.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for variant ${variant.size}/${variant.color} of ${product.title}`,
          );
        }
      }

      totalFCFA += product.priceFCFA * item.quantity;
      totalUSD += product.priceUSD * item.quantity;

      return {
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        unitPriceFCFA: product.priceFCFA,
        unitPriceUSD: product.priceUSD,
      };
    });

    const orderNumber = await this.generateOrderNumber(sellerCountry || 'XX');

    // Create order, order items, and escrow in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          buyerId,
          sellerId,
          totalFCFA,
          totalUSD,
          shippingAddress: dto.shippingAddress,
          items: { createMany: { data: orderItemsData } },
        },
        include: { items: true },
      });

      // Create escrow — funds held until delivery confirmed
      await tx.escrow.create({
        data: {
          orderId: createdOrder.id,
          holderId: buyerId,
          amountFCFA: totalFCFA,
          amountUSD: totalUSD,
          status: 'HOLDING',
        },
      });

      // Decrement variant quantities
      for (const item of dto.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { quantity: { decrement: item.quantity } },
          });
        }
      }

      return createdOrder;
    });

    return this.findOne(order.id, buyerId);
  }

  // ── Update Order Status ─────────────────────────────────────────────

  async updateStatus(
    orderId: string,
    userId: string,
    dto: UpdateOrderStatusDto,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { escrow: true },
    });

    if (!order) throw new NotFoundException('Order not found');

    // Only buyer or seller can update status
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new ForbiddenException('Not authorized to update this order');
    }

    // Validate transition
    const allowed = STATUS_TRANSITIONS[order.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${dto.status}`,
      );
    }

    // Role-based transition rules
    const isBuyer = order.buyerId === userId;
    const isSeller = order.sellerId === userId;

    if (dto.status === OrderStatus.PROCESSING && !isSeller) {
      throw new ForbiddenException('Only the seller can mark as PROCESSING');
    }
    if (dto.status === OrderStatus.SHIPPED && !isSeller) {
      throw new ForbiddenException('Only the seller can mark as SHIPPED');
    }
    if (dto.status === OrderStatus.DELIVERED && !isBuyer) {
      throw new ForbiddenException('Only the buyer can confirm delivery');
    }
    if (dto.status === OrderStatus.COMPLETED && !isBuyer) {
      throw new ForbiddenException('Only the buyer can complete the order');
    }

    const updateData: any = {
      status: dto.status,
    };

    if (dto.status === OrderStatus.PAID) updateData.paidAt = new Date();
    if (dto.status === OrderStatus.SHIPPED) {
      updateData.shippedAt = new Date();
      if (dto.trackingNumber) updateData.trackingNumber = dto.trackingNumber;
    }
    if (dto.status === OrderStatus.DELIVERED) updateData.deliveredAt = new Date();
    if (dto.status === OrderStatus.COMPLETED) updateData.completedAt = new Date();

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.order.update({
        where: { id: orderId },
        data: updateData,
      });

      // Refund escrow on cancellation after payment
      if (
        dto.status === OrderStatus.CANCELLED &&
        order.escrow &&
        order.status === OrderStatus.PAYMENT_PENDING
      ) {
        await tx.escrow.update({
          where: { id: order.escrow.id },
          data: { status: 'REFUNDED', releasedAt: new Date() },
        });
      }

      return result;
    });

    // After delivery confirmed: schedule 48h escrow release + 7d auto-release
    if (dto.status === OrderStatus.DELIVERED) {
      await this.paymentsService.scheduleAutoRelease(orderId);
    }

    // Buyer explicitly completes: schedule 48h escrow release
    if (dto.status === OrderStatus.COMPLETED) {
      await this.paymentsService.scheduleEscrowRelease(orderId);
    }

    return updated;
  }

  // ── Find One ────────────────────────────────────────────────────────

  async findOne(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { id: true, title: true, images: { take: 1 } } },
            variant: true,
          },
        },
        escrow: true,
        buyer: { select: { id: true, firstName: true, lastName: true } },
        seller: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new ForbiddenException('Not authorized to view this order');
    }

    return order;
  }

  // ── List My Orders ──────────────────────────────────────────────────

  async findMyOrders(
    userId: string,
    role: 'buyer' | 'seller',
    cursor?: string,
    take = 20,
  ) {
    const where =
      role === 'buyer' ? { buyerId: userId } : { sellerId: userId };

    const orders = await this.prisma.order.findMany({
      where,
      take: take + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: { select: { id: true, title: true, images: { take: 1 } } },
          },
        },
        escrow: { select: { status: true } },
      },
    });

    const hasNextPage = orders.length > take;
    const items = hasNextPage ? orders.slice(0, take) : orders;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    return { items, nextCursor, hasNextPage };
  }
}
