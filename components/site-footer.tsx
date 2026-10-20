'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { SITE_CONFIG } from '@/src/config/site.config';
import Container from '@/components/container';

export default function SiteFooter() {
  const { language, setLanguage, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="site-footer">
      <Container>
        {/* 4-column layout on desktop, 2-column on mobile */}
        <div className="footer-grid">
          {/* Col 1: Newsletter & Letters from Ann */}
          <div className="footer-col footer-newsletter-col">
            <Link href="/" className="footer-wordmark" aria-label="Ann home">
              ANN.
            </Link>
            <p className="footer-tagline">
              Occasional notes on writing, new editions, and quiet moments.
            </p>
            {subscribed ? (
              <div className="footer-subscribed-msg" role="status">
                <Check size={16} aria-hidden="true" />
                <span>Thank you. Please check your inbox.</span>
              </div>
            ) : (
              <form className="footer-newsletter-form" onSubmit={handleSubmit}>
                <label htmlFor="footer-email-input" className="sr-only">
                  Email address
                </label>
                <div className="footer-input-group">
                  <input
                    id="footer-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="footer-email-input"
                  />
                  <button
                    type="submit"
                    className="footer-submit-btn"
                    aria-label="Subscribe to newsletter"
                  >
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </form>
            )}
            <small className="footer-compliance-text">
              {SITE_CONFIG.complianceMailingAddress}
            </small>
          </div>

          {/* Col 2: Books & Writing */}
          <div className="footer-col">
            <span className="footer-col-heading">Writings</span>
            <ul className="footer-link-list">
              <li><Link href="/books">{t('navBooks')}</Link></li>
              <li><Link href="/books/the-quiet-hours">The Quiet Hours</Link></li>
              <li><Link href="/journal">{t('navJournal')}</Link></li>
              <li><Link href="/about">{t('navAbout')}</Link></li>
            </ul>
          </div>

          {/* Col 3: Reader Services */}
          <div className="footer-col">
            <span className="footer-col-heading">Reader Care</span>
            <ul className="footer-link-list">
              <li><Link href="/cart">{t('cartTitle')}</Link></li>
              <li><Link href="/wishlist">{t('wishlist')}</Link></li>
              <li><Link href="/account">Reader Account</Link></li>
              <li><Link href="/shipping-returns">Shipping & Returns</Link></li>
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div className="footer-col">
            <span className="footer-col-heading">Legal</span>
            <ul className="footer-link-list">
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/privacy#your-privacy-choices">Your Privacy Choices</Link></li>
              <li><Link href="/terms">Terms of Sale</Link></li>
              <li><Link href="/accessibility">Accessibility</Link></li>
            </ul>
          </div>
        </div>

        {/* Quiet language and country selection line */}
        <div className="footer-locale-line">
          <span>Language:</span>
          <button
            type="button"
            className={`footer-lang-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
            aria-pressed={language === 'en'}
          >
            English
          </button>
          <span>·</span>
          <button
            type="button"
            className={`footer-lang-btn ${language === 'es' ? 'active' : ''}`}
            onClick={() => setLanguage('es')}
            aria-pressed={language === 'es'}
          >
            Español
          </button>
          <span>·</span>
          <span>United States (USD $)</span>
        </div>

        {/* Quiet shipping offer and sample notice row */}
        <div className="footer-notice-row">
          <span>Free standard shipping on US orders over $50. Sample bookstore demonstration only. No real orders are fulfilled.</span>
        </div>

        {/* Bottom copyright and legal line */}
        <div className="footer-bottom-row">
          <span>© 2026 Ann · Stories that stay.</span>
          <div className="footer-bottom-links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/accessibility">Accessibility</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
