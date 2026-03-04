import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAccessGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { InitPaymentDto, OpenDisputeDto, ResolveDisputeDto } from './dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ── Init Payment ────────────────────────────────────────────────────

  @Post('init')
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate payment for an order' })
  initPayment(
    @CurrentUser('id') userId: string,
    @Body() dto: InitPaymentDto,
  ) {
    return this.paymentsService.initPayment(userId, dto);
  }

  // ── Verify Payment ──────────────────────────────────────────────────

  @Post('verify/:transactionId')
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually verify payment status' })
  verifyPayment(@Param('transactionId') transactionId: string) {
    return this.paymentsService.verifyPayment(transactionId);
  }

  // ── Webhooks (no auth — verified via HMAC signature) ────────────────

  @Post('webhook/cinetpay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'CinetPay webhook endpoint' })
  async cinetpayWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-cinetpay-signature') signature: string,
  ) {
    const rawBody = req.rawBody?.toString() || JSON.stringify(req.body);
    return this.paymentsService.handleWebhook('cinetpay', rawBody, signature || '');
  }

  @Post('webhook/flutterwave')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Flutterwave webhook endpoint' })
  async flutterwaveWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('verif-hash') signature: string,
  ) {
    const rawBody = req.rawBody?.toString() || JSON.stringify(req.body);
    return this.paymentsService.handleWebhook('flutterwave', rawBody, signature || '');
  }

  // ── Disputes ────────────────────────────────────────────────────────

  @Post('disputes')
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Open a dispute on an order (buyer only)' })
  openDispute(
    @CurrentUser('id') userId: string,
    @Body() dto: OpenDisputeDto,
  ) {
    return this.paymentsService.openDispute(userId, dto);
  }

  @Post('disputes/:id/resolve')
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resolve a dispute (admin only)' })
  resolveDispute(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.paymentsService.resolveDispute(id, adminId, dto);
  }
}
