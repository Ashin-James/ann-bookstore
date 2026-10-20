/**
 * US Tax Configuration
 * Per-state rate table is EMPTY by default and marked [TAX: confirm with Ann's accountant].
 * Structured so Stripe Tax or another automated tax calculation engine can replace it seamlessly.
 */

export const TAX_CONFIG = {
  notice: "[TAX: confirm with Ann's accountant]",
  // Empty by default — no invented rates
  stateRates: {} as Record<string, number>,
};

/**
 * Calculates estimated tax in integer cents based on state code and taxable subtotal
 * Returns 0 by default when rate table is unpopulated.
 */
export function calculateEstimatedTax(stateCode: string, taxableSubtotalCents: number): number {
  if (!stateCode || taxableSubtotalCents <= 0) return 0;
  const rate = TAX_CONFIG.stateRates[stateCode.toUpperCase()] ?? 0;
  return Math.round(taxableSubtotalCents * rate);
}
