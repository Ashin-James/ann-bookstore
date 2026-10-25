export type Direction = 'ltr' | 'rtl';

export interface LanguageConfig {
  code: string;
  nativeName: string;
  name: string;
  direction: Direction;
  fontStack: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'en',
    nativeName: 'English',
    name: 'English',
    direction: 'ltr',
    fontStack: 'var(--font-sans), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  {
    code: 'es',
    nativeName: 'Español',
    name: 'Spanish',
    direction: 'ltr',
    fontStack: 'var(--font-sans), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  {
    code: 'fr',
    nativeName: 'Français',
    name: 'French',
    direction: 'ltr',
    fontStack: 'var(--font-sans), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  {
    code: 'de',
    nativeName: 'Deutsch',
    name: 'German',
    direction: 'ltr',
    fontStack: 'var(--font-sans), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  {
    code: 'pt-BR',
    nativeName: 'Português (Brasil)',
    name: 'Portuguese (Brazil)',
    direction: 'ltr',
    fontStack: 'var(--font-sans), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  {
    code: 'it',
    nativeName: 'Italiano',
    name: 'Italian',
    direction: 'ltr',
    fontStack: 'var(--font-sans), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  {
    code: 'hi',
    nativeName: 'हिन्दी',
    name: 'Hindi',
    direction: 'ltr',
    fontStack: "'Noto Sans Devanagari', 'Kohinoor Devanagari', system-ui, -apple-system, sans-serif",
  },
  {
    code: 'ml',
    nativeName: 'മലയാളം',
    name: 'Malayalam',
    direction: 'ltr',
    fontStack: "'Noto Sans Malayalam', 'Kartika', system-ui, -apple-system, sans-serif",
  },
  {
    code: 'ta',
    nativeName: 'தமிழ்',
    name: 'Tamil',
    direction: 'ltr',
    fontStack: "'Noto Sans Tamil', 'Latha', system-ui, -apple-system, sans-serif",
  },
  {
    code: 'ar',
    nativeName: 'العربية',
    name: 'Arabic',
    direction: 'rtl',
    fontStack: "'Noto Sans Arabic', 'Geeza Pro', system-ui, -apple-system, sans-serif",
  },
  {
    code: 'zh-Hans',
    nativeName: '简体中文',
    name: 'Simplified Chinese',
    direction: 'ltr',
    fontStack: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, -apple-system, sans-serif",
  },
  {
    code: 'ja',
    nativeName: '日本語',
    name: 'Japanese',
    direction: 'ltr',
    fontStack: "'Hiragino Sans', 'Meiryo', system-ui, -apple-system, sans-serif",
  },
  {
    code: 'ko',
    nativeName: '한국어',
    name: 'Korean',
    direction: 'ltr',
    fontStack: "'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, -apple-system, sans-serif",
  },
  {
    code: 'ru',
    nativeName: 'Русский',
    name: 'Russian',
    direction: 'ltr',
    fontStack: 'var(--font-sans), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
];

export const DEFAULT_LANGUAGE = 'en';

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

export function getLanguage(code: string): LanguageConfig {
  const normalized = (code || '').trim().toLowerCase();
  const found = SUPPORTED_LANGUAGES.find(
    (l) => l.code.toLowerCase() === normalized || l.code.toLowerCase() === normalized.split('-')[0]
  );
  return found || SUPPORTED_LANGUAGES[0];
}

export function isValidLanguage(code: string): code is LanguageCode {
  return SUPPORTED_LANGUAGES.some((l) => l.code === code);
}
