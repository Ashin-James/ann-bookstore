'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { accountService } from '@/lib/account/service';
import { AccountData } from '@/lib/account/types';
import Container from '@/components/container';
import Section from '@/components/section';
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
  ChevronRight,
} from 'lucide-react';

interface HubCard {
  title: string;
  description: string;
  href: string;
  icon: typeof Package;
  badge?: string;
}

const HUB_CARDS: HubCard[] = [
  {
    title: 'Your Orders',
    description: 'Track, return, or buy again',
    href: '/account/orders',
    icon: Package,
  },
  {
    title: 'Login & security',
    description: 'Name, email, password, sessions',
    href: '/account/security',
    icon: ShieldCheck,
  },
  {
    title: 'Your Addresses',
    description: 'Edit addresses for orders and gifts',
    href: '/account/addresses',
    icon: MapPin,
  },
  {
    title: 'Payment options',
    description: 'Demo test cards & default billing',
    href: '/account/payments',
    icon: CreditCard,
    badge: 'DEMO ONLY',
  },
  {
    title: 'Your Reading Lists',
    description: 'Wishlist and saved-for-later',
    href: '/account/lists',
    icon: Bookmark,
  },
  {
    title: 'Returns & Refunds',
    description: 'Track returns and view refund status',
    href: '/account/returns',
    icon: RotateCcw,
  },
  {
    title: 'Your Reviews',
    description: 'View, edit, and write reviews',
    href: '/account/reviews',
    icon: Star,
  },
  {
    title: 'Language & Preferences',
    description: 'Language, email notifications',
    href: '/account/preferences',
    icon: Sliders,
  },
  {
    title: 'Privacy & Data',
    description: 'Download or delete my data',
    href: '/account/privacy',
    icon: Lock,
  },
  {
    title: 'Customer Service',
    description: 'Contact, FAQ, returns policy',
    href: '/account/help',
    icon: HelpCircle,
  },
];

