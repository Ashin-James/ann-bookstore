'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

export default function CookieBanner() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('ann-cookie-consent');
      if (!consent) {
        setShow(true);
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleConsent = (choice: 'accepted' | 'rejected') => {
    setShow(false);
    try {
      localStorage.setItem('ann-cookie-consent', choice);
    } catch {
      // Ignore
    }
  };

  if (!show || pathname?.startsWith('/admin')) return null;

  return (
    <aside
      aria-label="Cookie preferences"
      className="cookie-banner-aside"
      style={{
        position: 'fixed',
        bottom: 'max(16px, env(safe-area-inset-bottom))',
        left: '16px',
        right: '16px',
        maxWidth: '540px',
        zIndex: 'var(--z-toast)',
        backgroundColor: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: '12px',
        padding: '16px 20px',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.16)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--wine)' }}>
          <Cookie size={20} aria-hidden="true" />
          <strong style={{ fontSize: '15px', color: 'var(--ink)' }}>Cookie Preferences & Privacy</strong>
        </div>
        <button
          type="button"
          onClick={() => setShow(false)}
          style={{
            border: 0,
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--muted)',
            minWidth: '44px',
            minHeight: '44px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Dismiss cookie notice"
        >
          <X size={18} />
        </button>
      </div>

      <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--muted)' }}>
        We use essential cookies to maintain your shopping bag and session. Under CCPA/CPRA, you may reject non-essential analytics cookies. We do not sell your personal data.{' '}
        <Link href="/privacy#your-privacy-choices" style={{ color: 'var(--wine)', textDecoration: 'underline' }}>
          Your Privacy Choices
        </Link>
      </p>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => handleConsent('rejected')}
          style={{
            border: '1px solid var(--line)',
            background: 'var(--white)',
            color: 'var(--ink)',
            fontSize: '14px',
            padding: '10px 18px',
            minHeight: '44px',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Reject Non-Essential
        </button>
        <button
          type="button"
          onClick={() => handleConsent('accepted')}
          style={{
            border: 0,
            background: 'var(--wine)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 500,
            padding: '10px 20px',
            minHeight: '44px',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Accept All
        </button>
      </div>
    </aside>
  );
}
