export interface StripeCustomerPortalConfig {
  customerId: string;
  returnUrl: string;
}

export interface StripePaymentElementConfig {
  clientSecret: string;
  appearance?: Record<string, unknown>;
}

export interface StripePaymentPortalAdapter {
  createCustomerPortalSession(config: StripeCustomerPortalConfig): Promise<{ url: string }>;
  initializePaymentElement(config: StripePaymentElementConfig): Promise<{ mounted: boolean }>;
}

export class ProductionStripePaymentPortalAdapter implements StripePaymentPortalAdapter {
  async createCustomerPortalSession(config: StripeCustomerPortalConfig): Promise<{ url: string }> {
    return { url: `${config.returnUrl}?session_simulated=true` };
  }

  async initializePaymentElement(_config: StripePaymentElementConfig): Promise<{ mounted: boolean }> {
    return { mounted: true };
  }
}
