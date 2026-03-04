// ─── Standardized Payment Result ─────────────────────────────────────────────

export type PaymentStatus =
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED';

export interface PaymentResult {
  status: PaymentStatus;
  transactionId: string;
  amount: number;
  currency: string;
  provider: 'cinetpay' | 'flutterwave';
  raw?: Record<string, unknown>;
}

// ─── Init Payment ────────────────────────────────────────────────────────────

export interface InitPaymentParams {
  amount: number;
  currency: 'XOF' | 'USD' | 'EUR';
  orderId: string;
  description: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  callbackUrl: string;
  returnUrl: string;
  channels?: string[];
  metadata?: Record<string, string>;
}

export interface InitPaymentResult {
  status: PaymentStatus;
  transactionId: string;
  amount: number;
  currency: string;
  provider: 'cinetpay' | 'flutterwave';
  paymentUrl: string;
  paymentToken?: string;
}

// ─── Refund ──────────────────────────────────────────────────────────────────

export interface RefundParams {
  transactionId: string;
  amount?: number; // partial refund
  reason?: string;
}

// ─── Webhook ─────────────────────────────────────────────────────────────────

export interface WebhookVerifyResult {
  valid: boolean;
  event?: string;
  payment?: PaymentResult;
}

// ─── Provider Interface ──────────────────────────────────────────────────────

export interface PaymentProvider {
  readonly providerName: 'cinetpay' | 'flutterwave';

  initPayment(params: InitPaymentParams): Promise<InitPaymentResult>;
  verifyPayment(transactionId: string): Promise<PaymentResult>;
  refund(params: RefundParams): Promise<PaymentResult>;
  verifyWebhook(payload: unknown, signature: string): WebhookVerifyResult;
}
