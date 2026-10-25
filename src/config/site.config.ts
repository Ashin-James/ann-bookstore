import { SUPPORTED_LANGUAGES, LanguageConfig } from './languages';

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
  internationalNotice: 'International orders: Please contact Ann directly to arrange delivery.',

  // 14 supported languages from languages.ts
  supportedLanguages: SUPPORTED_LANGUAGES.map((l: LanguageConfig) => ({
    code: l.code,
    name: l.name,
    nativeName: l.nativeName,
    enabled: true,
  })) as SupportedLanguageConfig[],

  samplePriceDisclaimer: 'Illustrative US demo price (USD)',
  complianceMailingAddress: 'Ann’s Bookstore · Studio & Mail: P.O. Box 421, Portland, OR 97201',
  unsubscribeNotice: 'You may unsubscribe at any time. View our Privacy Policy.',
};

/**
 * Universal money helper
 * Accepts integer cents and formats to US Currency (USD), formatted per specified locale (defaults to en-US)
 */
export function money(cents: number, locale = 'en-US'): string {
  if (isNaN(cents)) return '$0.00';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

/**
 * Universal Date Formatter per locale
 */
export function formatUSDate(date: string | Date, locale = 'en-US'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return String(date);
  try {
    return new Intl.DateTimeFormat(locale, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return d.toLocaleDateString(locale);
  }
}
