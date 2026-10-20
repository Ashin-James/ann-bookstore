'use client';

import Link from 'next/link';
import LanguageSwitcher from '@/components/language-switcher';
import { useLanguage } from '@/contexts/language-context';
import { SITE_CONFIG } from '@/src/config/site.config';
import Container from '@/components/container';

export default function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="site-footer">
      <Container>
        <div className="footer-main">
          <div className="footer-brand-col">
            <Link href="/" className="footer-wordmark">
              ANN.
            </Link>
            <p>{t('footerTagline')}</p>
            <small
              style={{
                display: 'block',
                marginTop: '12px',
                color: 'var(--taupe)',
                fontSize: '14px',
                lineHeight: 1.5,
              }}
            >
              {SITE_CONFIG.complianceMailingAddress}
            </small>
            <div style={{ marginTop: '20px' }}>
              <LanguageSwitcher />
            </div>
          </div>

          <div className="footer-links">
            <div>
              <span className="eyebrow">Explore</span>
              <Link href="/books">{t('navBooks')}</Link>
              <Link href="/about">{t('navAbout')}</Link>
              <Link href="/journal">{t('navJournal')}</Link>
            </div>

            <div>
              <span className="eyebrow">Need to know</span>
              <Link href="/cart">{t('cartTitle')}</Link>
              <Link href="/wishlist">{t('wishlist')}</Link>
              <Link href="/account">Reader Account</Link>
              <Link href="/shipping-returns">Shipping & Returns</Link>
            </div>

            <div>
              <span className="eyebrow">Legal & Compliance</span>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/privacy#your-privacy-choices">Your Privacy Choices</Link>
              <Link href="/terms">Terms of Sale</Link>
              <Link href="/accessibility">Accessibility</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Ann · An author bookstore concept</span>
          <span>{t('footerDemoNote')}</span>
        </div>
      </Container>
    </footer>
  );
}
