/**
 * US Shipping Configuration
 * Placeholders only: flat rate, free shipping threshold in cents, carrier tracking links.
 */

export const SHIPPING_CONFIG = {
  // Stored in integer cents ($35.00 threshold = 3500 cents)
  freeShippingThresholdCents: 3500,

  // Flat rate shipping in integer cents ($4.00 = 400 cents)
  standardFlatRateCents: 400,

  estimateText: '[DELIVERY ESTIMATE: 3–5 business days via standard carrier]',
  freeShippingNotice: 'Complimentary shipping on US orders over $35',
  internationalShippingNotice: '[SHIPPING: confirm with Ann]',

  /**
   * Carrier tracking link generators
   */
  trackingLinks: {
    usps: (trackingNumber: string) =>
      `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(trackingNumber)}`,
    ups: (trackingNumber: string) =>
      `https://www.ups.com/track?tracknum=${encodeURIComponent(trackingNumber)}`,
    fedex: (trackingNumber: string) =>
      `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(trackingNumber)}`,
  },

  buildCarrierTrackingUrl(carrier: 'usps' | 'ups' | 'fedex', trackingNumber: string): string {
    const builder = this.trackingLinks[carrier];
    if (builder) return builder(trackingNumber);
    return this.trackingLinks.usps(trackingNumber);
  },
};
