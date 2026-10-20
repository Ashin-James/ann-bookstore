/**
 * US Site Configuration
 * Locale: en-US, Currency: USD (prices stored as integer cents)
 */

export interface SupportedLanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  enabled: boolean;
}

export const SITE_CONFIG = {
  name: "Ann's Bookstore",
  locale: 'en-US',
  currency: 'USD',
  country: 'United States',
  allowInternational: false,
  internationalNotice: '[SHIPPING: confirm with Ann]',

  // Supported languages: English and Spanish enabled by default for US market
  supportedLanguages: [
    { code: 'en', name: 'English', nativeName: 'English', enabled: true },
    { code: 'es', name: 'Spanish', nativeName: 'Español', enabled: true },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', enabled: false },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', enabled: false },
  ] as SupportedLanguageConfig[],

  samplePriceDisclaimer: '[SAMPLE PRICE: Illustrative US demo price]',
  complianceMailingAddress: '[PHYSICAL MAILING ADDRESS: Ann’s Bookstore, P.O. Box 421, Portland, OR 97201]',
  unsubscribeNotice: 'You may unsubscribe at any time. View our Privacy Policy.',
};

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Universal money helper
 * Accepts integer cents and formats to US Currency (e.g. 1850 -> $18.50)
 */
export function money(cents: number): string {
  if (isNaN(cents)) return '$0.00';
  return usdFormatter.format(cents / 100);
}

/**
 * US Date Formatter: Month D, YYYY
 */
export function formatUSDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
