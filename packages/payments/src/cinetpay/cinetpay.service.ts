import axios, { AxiosInstance } from 'axios';
import {
  InitPaymentParams,
  InitPaymentResult,
  PaymentProvider,
  PaymentResult,
  PaymentStatus,
  RefundParams,
  WebhookVerifyResult,
} from '../common/types';
import { verifyHmacSignature } from '../common/hmac';

export interface CinetPayConfig {
  apiKey: string;
  siteId: string;
  secretKey: string;
  baseUrl?: string;
}

/**
 * CinetPay v2 integration for Côte d'Ivoire mobile money:
 * Orange Money, MTN MoMo, Wave, Moov Money
 */
export class CinetPayService implements PaymentProvider {
  readonly providerName = 'cinetpay' as const;
  private readonly client: AxiosInstance;
  private readonly config: CinetPayConfig;

  constructor(config: CinetPayConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api-checkout.cinetpay.com/v2',
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── Init Payment ────────────────────────────────────────────────────

  async initPayment(params: InitPaymentParams): Promise<InitPaymentResult> {
    const payload = {
      apikey: this.config.apiKey,
      site_id: this.config.siteId,
      transaction_id: params.orderId,
      amount: params.amount,
      currency: params.currency,
      description: params.description,
      notify_url: params.callbackUrl,
      return_url: params.returnUrl,
      channels: params.channels?.join(',') || 'MOBILE_MONEY',
      customer_name: params.customerName,
      customer_email: params.customerEmail,
      customer_phone_number: params.customerPhone || '',
      metadata: JSON.stringify(params.metadata || {}),
    };

    const { data } = await this.client.post('/payment', payload);

    if (data.code !== '201') {
      throw new Error(`CinetPay init failed: ${data.message}`);
    }

    return {
      status: 'PENDING',
      transactionId: params.orderId,
      amount: params.amount,
      currency: params.currency,
      provider: 'cinetpay',
      paymentUrl: data.data.payment_url,
      paymentToken: data.data.payment_token,
    };
  }

  // ── Verify Payment ──────────────────────────────────────────────────

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    const { data } = await this.client.post('/payment/check', {
      apikey: this.config.apiKey,
      site_id: this.config.siteId,
      transaction_id: transactionId,
    });

    return {
      status: this.mapStatus(data.data?.status),
      transactionId,
      amount: data.data?.amount || 0,
      currency: data.data?.currency || 'XOF',
      provider: 'cinetpay',
      raw: data,
    };
  }

  // ── Refund ──────────────────────────────────────────────────────────

  async refund(params: RefundParams): Promise<PaymentResult> {
    const { data } = await this.client.post('/payment/refund', {
      apikey: this.config.apiKey,
      site_id: this.config.siteId,
      transaction_id: params.transactionId,
      amount: params.amount,
      reason: params.reason || 'Customer refund',
    });

    return {
      status: data.code === '00' ? 'REFUNDED' : 'FAILED',
      transactionId: params.transactionId,
      amount: params.amount || 0,
      currency: 'XOF',
      provider: 'cinetpay',
      raw: data,
    };
  }

  // ── Webhook ─────────────────────────────────────────────────────────

  verifyWebhook(payload: unknown, signature: string): WebhookVerifyResult {
    const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const valid = verifyHmacSignature(body, signature, this.config.secretKey);

    if (!valid) return { valid: false };

    const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
    const data = parsed as Record<string, any>;

    return {
      valid: true,
      event: 'payment.complete',
      payment: {
        status: this.mapStatus(data.cpm_result),
        transactionId: data.cpm_trans_id || '',
        amount: Number(data.cpm_amount) || 0,
        currency: data.cpm_currency || 'XOF',
        provider: 'cinetpay',
        raw: data,
      },
    };
  }

  // ── Helpers ─────────────────────────────────────────────────────────

  private mapStatus(cinetpayStatus: string): PaymentStatus {
    switch (cinetpayStatus) {
      case '00':
      case 'ACCEPTED':
        return 'SUCCESS';
      case 'REFUSED':
      case 'ERROR':
        return 'FAILED';
      case 'CANCELLED':
        return 'CANCELLED';
      default:
        return 'PENDING';
    }
  }
}
