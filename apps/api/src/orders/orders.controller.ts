import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles, RolesGuard } from "../auth/guards/roles.guard";
import { CreateOrderDto, UpdateOrderStatusDto } from "./dto";
import { OrdersService } from "./orders.service";

@Controller("orders")
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles("BUYER", "ADMIN")
  create(@Req() req: Request, @Body() dto: CreateOrderDto) {
    return this.orders.create((req.user as any).id, dto);
  }

  @Get()
  findMyOrders(@Req() req: Request) {
    return this.orders.findByBuyer((req.user as any).id);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Req() req: Request) {
    return this.orders.findOne(id, (req.user as any).id);
  }

  @Patch(":id/status")
  @UseGuards(RolesGuard)
  @Roles("SELLER", "ADMIN")
  updateStatus(
    @Param("id") id: string,
    @Req() req: Request,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orders.updateStatus(id, (req.user as any).id, dto);
  }

  @Post(":id/confirm-delivery")
  @UseGuards(RolesGuard)
  @Roles("BUYER", "ADMIN")
  confirmDelivery(@Param("id") id: string, @Req() req: Request) {
    return this.orders.confirmDelivery(id, (req.user as any).id);
  }
}
