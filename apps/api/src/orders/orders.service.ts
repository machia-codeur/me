import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { OrderStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto, UpdateOrderStatusDto } from "./dto";

// Valid status transitions
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  CREATED: [OrderStatus.PAYMENT_PENDING, OrderStatus.CANCELLED],
  PAYMENT_PENDING: [OrderStatus.PAID, OrderStatus.CANCELLED],
  PAID: [OrderStatus.PROCESSING],
  PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  SHIPPED: [OrderStatus.DELIVERED],
  DELIVERED: [OrderStatus.COMPLETED, OrderStatus.REFUNDED],
  COMPLETED: [],
  CANCELLED: [],
  REFUNDED: [],
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Generate Order Number ──────────────────────────────────
  // Format: COWRI-CI-2026-00001

  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `COWRI-CI-${year}-`;

    const lastOrder = await this.prisma.order.findFirst({
      where: { orderNumber: { startsWith: prefix } },
      orderBy: { orderNumber: "desc" },
      select: { orderNumber: true },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastNum = parseInt(lastOrder.orderNumber.split("-").pop()!, 10);
      sequence = lastNum + 1;
    }

    return `${prefix}${String(sequence).padStart(5, "0")}`;
  }

  // ── Create Order ───────────────────────────────────────────

  async create(buyerId: string, dto: CreateOrderDto) {
    // Verify address belongs to buyer
    const address = await this.prisma.address.findUnique({
      where: { id: dto.shippingAddressId },
    });
    if (!address || address.userId !== buyerId) {
      throw new BadRequestException("Invalid shipping address");
    }

    // Fetch products and validate stock
    const productIds = dto.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException(
        "One or more products are unavailable",
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Check stock and compute totals
    let subtotal = new Decimal(0);
    const orderItems = dto.items.map((item) => {
      const product = productMap.get(item.productId)!;

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name}"`,
        );
      }

      const lineTotal = new Decimal(product.priceFcfa).mul(item.quantity);
      subtotal = subtotal.add(lineTotal);

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: new Decimal(product.priceFcfa),
        total: lineTotal,
      };
    });

    const total = subtotal; // shipping/tax can be added later

    const orderNumber = await this.generateOrderNumber();

    // Create order + items + decrement stock in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          buyerId,
          shippingAddressId: dto.shippingAddressId,
          subtotal,
          total,
          notes: dto.notes,
          items: { createMany: { data: orderItems } },
        },
        include: {
          items: { include: { product: { select: { name: true } } } },
          shippingAddress: true,
        },
      });

      // Decrement stock
      for (const item of dto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return created;
    });

    return order;
  }

  // ── Update Status ──────────────────────────────────────────

  async updateStatus(
    orderId: string,
    userId: string,
    dto: UpdateOrderStatusDto,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException("Order not found");

    // Validate transition
    const allowed = STATUS_TRANSITIONS[order.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${dto.status}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Handle escrow on PAID status
      if (dto.status === OrderStatus.PAID) {
        await tx.escrowTransaction.create({
          data: {
            orderId: order.id,
            amount: order.total,
            currency: order.currency,
            status: "HELD",
          },
        });
      }

      // Release escrow on COMPLETED (delivery confirmed)
      if (dto.status === OrderStatus.COMPLETED) {
        await tx.escrowTransaction.update({
          where: { orderId: order.id },
          data: { status: "RELEASED", releasedAt: new Date() },
        });
      }

      // Refund escrow on REFUNDED
      if (dto.status === OrderStatus.REFUNDED) {
        await tx.escrowTransaction.update({
          where: { orderId: order.id },
          data: { status: "REFUNDED", refundedAt: new Date() },
        });
      }

      // Restore stock on CANCELLED
      if (dto.status === OrderStatus.CANCELLED) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return tx.order.update({
        where: { id: orderId },
        data: { status: dto.status },
        include: {
          items: { include: { product: { select: { name: true } } } },
          escrow: true,
        },
      });
    });
  }

  // ── Find buyer's orders ────────────────────────────────────

  async findByBuyer(buyerId: string) {
    return this.prisma.order.findMany({
      where: { buyerId },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: { select: { name: true, images: true } } } },
        escrow: true,
      },
    });
  }

  // ── Find one ───────────────────────────────────────────────

  async findOne(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { name: true, images: true, sellerId: true } },
          },
        },
        shippingAddress: true,
        payment: true,
        escrow: true,
      },
    });

    if (!order) throw new NotFoundException("Order not found");

    // Only allow buyer, seller of an item, or admin to view
    const isItemSeller = order.items.some(
      (item) => item.product.sellerId === userId,
    );
    if (order.buyerId !== userId && !isItemSeller) {
      throw new ForbiddenException();
    }

    return order;
  }

  // ── Confirm Delivery (buyer) ───────────────────────────────

  async confirmDelivery(orderId: string, buyerId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException("Order not found");
    if (order.buyerId !== buyerId) throw new ForbiddenException();
    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException("Order must be in DELIVERED status");
    }

    return this.updateStatus(orderId, buyerId, {
      status: OrderStatus.COMPLETED,
    });
  }
}
