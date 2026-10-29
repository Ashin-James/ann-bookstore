'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Search, Heart, ShoppingBag, ArrowUpRight, User } from 'lucide-react';
import { useStore } from '@/contexts/store-context';
import { useLanguage } from '@/contexts/language-context';
import { useAuth } from '@/contexts/auth-context';
import LanguageSwitcher from '@/components/language-switcher';
import SearchOverlay from '@/components/search-overlay';

const SIGN_IN_TRANSLATIONS: Record<string, string> = {
  en: 'Sign in',
  es: 'Iniciar sesión',
  fr: 'Connexion',
  de: 'Anmelden',
  'pt-BR': 'Entrar',
  it: 'Accedi',
  hi: 'साइन इन',
  ml: 'സൈൻ ഇൻ',
  ta: 'உள்நுழைக',
  ar: 'تسجيل الدخول',
  'zh-Hans': '登录',
  ja: 'サインイン',
  ko: '로그인',
  ru: 'Войти',
};

const REGISTER_TRANSLATIONS: Record<string, string> = {
  en: 'Register',
  es: 'Registrarse',
  fr: "S'inscrire",
  de: 'Registrieren',
  'pt-BR': 'Cadastrar',
  it: 'Registrati',
  hi: 'पंजीकरण',
  ml: 'രജിസ്റ്റർ',
  ta: 'பதிவுசெய்க',
  ar: 'إنشاء حساب',
  'zh-Hans': '注册',
  ja: '会員登録',
  ko: '회원가입',
  ru: 'Регистрация',
};

const ACCOUNT_TRANSLATIONS: Record<string, string> = {
  en: 'Account',
  es: 'Cuenta',
  fr: 'Compte',
  de: 'Konto',
  'pt-BR': 'Conta',
  it: 'Account',
  hi: 'खाता',
  ml: 'അക്കൗണ്ട്',
  ta: 'கணக்கு',
  ar: 'الحساب',
  'zh-Hans': '账户',
  ja: 'アカウント',
  ko: '계정',
  ru: 'Аккаунт',
};

export default function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { cartCount, wishlist, openCart } = useStore();
  const { t, language } = useLanguage();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const nav = [
    [t('navBooks'), '/books'],
    [t('navAbout'), '/about'],
    [t('navJournal'), '/journal'],
  ];

  const signInLabel = SIGN_IN_TRANSLATIONS[language] || SIGN_IN_TRANSLATIONS.en;
  const registerLabel = REGISTER_TRANSLATIONS[language] || REGISTER_TRANSLATIONS.en;
  const accountLabel = ACCOUNT_TRANSLATIONS[language] || ACCOUNT_TRANSLATIONS.en;

  return (
    <>
      <div className="announcement">
        A little more wonder, delivered to your door <span>·</span> Demo store
      </div>
      <header className={`site-header ${isScrolled ? 'is-scrolled' : ''}`}>
        <Link href="/" className="wordmark" aria-label="Ann home">
          ANN<span>STORIES THAT STAY</span>
        </Link>

        <nav className="desktop-nav">
          {nav.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          {/* Predictive Search Trigger */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="search-mini"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              minHeight: '44px',
              borderRadius: '22px',
              border: '1px solid var(--line)',
              background: 'transparent',
              color: 'var(--muted)',
              cursor: 'pointer',
              fontSize: '14px',
            }}
            aria-label="Open search dialog"
          >
            <Search size={16} />
            <span style={{ opacity: 0.9 }}>Find a story</span>
            <kbd
              style={{
                fontSize: '14px',
                padding: '2px 6px',
                borderRadius: '3px',
                border: '1px solid var(--line)',
                background: 'var(--beige)',
              }}
            >
              ⌘K
            </kbd>
          </button>

          {/* Language Switcher */}
          <div className="header-lang-switcher" style={{ marginLeft: '4px' }}>
            <LanguageSwitcher compact />
          </div>

          {/* Account Auth Links */}
          {isLoggedIn ? (
            <Link
              className="icon-link header-account-link"
              href="/account"
              aria-label="My Account"
              style={{
                minWidth: '44px',
                minHeight: '44px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                color: 'var(--ink)',
                textDecoration: 'none',
                padding: '0 8px',
              }}
            >
              <User size={18} />
              <span>{accountLabel}</span>
            </Link>
          ) : (
            <div className="header-auth-links" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Link
                href="/login"
                className="header-nav-link header-signin-link"
                style={{
                  minHeight: '44px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: '14px',
                  textDecoration: 'none',
                  color: 'var(--ink)',
                  padding: '0 8px',
                }}
              >
                {signInLabel}
              </Link>
              <span style={{ color: 'var(--line)', opacity: 0.6 }} aria-hidden="true">
                |
              </span>
              <Link
                href="/register"
                className="header-nav-link header-register-link"
                style={{
                  minHeight: '44px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: '14px',
                  textDecoration: 'none',
                  color: 'var(--wine)',
                  fontWeight: 600,
                  padding: '0 8px',
                }}
              >
                {registerLabel}
              </Link>
            </div>
          )}

          {/* Wishlist Link */}
          <Link className="icon-link" href="/wishlist" aria-label={`Wishlist, ${wishlist.length} items`} style={{ minWidth: '44px', minHeight: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={20} />
            <span className="wishlist-badge action-badge">{wishlist.length}</span>
          </Link>

          {/* Cart Drawer Trigger */}
          <button
            type="button"
            onClick={openCart}
            className="icon-link"
            style={{ border: 0, background: 'transparent', cursor: 'pointer', minWidth: '44px', minHeight: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label={`Cart bag, ${cartCount} items`}
          >
            <ShoppingBag size={20} />
            <span className="action-count">{cartCount}</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            style={{ minWidth: '44px', minHeight: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav className="mobile-nav">
          <div style={{ padding: '8px 0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Language</span>
            <LanguageSwitcher />
          </div>
          {nav.map(([label, href]) => (
            <Link onClick={() => setMobileMenuOpen(false)} key={href} href={href}>
              {label}
              <ArrowUpRight size={16} />
            </Link>
          ))}
          {isLoggedIn ? (
            <Link onClick={() => setMobileMenuOpen(false)} href="/account">
              {accountLabel} &amp; Orders
            </Link>
          ) : (
            <>
              <Link onClick={() => setMobileMenuOpen(false)} href="/login">
                {signInLabel}
              </Link>
              <Link onClick={() => setMobileMenuOpen(false)} href="/register">
                {registerLabel}
              </Link>
            </>
          )}
          <Link onClick={() => setMobileMenuOpen(false)} href="/wishlist">
            Wishlist ({wishlist.length})
          </Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              openCart();
            }}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '13px 0',
              borderBottom: '1px solid var(--line)',
              fontFamily: 'var(--font-serif)',
              fontSize: '20px',
              border: 0,
              background: 'transparent',
              color: 'inherit',
              textAlign: 'left',
              width: '100%',
              cursor: 'pointer',
            }}
          >
            <span>Your Bag</span>
            <span>({cartCount})</span>
          </button>
        </nav>
      )}

      {/* Predictive Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
