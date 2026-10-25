'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { accountService } from '@/lib/account/service';
import { DemoPaymentMethod, UserAddress } from '@/lib/account/types';
import AccountLayout from '@/components/account/account-layout';
import { useToast } from '@/components/account/account-toast';
import {
  CreditCard,
  Plus,
  Check,
  ShieldAlert,
  X,
} from 'lucide-react';

const PRESET_TEST_CARDS: {
  brand: 'Visa' | 'Mastercard' | 'American Express' | 'Discover';
  last4: string;
  expMonth: number;
  expYear: number;
  label: string;
  badgeColor: string;
}[] = [
  {
    brand: 'Visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2028,
    label: 'Visa · Test Card (ending in 4242)',
    badgeColor: 'var(--wine)',
  },
  {
    brand: 'Mastercard',
    last4: '4444',
    expMonth: 8,
    expYear: 2029,
    label: 'Mastercard · Test Card (ending in 4444)',
    badgeColor: '#EB001B',
  },
  {
    brand: 'American Express',
    last4: '0005',
    expMonth: 5,
    expYear: 2027,
    label: 'American Express · Test Card (ending in 0005)',
    badgeColor: '#006FCF',
  },
  {
    brand: 'Discover',
    last4: '6011',
    expMonth: 11,
    expYear: 2027,
    label: 'Discover · Test Card (ending in 6011)',
    badgeColor: '#FF6000',
  },
];

