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

export interface FlutterwaveConfig {
  publicKey: string;
  secretKey: string;
  encryptionKey: string;
  webhookSecret: string;
  baseUrl?: string;
}

/**
 * Flutterwave v3 integration — multi-country Africa:
 * Mobile Money, cards, bank transfers across CI, SN, GH, NG, KE, etc.
 */
export class FlutterwaveService implements PaymentProvider {
  readonly providerName = 'flutterwave' as const;
  private readonly client: AxiosInstance;
  private readonly config: FlutterwaveConfig;

  constructor(config: FlutterwaveConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.flutterwave.com/v3',
      headers: {
        Authorization: `Bearer ${config.secretKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // ── Init Payment ────────────────────────────────────────────────────

  async initPayment(params: InitPaymentParams): Promise<InitPaymentResult> {
    const payload = {
      tx_ref: params.orderId,
      amount: params.amount,
      currency: params.currency,
      redirect_url: params.returnUrl,
      payment_options: params.channels?.join(',') || 'mobilemoney,card',
      customer: {
        email: params.customerEmail,
        name: params.customerName,
        phonenumber: params.customerPhone || '',
      },
      customizations: {
        title: 'Cowri Marketplace',
        description: params.description,
      },
      meta: {
        ...params.metadata,
        callback_url: params.callbackUrl,
      },
    };

    const { data } = await this.client.post('/payments', payload);

    if (data.status !== 'success') {
      throw new Error(`Flutterwave init failed: ${data.message}`);
    }

    return {
      status: 'PENDING',
      transactionId: params.orderId,
      amount: params.amount,
      currency: params.currency,
      provider: 'flutterwave',
      paymentUrl: data.data.link,
    };
  }

  // ── Verify Payment ──────────────────────────────────────────────────

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    // Flutterwave uses their internal ID for verification;
    // first find it by tx_ref
    const { data: txData } = await this.client.get(
      `/transactions/verify_by_reference?tx_ref=${transactionId}`,
    );

    const tx = txData.data;

    return {
      status: this.mapStatus(tx?.status),
      transactionId,
      amount: tx?.amount || 0,
      currency: tx?.currency || 'XOF',
      provider: 'flutterwave',
      raw: tx,
    };
  }

  // ── Refund ──────────────────────────────────────────────────────────

  async refund(params: RefundParams): Promise<PaymentResult> {
    // Need the Flutterwave internal transaction ID
    const verifyResult = await this.verifyPayment(params.transactionId);
    const flwId = (verifyResult.raw as any)?.id;

    if (!flwId) {
      return {
        status: 'FAILED',
        transactionId: params.transactionId,
        amount: params.amount || 0,
        currency: 'XOF',
        provider: 'flutterwave',
      };
    }

    const { data } = await this.client.post(`/transactions/${flwId}/refund`, {
      amount: params.amount,
      comments: params.reason || 'Customer refund',
    });

    return {
      status: data.status === 'success' ? 'REFUNDED' : 'FAILED',
      transactionId: params.transactionId,
      amount: params.amount || (verifyResult.raw as any)?.amount || 0,
      currency: (verifyResult.raw as any)?.currency || 'XOF',
      provider: 'flutterwave',
      raw: data,
    };
  }

  // ── Webhook ─────────────────────────────────────────────────────────

  verifyWebhook(payload: unknown, signature: string): WebhookVerifyResult {
    const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const valid = verifyHmacSignature(
      body,
      signature,
      this.config.webhookSecret,
      'sha256',
    );

    if (!valid) return { valid: false };

    const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
    const data = parsed as Record<string, any>;
    const eventData = data.data || {};

    return {
      valid: true,
      event: data.event || 'charge.completed',
      payment: {
        status: this.mapStatus(eventData.status),
        transactionId: eventData.tx_ref || '',
        amount: eventData.amount || 0,
        currency: eventData.currency || 'XOF',
        provider: 'flutterwave',
        raw: data,
      },
    };
  }

  // ── Helpers ─────────────────────────────────────────────────────────

  private mapStatus(flwStatus: string): PaymentStatus {
    switch (flwStatus) {
      case 'successful':
        return 'SUCCESS';
      case 'failed':
        return 'FAILED';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return 'PENDING';
    }
  }
}
