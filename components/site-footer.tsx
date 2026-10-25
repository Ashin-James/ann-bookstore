'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
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
            <Link href="/" className="footer-wordmark" aria-label="Ann Home">
              ANN.
            </Link>
            <p className="footer-tagline">{t('footerTagline')}</p>

            <div className="footer-address-pill">
              <MapPin size={15} style={{ flexShrink: 0, opacity: 0.75 }} aria-hidden="true" />
              <span>{SITE_CONFIG.complianceMailingAddress}</span>
            </div>

            <div style={{ marginTop: '24px' }}>
              <LanguageSwitcher variant="footer" />
            </div>
          </div>

          <div className="footer-links">
            <div>
              <span className="eyebrow">{t('footerExplore')}</span>
              <Link href="/books">{t('navBooks')}</Link>
              <Link href="/about">{t('navAbout')}</Link>
              <Link href="/journal">{t('navJournal')}</Link>
            </div>

            <div>
              <span className="eyebrow">{t('footerNeedToKnow')}</span>
              <Link href="/cart">{t('cartTitle')}</Link>
              <Link href="/wishlist">{t('wishlist')}</Link>
              <Link href="/account">{t('accountTitle')}</Link>
              <Link href="/shipping-returns">{t('shippingTitle')}</Link>
            </div>

            <div>
              <span className="eyebrow">{t('footerLegal')}</span>
              <Link href="/privacy">{t('privacyTitle')}</Link>
              <Link href="/privacy#your-privacy-choices">{t('privacyTitle')} Choices</Link>
              <Link href="/terms">{t('termsTitle')}</Link>
              <Link href="/accessibility">{t('accessibilityTitle')}</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Ann’s Bookstore · Handcrafted Author Imprint · Portland, OR</span>
          <span>{t('footerDemoNote')}</span>
        </div>
      </Container>
    </footer>
  );
}
