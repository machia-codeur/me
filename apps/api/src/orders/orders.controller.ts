import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAccessGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAccessGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  create(
    @CurrentUser('id') buyerId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(buyerId, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (lifecycle transition)' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.ordersService.findOne(id, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List my orders as buyer or seller' })
  @ApiQuery({ name: 'role', enum: ['buyer', 'seller'] })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'take', required: false })
  findMyOrders(
    @CurrentUser('id') userId: string,
    @Query('role') role: 'buyer' | 'seller' = 'buyer',
    @Query('cursor') cursor?: string,
    @Query('take') take?: number,
  ) {
    return this.ordersService.findMyOrders(userId, role, cursor, take);
  }
}
