'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LanguageConfig,
  getLanguage,
  isValidLanguage,
} from '@/src/config/languages';
import { loadTranslations, getLoadedTranslations, Translations, enTranslations } from '@/data/translations';
import { useAuth } from './auth-context';

export interface LanguageContextType {
  language: string;
  config: LanguageConfig;
  direction: 'ltr' | 'rtl';
  setLanguage: (code: string) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatCurrency: (cents: number) => string;
  formatDate: (date: string | Date, options?: Intl.DateTimeFormatOptions) => string;
  formatPlural: (count: number, keyPrefix: string, params?: Record<string, string | number>) => string;
  isDraft: boolean;
  suggestion: { code: string; name: string; nativeName: string } | null;
  dismissSuggestion: () => void;
  acceptSuggestion: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getInitialLanguage(): string {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    // 1. Check user profile in localStorage if exists
    const userStr = localStorage.getItem('ann-bookstore-user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u.language && isValidLanguage(u.language)) return u.language;
    }
    // 2. Check localStorage
    const stored = localStorage.getItem('ann-bookstore-language');
    if (stored && isValidLanguage(stored)) return stored;

    // 3. Check cookie
    const match = document.cookie.match(/ann-bookstore-language=([a-zA-Z-]+)/);
    if (match && isValidLanguage(match[1])) return match[1];
  } catch {
    // Ignore
  }
  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>(getInitialLanguage);
  const [currentTranslations, setCurrentTranslations] = useState<Translations>(() =>
    getLoadedTranslations(getInitialLanguage())
  );
  const [suggestion, setSuggestion] = useState<{ code: string; name: string; nativeName: string } | null>(null);

  const auth = useAuth();

  const config = getLanguage(language);

  // Apply language, dir, and font stack to DOM synchronously
  const applyDomAttributes = useCallback((code: string) => {
    if (typeof document === 'undefined') return;
    const cfg = getLanguage(code);
    document.documentElement.lang = code;
    document.documentElement.dir = cfg.direction;
    document.documentElement.style.fontFamily = cfg.fontStack;
  }, []);

  // Set Language handler
  const setLanguage = useCallback(
    async (code: string) => {
      const targetCode = isValidLanguage(code) ? code : DEFAULT_LANGUAGE;
      setLanguageState(targetCode);
      applyDomAttributes(targetCode);

      // Save to localStorage
      try {
        localStorage.setItem('ann-bookstore-language', targetCode);
      } catch {}

      // Save to cookie (1 year expiry)
      try {
        document.cookie = `ann-bookstore-language=${targetCode}; path=/; max-age=31536000; SameSite=Lax`;
      } catch {}

      // Save to user profile if signed in
      if (auth?.user) {
        auth.updateUserLanguage(targetCode);
      }

      // Load translations dynamically
      const loaded = await loadTranslations(targetCode);
      setCurrentTranslations(loaded);

      // Localize document title
      if (typeof document !== 'undefined') {
        const tagline = loaded.footerTagline;
        if (targetCode !== 'en' && tagline) {
          document.title = `Ann — ${tagline}`;
        } else {
          document.title = 'Ann — Stories That Stay';
        }
      }
    },
    [applyDomAttributes, auth]
  );

  // Initial mount: load translations and check browser suggestion
  useEffect(() => {
    applyDomAttributes(language);
    if (language !== 'en') {
      loadTranslations(language).then(setCurrentTranslations);
    }

    // First visit dismissible language suggestion check
    try {
      const dismissed = localStorage.getItem('ann-language-suggestion-dismissed');
      if (!dismissed && typeof navigator !== 'undefined') {
        const browserLangs = navigator.languages || [navigator.language];
        for (const bl of browserLangs) {
          const norm = (bl || '').trim().toLowerCase();
          const matched = SUPPORTED_LANGUAGES.find(
            (l) => l.code.toLowerCase() === norm || l.code.toLowerCase() === norm.split('-')[0]
          );
          if (matched && matched.code !== language) {
            setSuggestion({
              code: matched.code,
              name: matched.name,
              nativeName: matched.nativeName,
            });
            break;
          }
        }
      }
    } catch {}
  }, [language, applyDomAttributes]);

  const dismissSuggestion = useCallback(() => {
    setSuggestion(null);
    try {
      localStorage.setItem('ann-language-suggestion-dismissed', 'true');
    } catch {}
  }, []);

  const acceptSuggestion = useCallback(() => {
    if (suggestion) {
      setLanguage(suggestion.code);
      dismissSuggestion();
    }
  }, [suggestion, setLanguage, dismissSuggestion]);

  // Translation function: looks up key, replaces params, falls back to English, never shows raw key if English exists
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = currentTranslations as Record<string, string | undefined>;
      const fallbackDict = enTranslations as Record<string, string | undefined>;
      let text = dict[key] ?? fallbackDict[key] ?? key;

      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
      }
      return text;
    },
    [currentTranslations]
  );

  // Currency formatter: keeps USD, formatted per locale
  const formatCurrency = useCallback(
    (cents: number): string => {
      if (isNaN(cents)) return '$0.00';
      try {
        return new Intl.NumberFormat(language, {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(cents / 100);
      } catch {
        return `$${(cents / 100).toFixed(2)}`;
      }
    },
    [language]
  );

  // Date formatter: per locale
  const formatDate = useCallback(
    (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) return String(date);
      try {
        return new Intl.DateTimeFormat(
          language,
          options || { year: 'numeric', month: 'long', day: 'numeric' }
        ).format(d);
      } catch {
        return d.toLocaleDateString('en-US');
      }
    },
    [language]
  );

  // Plural formatter with Intl.PluralRules
  const formatPlural = useCallback(
    (count: number, keyPrefix: string, params?: Record<string, string | number>): string => {
      let rule: Intl.LDMLPluralRule = 'other';
      try {
        rule = new Intl.PluralRules(language).select(count);
      } catch {}

      const dict = currentTranslations as Record<string, string | undefined>;
      const fallbackDict = enTranslations as Record<string, string | undefined>;

      const specificKey = `${keyPrefix}_${rule}`;
      const otherKey = `${keyPrefix}_other`;

      let text = dict[specificKey] ?? dict[otherKey] ?? fallbackDict[specificKey] ?? fallbackDict[otherKey] ?? dict[keyPrefix] ?? fallbackDict[keyPrefix] ?? `${count}`;

      const allParams = { count, ...params };
      for (const [k, v] of Object.entries(allParams)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
      return text;
    },
    [language, currentTranslations]
  );

  const isDraft = Boolean((currentTranslations as { _status?: string })._status);

  return (
    <LanguageContext.Provider
      value={{
        language,
        config,
        direction: config.direction,
        setLanguage,
        t,
        formatCurrency,
        formatDate,
        formatPlural,
        isDraft,
        suggestion,
        dismissSuggestion,
        acceptSuggestion,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
