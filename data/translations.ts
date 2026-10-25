import enTranslations from './translations/en.json';
import { LanguageCode } from '@/src/config/languages';

export type Language = LanguageCode;
export type Translations = typeof enTranslations;

export { enTranslations };

// In-memory cache for dynamically loaded translations so we never load twice
const translationsCache: Record<string, Translations> = {
  en: enTranslations as Translations,
};

/**
 * Lazy loads a language JSON file with dynamic import.
 * Falls back to English for any missing key so no raw keys are ever shown.
 */
export async function loadTranslations(code: string): Promise<Translations> {
  if (translationsCache[code]) {
    return translationsCache[code];
  }

  try {
    const raw = await import(`@/data/translations/${code}.json`);
    const loaded = raw.default || raw;
    // Merge with English fallback
    const merged = { ...enTranslations, ...loaded } as Translations;
    translationsCache[code] = merged;
    return merged;
  } catch (error) {
    console.warn(`Failed to dynamically load translations for "${code}", using English fallback.`, error);
    return enTranslations as Translations;
  }
}

/**
 * Synchronous accessor for already loaded translations (defaults to English)
 */
export function getLoadedTranslations(code: string): Translations {
  return translationsCache[code] || enTranslations as Translations;
}

/**
 * Backwards compatibility map with lazy fallback
 */
export const translations: Record<string, Translations> = new Proxy(
  translationsCache as Record<string, Translations>,
  {
    get(target, prop: string) {
      if (target[prop]) return target[prop];
      return enTranslations;
    },
  }
);
