'use client';

import { useAuth } from '@/contexts/auth-context';
import LanguageSwitcher from '@/components/language-switcher';
import { Package, MapPin, LogOut } from 'lucide-react';
import { money } from '@/src/config/site.config';
import Container from '@/components/container';
import Section from '@/components/section';

export default function AccountPage() {
  const { user, isLoggedIn, logout, openAuthModal } = useAuth();

  if (!isLoggedIn || !user) {
    return (
      <Section className="account-page-section">
        <Container style={{ maxWidth: '640px', margin: '40px auto', textAlign: 'center' }}>
          <span className="eyebrow">READER ACCOUNT</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '44px', margin: '14px 0 16px' }}>
            Please Sign In
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '16px', marginBottom: '28px' }}>
            Sign in to view your orders, delivery status, and saved address book.
          </p>
          <button
            type="button"
            onClick={openAuthModal}
            className="button button-dark"
            style={{ padding: '14px 32px', fontSize: '15px', minHeight: '48px' }}
          >
            Sign In Now
          </button>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="account-page-section">
      <Container style={{ maxWidth: '960px' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', borderBottom: '1px solid var(--line)', paddingBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="eyebrow">READER DASHBOARD</span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', margin: '6px 0 0', color: 'var(--ink)' }}>
              Welcome, <em>{user.name}</em>
            </h1>
          </div>

          <button
            type="button"
            onClick={logout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              border: '1px solid var(--line)',
              background: 'var(--white)',
              color: 'var(--ink)',
              padding: '10px 18px',
              minHeight: '44px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <LogOut size={16} aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
          {/* Left Column: Orders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={22} color="var(--wine)" aria-hidden="true" />
              <span>Recent Orders</span>
            </h2>

            {user.orders.map((order) => (
              <div
                key={order.id}
                style={{
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  padding: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '12px', marginBottom: '12px', fontSize: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <strong style={{ color: 'var(--ink)' }}>{order.orderNumber}</strong>
                    <span style={{ color: 'var(--muted)', display: 'block', marginTop: '2px' }}>{order.date}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        background: 'rgba(126, 51, 70, 0.1)',
                        color: 'var(--wine)',
                        padding: '4px 10px',
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '14px',
                      }}
                    >
                      {order.status}
                    </span>
                    <span style={{ color: 'var(--muted)', display: 'block', marginTop: '4px', fontSize: '14px' }}>
                      {order.estimatedDelivery}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                  {order.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>
                        {it.quantity}x {it.title} ({it.format})
                      </span>
                      <span style={{ color: 'var(--muted)' }}>{money(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px dashed var(--line)', marginTop: '14px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '15px' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--wine)' }}>{money(order.total)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Address & Preferences */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={22} color="var(--wine)" aria-hidden="true" />
              <span>Delivery Address</span>
            </h2>

            {user.addresses.map((addr) => (
              <div
                key={addr.id}
                style={{
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  padding: '20px',
                  fontSize: '15px',
                  lineHeight: 1.6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--ink)' }}>{addr.fullName}</strong>
                  {addr.isDefault && (
                    <span style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--wine)', fontWeight: 600 }}>
                      Default
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, color: 'var(--muted)' }}>
                  {addr.street}<br />
                  {addr.city}, {addr.state} {addr.postalCode}<br />
                  {addr.country}
                </p>
              </div>
            ))}

            {/* Language & Interface Settings */}
            <div
              style={{
                backgroundColor: 'var(--beige)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '20px',
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: '0 0 6px' }}>
                Interface Language
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '0 0 14px' }}>
                Choose your preferred language for website navigation and buttons.
              </p>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
