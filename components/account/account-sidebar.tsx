'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import {
  Package,
  ShieldCheck,
  MapPin,
  CreditCard,
  Bookmark,
  RotateCcw,
  Star,
  Sliders,
  Lock,
  HelpCircle,
  LogOut,
  ChevronLeft,
} from 'lucide-react';

export interface NavSection {
  href: string;
  label: string;
  icon: typeof Package;
}

export const ACCOUNT_NAV_SECTIONS: NavSection[] = [
  { href: '/account/orders', label: 'Your Orders', icon: Package },
  { href: '/account/security', label: 'Login & security', icon: ShieldCheck },
  { href: '/account/addresses', label: 'Your Addresses', icon: MapPin },
  { href: '/account/payments', label: 'Payment options', icon: CreditCard },
  { href: '/account/lists', label: 'Your Reading Lists', icon: Bookmark },
  { href: '/account/returns', label: 'Returns & Refunds', icon: RotateCcw },
  { href: '/account/reviews', label: 'Your Reviews', icon: Star },
  { href: '/account/preferences', label: 'Language & Preferences', icon: Sliders },
  { href: '/account/privacy', label: 'Privacy & Data', icon: Lock },
  { href: '/account/help', label: 'Customer Service', icon: HelpCircle },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { t } = useLanguage();

  return (
    <>
      {/* Mobile Back Link (Phones) */}
      <div className="account-mobile-back" style={{ display: 'none', marginBottom: '16px' }}>
        <Link
          href="/account"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--wine)',
            minHeight: '44px',
          }}
        >
          <ChevronLeft size={16} aria-hidden="true" />
          <span>Back to Your Account</span>
        </Link>
      </div>

      {/* Horizontal Tabs (< 1024px) */}
      <nav
        className="account-horizontal-tabs"
        aria-label="Account sections navigation"
        style={{
          display: 'none',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          gap: '8px',
          paddingBottom: '12px',
          marginBottom: '24px',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <Link
          href="/account"
          style={{
            whiteSpace: 'nowrap',
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '14px',
            fontWeight: 600,
            background: pathname === '/account' ? 'var(--ink)' : 'var(--white)',
            color: pathname === '/account' ? 'var(--paper)' : 'var(--ink)',
            border: '1px solid var(--line)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: '40px',
          }}
        >
          Hub Overview
        </Link>
        {ACCOUNT_NAV_SECTIONS.map((sec) => {
          const isActive = pathname === sec.href || pathname.startsWith(`${sec.href}/`);
          const Icon = sec.icon;
          return (
            <Link
              key={sec.href}
              href={sec.href}
              style={{
                whiteSpace: 'nowrap',
                padding: '8px 16px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                background: isActive ? 'var(--ink)' : 'var(--white)',
                color: isActive ? 'var(--paper)' : 'var(--ink)',
                border: '1px solid var(--line)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                minHeight: '40px',
              }}
            >
              <Icon size={15} aria-hidden="true" />
              <span>{sec.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop Sticky Sidebar (>= 1024px) */}
      <aside
        className="account-desktop-sidebar"
        style={{
          width: '260px',
          flexShrink: 0,
          position: 'sticky',
          top: '120px',
          height: 'fit-content',
          background: 'var(--white)',
          border: '1px solid var(--line)',
          borderRadius: '8px',
          padding: '16px 12px',
          boxShadow: 'var(--shadow-contact)',
        }}
      >
        <div style={{ padding: '8px 12px 14px', borderBottom: '1px solid var(--line)', marginBottom: '8px' }}>
          <Link
            href="/account"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
            }}
          >
            <ChevronLeft size={14} aria-hidden="true" />
            <span>Your Account Hub</span>
          </Link>
        </div>

        <nav aria-label="Desktop account navigation" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {ACCOUNT_NAV_SECTIONS.map((sec) => {
            const isActive = pathname === sec.href || pathname.startsWith(`${sec.href}/`);
            const Icon = sec.icon;
            return (
              <Link
                key={sec.href}
                href={sec.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  background: isActive ? 'rgba(114, 38, 56, 0.08)' : 'transparent',
                  color: isActive ? 'var(--wine)' : 'var(--ink)',
                  borderLeft: isActive ? '3px solid var(--wine)' : '3px solid transparent',
                  textDecoration: 'none',
                  minHeight: '44px',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                <Icon size={18} color={isActive ? 'var(--wine)' : 'var(--muted)'} aria-hidden="true" />
                <span>{sec.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
          <button
            type="button"
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--muted)',
              background: 'transparent',
              border: 0,
              cursor: 'pointer',
              minHeight: '44px',
              textAlign: 'left',
            }}
          >
            <LogOut size={18} aria-hidden="true" />
            <span>{t('navSignOut') || 'Sign Out'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
