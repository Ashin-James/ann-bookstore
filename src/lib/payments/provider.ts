/**
 * Payment Provider Interface & Adapters
 * Demo provider requires zero keys, displays "DEMO: no payment is taken", and omits card fields.
 * Stripe Payment Element stub supports Cards, Apple Pay, Google Pay, and Link.
 */

export interface PaymentIntentResult {
  clientSecret?: string;
  orderId: string;
  status: 'demo_authorized' | 'requires_action' | 'succeeded';
  provider: 'demo' | 'stripe' | 'paypal';
  message: string;
}

export interface PaymentProvider {
  name: string;
  createPaymentIntent: (orderId: string, amountCents: number) => Promise<PaymentIntentResult>;
  confirmPayment: (paymentIntentId: string) => Promise<{ success: boolean; transactionId: string }>;
}

/**
 * Demo Payment Provider
 * Operates offline with zero external credentials or API charges.
 */
export const demoPaymentProvider: PaymentProvider = {
  name: 'Demo Provider (Zero Charge)',
  async createPaymentIntent(orderId: string, _amountCents: number): Promise<PaymentIntentResult> {
    return {
      orderId,
      status: 'demo_authorized',
      provider: 'demo',
      message: 'DEMO: no payment is taken and no card fields are required.',
    };
  },
  async confirmPayment(_paymentIntentId: string) {
    return {
      success: true,
      transactionId: `DEMO_TXN_${Date.now()}`,
    };
  },
};

/**
 * Stripe Payment Element Adapter Stub
 * Prepares clientSecret for Stripe Payment Element (Cards, Apple Pay, Google Pay, Link).
 */
export const stripePaymentProviderStub: PaymentProvider = {
  name: 'Stripe Payment Element (Cards, Apple Pay, Google Pay, Link)',
  async createPaymentIntent(orderId: string, _amountCents: number): Promise<PaymentIntentResult> {
    return {
      orderId,
      clientSecret: 'pi_mock_secret_stub',
      status: 'requires_action',
      provider: 'stripe',
      message: 'Stripe Payment Element stub prepared.',
    };
  },
  async confirmPayment(paymentIntentId: string) {
    return {
      success: true,
      transactionId: `STRIPE_${paymentIntentId}`,
    };
  },
};

/**
 * PayPal Optional Adapter Stub
 */
export const paypalPaymentProviderStub: PaymentProvider = {
  name: 'PayPal Checkout',
  async createPaymentIntent(orderId: string): Promise<PaymentIntentResult> {
    return {
      orderId,
      status: 'requires_action',
      provider: 'paypal',
      message: 'PayPal checkout placeholder stub.',
    };
  },
  async confirmPayment(paymentIntentId: string) {
    return {
      success: true,
      transactionId: `PAYPAL_${paymentIntentId}`,
    };
  },
};
