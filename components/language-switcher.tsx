'use client';

import { useLanguage } from '@/contexts/language-context';
import { Globe } from 'lucide-react';
import { Language } from '@/data/translations';
import { SITE_CONFIG } from '@/src/config/site.config';

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();

  // Read supported languages from config list; only render enabled ones
  const activeOptions = SITE_CONFIG.supportedLanguages.filter((l) => l.enabled);

  return (
    <div className="language-switcher-wrap" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <Globe size={18} style={{ opacity: 0.7 }} aria-hidden="true" />
      <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.05)', padding: '2px', borderRadius: '6px' }}>
        {activeOptions.map((opt) => (
          <button
            key={opt.code}
            type="button"
            onClick={() => setLanguage(opt.code as Language)}
            style={{
              border: 0,
              background: language === opt.code ? 'var(--wine)' : 'transparent',
              color: language === opt.code ? '#fff' : 'var(--ink)',
              fontSize: '14px',
              fontWeight: language === opt.code ? 600 : 400,
              minWidth: '44px',
              minHeight: '44px',
              padding: '8px 12px',
              borderRadius: '4px',
              transition: 'all 0.15s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={opt.name}
            aria-label={`Switch language to ${opt.name}`}
            aria-pressed={language === opt.code}
          >
            {compact ? opt.code.toUpperCase() : opt.nativeName}
          </button>
        ))}
      </div>
    </div>
  );
}
