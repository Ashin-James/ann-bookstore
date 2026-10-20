'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, Search, ShoppingBag, User, Globe, ArrowUpRight, Heart, LogOut } from 'lucide-react';
import { useStore } from '@/contexts/store-context';
import { useLanguage } from '@/contexts/language-context';
import { useAuth } from '@/contexts/auth-context';
import SearchOverlay from '@/components/search-overlay';
import { Language } from '@/data/translations';
import { SITE_CONFIG } from '@/src/config/site.config';

export default function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { cartCount, wishlist, openCart } = useStore();
  const { language, setLanguage, t } = useLanguage();
  const { isLoggedIn, openAuthModal, logout } = useAuth();

  const langRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Track scroll position for header surface transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close popovers on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLangMenuOpen(false);
        setAccountMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const activeLanguages = SITE_CONFIG.supportedLanguages.filter((l) => l.enabled);

  return (
    <>
      <header className={`site-header ${isScrolled ? 'is-scrolled' : 'is-transparent'}`}>
        {/* Left: Wordmark */}
        <Link href="/" className="wordmark" aria-label="Ann home">
          ANN<span>STORIES THAT STAY</span>
        </Link>

        {/* Right: Exactly 4 icon-only buttons on desktop */}
        <div className="header-actions">
          {/* 1. Search */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="icon-link header-icon-btn"
            aria-label="Search the catalogue"
            title="Search"
          >
            <Search size={20} aria-hidden="true" />
          </button>

          {/* 2. Language Picker Popover (Desktop only in header) */}
          <div ref={langRef} className="desktop-header-action" style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setLangMenuOpen(!langMenuOpen);
                setAccountMenuOpen(false);
              }}
              className="icon-link header-icon-btn"
              aria-label="Select language"
              aria-expanded={langMenuOpen}
              aria-haspopup="true"
              title="Language"
            >
              <Globe size={20} aria-hidden="true" />
            </button>
            {langMenuOpen && (
              <div className="header-popover lang-popover" role="menu" aria-label="Language options">
                {activeLanguages.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    role="menuitemradio"
                    className={`popover-item ${language === opt.code ? 'active' : ''}`}
                    onClick={() => {
                      setLanguage(opt.code as Language);
                      setLangMenuOpen(false);
                    }}
                    aria-checked={language === opt.code}
                  >
                    <span>{opt.nativeName}</span>
                    <span className="lang-code-pill">{opt.code.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Account / Profile Menu (Desktop only in header) */}
          <div ref={accountRef} className="desktop-header-action" style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setAccountMenuOpen(!accountMenuOpen);
                setLangMenuOpen(false);
              }}
              className="icon-link header-icon-btn"
              aria-label="Account and saved items"
              aria-expanded={accountMenuOpen}
              aria-haspopup="true"
              title="Account"
            >
              <User size={20} aria-hidden="true" />
            </button>
            {accountMenuOpen && (
              <div className="header-popover account-popover" role="menu" aria-label="Account options">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/account"
                      className="popover-item"
                      role="menuitem"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <User size={16} aria-hidden="true" />
                      <span>My Account & Orders</span>
                    </Link>
                    <Link
                      href="/wishlist"
                      className="popover-item"
                      role="menuitem"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <Heart size={16} aria-hidden="true" />
                      <span>Wishlist ({wishlist.length})</span>
                    </Link>
                    <button
                      type="button"
                      className="popover-item popover-logout"
                      role="menuitem"
                      onClick={() => {
                        logout();
                        setAccountMenuOpen(false);
                      }}
                    >
                      <LogOut size={16} aria-hidden="true" />
                      <span>Sign out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="popover-item"
                      role="menuitem"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        openAuthModal();
                      }}
                    >
                      <User size={16} aria-hidden="true" />
                      <span>Sign in to Ann</span>
                    </button>
                    <Link
                      href="/wishlist"
                      className="popover-item"
                      role="menuitem"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <Heart size={16} aria-hidden="true" />
                      <span>Wishlist ({wishlist.length})</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 4. Cart */}
          <button
            type="button"
            onClick={openCart}
            className="icon-link header-icon-btn"
            aria-label={`Shopping bag, ${cartCount} items`}
            title="Shopping bag"
          >
            <ShoppingBag size={20} aria-hidden="true" />
            {cartCount > 0 && <span className="action-count">{cartCount}</span>}
          </button>

          {/* Mobile Menu Button (Mobile only) */}
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Sheet */}
      {mobileMenuOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <Link onClick={() => setMobileMenuOpen(false)} href="/books">
            <span>{t('navBooks')}</span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
          <Link onClick={() => setMobileMenuOpen(false)} href="/journal">
            <span>{t('navJournal')}</span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
          <Link onClick={() => setMobileMenuOpen(false)} href="/about">
            <span>{t('navAbout')}</span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
          <Link onClick={() => setMobileMenuOpen(false)} href="/account">
            <span>{isLoggedIn ? 'Account & Orders' : 'Sign In'}</span>
            <User size={18} aria-hidden="true" />
          </Link>
          <Link onClick={() => setMobileMenuOpen(false)} href="/wishlist">
            <span>Wishlist ({wishlist.length})</span>
            <Heart size={18} aria-hidden="true" />
          </Link>

          {/* Language Switcher inside mobile menu */}
          <div className="mobile-nav-lang">
            <span style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 500 }}>Language:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {activeLanguages.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  className={`button ${language === opt.code ? 'button-dark' : 'button-outline'}`}
                  style={{ minHeight: '44px', minWidth: '44px', padding: '8px 16px', fontSize: '14px' }}
                  onClick={() => {
                    setLanguage(opt.code as Language);
                    setMobileMenuOpen(false);
                  }}
                  aria-pressed={language === opt.code}
                >
                  {opt.nativeName}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Predictive Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