export default function PaymentsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [paymentMethods, setPaymentMethods] = useState<DemoPaymentMethod[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Card Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<string>('');
  const [makeDefaultNew, setMakeDefaultNew] = useState(false);
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Remove Confirmation Modal
  const [methodToRemove, setMethodToRemove] = useState<DemoPaymentMethod | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      accountService.getPaymentMethods(user.id),
      accountService.getAddresses(user.id),
    ]).then(([methods, addrs]) => {
      setPaymentMethods(methods);
      setAddresses(addrs);
      if (addrs.length > 0) {
        setSelectedBillingAddressId(addrs[0].id);
      }
      setLoading(false);
    });
  }, [user]);

  const handleAddPresetCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmittingAdd(true);

    const preset = PRESET_TEST_CARDS[selectedPresetIndex];
    try {
      const added = await accountService.addPaymentMethod(user.id, {
        brand: preset.brand,
        last4: preset.last4,
        expMonth: preset.expMonth,
        expYear: preset.expYear,
        isDefault: makeDefaultNew || paymentMethods.length === 0,
        billingAddressId: selectedBillingAddressId || undefined,
      });

      setPaymentMethods((prev) => {
        let next = [...prev, added];
        if (added.isDefault) {
          next = next.map((m) => (m.id === added.id ? m : { ...m, isDefault: false }));
        }
        return next;
      });

      showToast(`Added test card ${preset.brand} ending in ${preset.last4}`, { type: 'success' });
      setIsAddModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add card';
      showToast(msg, { type: 'error' });
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleSetDefault = async (method: DemoPaymentMethod) => {
    if (!user || method.isDefault) return;
    try {
      await accountService.setDefaultPaymentMethod(user.id, method.id);
      setPaymentMethods((prev) =>
        prev.map((m) => ({ ...m, isDefault: m.id === method.id }))
      );
      showToast(`Default payment set to ${method.brand} ending in ${method.last4}`, { type: 'success' });
    } catch {
      showToast('Failed to set default payment method', { type: 'error' });
    }
  };

  const handleConfirmRemove = async () => {
    if (!user || !methodToRemove) return;
    setRemoving(true);
    try {
      await accountService.removePaymentMethod(user.id, methodToRemove.id);
      setPaymentMethods((prev) => {
        const remaining = prev.filter((m) => m.id !== methodToRemove.id);
        if (methodToRemove.isDefault && remaining.length > 0) {
          remaining[0].isDefault = true;
        }
        return remaining;
      });
      showToast(`Removed ${methodToRemove.brand} ending in ${methodToRemove.last4}`, { type: 'info' });
      setMethodToRemove(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to remove card';
      showToast(msg, { type: 'error' });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <AccountLayout
      breadcrumbs={[{ label: 'Payment options' }]}
      title="Payment Options"
      description="Manage saved demo payment cards and billing addresses."
      action={
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: 'var(--wine)',
            color: 'var(--white)',
            border: 0,
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            minHeight: '42px',
          }}
        >
          <Plus size={16} aria-hidden="true" />
          <span>Add Test Card</span>
        </button>
      }
    >
      {/* Strict Demo Payment Banner */}
      <div
        style={{
          background: 'rgba(114, 38, 56, 0.06)',
          border: '1px solid var(--wine)',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
        }}
      >
        <ShieldAlert size={22} color="var(--wine)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ display: 'block', fontSize: '15px', color: 'var(--wine)', marginBottom: '4px' }}>
            Demo: no real payment details are collected or stored
          </strong>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink)', lineHeight: 1.5 }}>
            To protect reader security, this environment is strictly restricted to simulated test cards. No card
            numbers, CVC codes, or sensitive banking details can ever be typed or stored here. In production, this
            interface connects to Stripe&apos;s hosted customer portal.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)' }}>
          Loading payment methods...
        </div>
      ) : paymentMethods.length === 0 ? (
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <CreditCard size={40} color="var(--taupe)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: '0 0 8px' }}>
            No Saved Payment Methods
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '0 0 20px' }}>
            Add a preset test card to test the simulated checkout flow.
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            style={{
              padding: '10px 20px',
              background: 'var(--wine)',
              color: 'var(--white)',
              border: 0,
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            Add a Test Card
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {paymentMethods.map((method) => {
            const billingAddr = addresses.find((a) => a.id === method.billingAddressId);
            return (
              <div
                key={method.id}
                className="payment-card"
                style={{
                  background: 'var(--white)',
                  border: method.isDefault ? '2px solid var(--wine)' : '1px solid var(--line)',
                  borderRadius: '8px',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: method.isDefault ? 'var(--shadow-ambient)' : 'none',
                }}
              >
                <div>
                  {/* Default badge */}
                  {method.isDefault && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(114, 38, 56, 0.08)',
                        color: 'var(--wine)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        marginBottom: '12px',
                      }}
                    >
                      <Check size={12} />
                      <span>Default Payment Method</span>
                    </div>
                  )}

                  {/* Card Visual Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '30px',
                        borderRadius: '4px',
                        background: 'var(--paper)',
                        border: '1px solid var(--line)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '11px',
                        color: 'var(--ink)',
                      }}
                    >
                      {method.brand === 'American Express' ? 'AMEX' : method.brand.toUpperCase()}
                    </div>
                    <div>
                      <strong style={{ fontSize: '15px', color: 'var(--ink)', display: 'block' }}>
                        {method.brand} ending in {method.last4}
                      </strong>
                      <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                        Expires {String(method.expMonth).padStart(2, '0')}/{method.expYear}
                      </span>
                    </div>
                  </div>

                  {/* Billing address */}
                  <div
                    style={{
                      background: 'var(--paper)',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      fontSize: '12px',
                      color: 'var(--muted)',
                      lineHeight: 1.4,
                    }}
                  >
                    <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: '2px' }}>
                      Billing Address:
                    </strong>
                    {billingAddr ? (
                      <>
                        {billingAddr.fullName} · {billingAddr.street}, {billingAddr.city}, {billingAddr.state}{' '}
                        {billingAddr.postalCode}
                      </>
                    ) : (
                      'Same as shipping address'
                    )}
                  </div>
                </div>

                {/* Card footer actions */}
                <div
                  style={{
                    marginTop: '20px',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setMethodToRemove(method)}
                    style={{
                      background: 'transparent',
                      border: 0,
                      padding: 0,
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--terracotta)',
                      cursor: 'pointer',
                      minHeight: '32px',
                    }}
                  >
                    Remove Card
                  </button>

                  {!method.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(method)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--line)',
                        borderRadius: '4px',
                        padding: '4px 10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--ink)',
                        cursor: 'pointer',
                        minHeight: '32px',
                      }}
                    >
                      Set as default
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Test Card Modal (Strictly Selector-Based, Zero Text Inputs For Card Details) */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-card-dialog-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 18, 17, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <form
            onSubmit={handleAddPresetCard}
            style={{
              background: 'var(--white)',
              borderRadius: '8px',
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-monumental)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 id="add-card-dialog-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: 0, color: 'var(--ink)' }}>
                Add Demo Payment Card
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: '4px', minHeight: '36px' }}
                aria-label="Close dialog"
              >
                <X size={20} color="var(--muted)" />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 20px', lineHeight: 1.5 }}>
              Choose from simulated test cards below. In accordance with zero-credential policies, real card details
              cannot be collected or stored.
            </p>

            {/* Test Card Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                Select Test Card *
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {PRESET_TEST_CARDS.map((preset, idx) => (
                  <label
                    key={preset.last4}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '6px',
                      border: selectedPresetIndex === idx ? '2px solid var(--wine)' : '1px solid var(--line)',
                      background: selectedPresetIndex === idx ? 'var(--paper)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="presetCard"
                      checked={selectedPresetIndex === idx}
                      onChange={() => setSelectedPresetIndex(idx)}
                      style={{ accentColor: 'var(--wine)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '14px', color: 'var(--ink)', display: 'block' }}>
                        {preset.label}
                      </strong>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        Expires: {String(preset.expMonth).padStart(2, '0')}/{preset.expYear} · Safe Demo Token
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Billing Address Selector */}
            {addresses.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="billing-address-select" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Billing Address
                </label>
                <select
                  id="billing-address-select"
                  value={selectedBillingAddressId}
                  onChange={(e) => setSelectedBillingAddressId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--line)',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    fontSize: '14px',
                  }}
                >
                  {addresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {addr.fullName} — {addr.street}, {addr.city}, {addr.state}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Default checkbox */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={makeDefaultNew}
                  onChange={(e) => setMakeDefaultNew(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--wine)' }}
                />
                <span>Set as default payment method</span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                disabled={submittingAdd}
                style={{
                  padding: '10px 18px',
                  background: 'transparent',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '42px',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAdd}
                style={{
                  padding: '10px 22px',
                  background: 'var(--wine)',
                  color: 'var(--white)',
                  border: 0,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: submittingAdd ? 'not-allowed' : 'pointer',
                  minHeight: '42px',
                }}
              >
                {submittingAdd ? 'Adding...' : 'Add Test Card'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Remove Confirmation Dialog */}
      {methodToRemove && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-card-dialog-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 18, 17, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--white)',
              borderRadius: '8px',
              maxWidth: '440px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-monumental)',
            }}
          >
            <h3 id="remove-card-dialog-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: '0 0 12px', color: 'var(--ink)' }}>
              Remove {methodToRemove.brand} Card?
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '0 0 20px', lineHeight: 1.5 }}>
              Are you sure you want to remove this test card ending in{' '}
              <strong style={{ color: 'var(--ink)' }}>{methodToRemove.last4}</strong>? It will no longer appear as an
              option during checkout.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setMethodToRemove(null)}
                disabled={removing}
                style={{
                  padding: '10px 18px',
                  background: 'transparent',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '42px',
                }}
              >
                Keep Card
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                disabled={removing}
                style={{
                  padding: '10px 20px',
                  background: 'var(--terracotta)',
                  color: 'var(--white)',
                  border: 0,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: removing ? 'not-allowed' : 'pointer',
                  minHeight: '42px',
                }}
              >
                {removing ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}