export default function AccountHubPage() {
  const { user, isLoggedIn, logout, openAuthModal } = useAuth();
  const { t } = useLanguage();
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    accountService
      .getAccountData(user.id)
      .then((data) => {
        setAccountData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const handleUpdate = () => {
      accountService.getAccountData(user.id).then(setAccountData);
    };
    window.addEventListener('ann-account-update', handleUpdate);
    return () => window.removeEventListener('ann-account-update', handleUpdate);
  }, [user]);

  if (!isLoggedIn || !user) {
    return (
      <Section className="account-page-section" style={{ minHeight: '70vh', padding: '80px 0' }}>
        <Container size="sm" style={{ maxWidth: '520px', textAlign: 'center' }}>
          <span className="eyebrow" style={{ color: 'var(--wine)' }}>
            READER ACCOUNT ACCESS
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', margin: '14px 0 16px', color: 'var(--ink)' }}>
            Sign in to Your Account
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '16px', lineHeight: 1.6, marginBottom: '28px' }}>
            Track your literary orders, manage your reading lists, and update your personal delivery addresses.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
            <Link
              href="/login?next=/account"
              className="button button-dark"
              style={{ padding: '14px 32px', fontSize: '15px' }}
            >
              Sign In
            </Link>
            <button
              type="button"
              onClick={openAuthModal}
              className="button button-outline"
              style={{ padding: '14px 28px', fontSize: '15px' }}
            >
              Quick Modal Sign In
            </button>
          </div>
        </Container>
      </Section>
    );
  }

  // Derive initials from user name
  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'R';

  // Real counts from actual data
  const ordersCount = accountData?.orders?.length ?? 0;
  const savedItemsCount =
    accountData?.lists?.reduce((acc, l) => acc + l.items.length, 0) ?? 0;
  const addressesCount = accountData?.addresses?.length ?? 1;
  const reviewsCount = accountData?.reviews?.length ?? 0;

  return (
    <Section className="account-hub-section" style={{ minHeight: '80vh', padding: '40px 0 96px' }}>
      <Container>
        {/* Profile Header & Real Quick Counts */}
        <header
          style={{
            background: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '28px 32px',
            marginBottom: '36px',
            boxShadow: 'var(--shadow-contact)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap',
              borderBottom: '1px solid var(--line)',
              paddingBottom: '24px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Avatar circle */}
              <div
                aria-hidden="true"
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--wine)',
                  color: '#FAF7F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '24px',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(114, 38, 56, 0.25)',
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>

              <div>
                <span className="eyebrow" style={{ color: 'var(--wine)', marginBottom: '4px' }}>
                  READER HUB
                </span>
                <h1
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(26px, 3.2vw, 36px)',
                    margin: 0,
                    color: 'var(--ink)',
                    lineHeight: 1.15,
                  }}
                >
                  Your Account · {user.name}
                </h1>
                <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '4px 0 0' }}>
                  {user.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid var(--line)',
                background: 'var(--paper)',
                color: 'var(--ink)',
                padding: '10px 18px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              <LogOut size={16} aria-hidden="true" />
              <span>{t('navSignOut') || 'Sign Out'}</span>
            </button>
          </div>

          {/* Quick Metrics from Real Data */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              fontSize: '14px',
            }}
          >
            <Link
              href="/account/orders"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--ink)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span
                style={{
                  background: 'rgba(20, 18, 17, 0.06)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  color: 'var(--wine)',
                  fontWeight: 700,
                }}
              >
                {loading ? '...' : ordersCount}
              </span>
              <span>Past Orders</span>
            </Link>

            <span style={{ color: 'var(--line-strong)' }} aria-hidden="true">·</span>

            <Link
              href="/account/lists"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--ink)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span
                style={{
                  background: 'rgba(20, 18, 17, 0.06)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  color: 'var(--wine)',
                  fontWeight: 700,
                }}
              >
                {loading ? '...' : savedItemsCount}
              </span>
              <span>Saved in Reading Lists</span>
            </Link>

            <span style={{ color: 'var(--line-strong)' }} aria-hidden="true">·</span>

            <Link
              href="/account/addresses"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--ink)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span
                style={{
                  background: 'rgba(20, 18, 17, 0.06)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  color: 'var(--wine)',
                  fontWeight: 700,
                }}
              >
                {loading ? '...' : addressesCount}
              </span>
              <span>Saved Addresses</span>
            </Link>

            <span style={{ color: 'var(--line-strong)' }} aria-hidden="true">·</span>

            <Link
              href="/account/reviews"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--ink)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span
                style={{
                  background: 'rgba(20, 18, 17, 0.06)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  color: 'var(--wine)',
                  fontWeight: 700,
                }}
              >
                {loading ? '...' : reviewsCount}
              </span>
              <span>Book Reviews</span>
            </Link>
          </div>
        </header>

        {/* 10 Large Clickable Cards Grid (3 col desktop, 2 col tablet, 1 col phone) */}
        <div
          className="account-cards-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: '24px',
          }}
        >
          {HUB_CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={card.href}
                  className="account-hub-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '168px',
                    padding: '24px',
                    background: 'var(--white)',
                    border: '1px solid var(--line)',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: 'var(--ink)',
                    boxShadow: 'var(--shadow-contact)',
                    transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.2s',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16px',
                      }}
                    >
                      {/* Custom SVG Icon Container */}
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '8px',
                          background: 'rgba(114, 38, 56, 0.06)',
                          border: '1px solid rgba(114, 38, 56, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--wine)',
                        }}
                      >
                        <Icon size={24} aria-hidden="true" />
                      </div>

                      {card.badge ? (
                        <span
                          style={{
                            fontFamily: 'var(--font-sans), monospace',
                            fontSize: '10px',
                            fontWeight: 700,
                            letterSpacing: '0.12em',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: 'rgba(194, 155, 98, 0.15)',
                            color: 'var(--wine-dark)',
                            border: '1px solid rgba(194, 155, 98, 0.3)',
                          }}
                        >
                          {card.badge}
                        </span>
                      ) : (
                        <ChevronRight
                          size={18}
                          color="var(--taupe)"
                          aria-hidden="true"
                          className="hub-card-arrow"
                        />
                      )}
                    </div>

                    <h2
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '20px',
                        margin: '0 0 6px',
                        color: 'var(--ink)',
                        lineHeight: 1.25,
                      }}
                    >
                      {card.title}
                    </h2>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        color: 'var(--muted)',
                        lineHeight: 1.45,
                      }}
                    >
                      {card.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
