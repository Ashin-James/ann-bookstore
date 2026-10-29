'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import { useStore } from '@/contexts/store-context';
import { useLanguage } from '@/contexts/language-context';
import { useAuth } from '@/contexts/auth-context';
import { accountService } from '@/lib/account/service';
import { UserAddress, DemoPaymentMethod } from '@/lib/account/types';
import { books } from '@/data/books';
import { SITE_CONFIG } from '@/src/config/site.config';
import { SHIPPING_CONFIG } from '@/src/config/shipping.config';
import { calculateEstimatedTax } from '@/src/config/tax.config';
import { US_STATES, validateUSAddress, USAddressInput } from '@/src/lib/validation/address';
import Container from '@/components/container';
import Section from '@/components/section';

export default function CheckoutPage() {
  const { cart, clearCart } = useStore();
  const { t, formatCurrency } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<DemoPaymentMethod[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('custom');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');

  const [form, setForm] = useState<USAddressInput>({
    fullName: user?.name || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'OR',
    zip: '',
    phone: '',
    country: 'United States',
  });
  const [email, setEmail] = useState(user?.email || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setEmail(user.email);
    Promise.all([
      accountService.getAddresses(user.id),
      accountService.getPaymentMethods(user.id),
    ]).then(([addrs, pms]) => {
      setSavedAddresses(addrs);
      setSavedPaymentMethods(pms);

      const defAddr = addrs.find((a) => a.isDefault) || addrs[0];
      if (defAddr) {
        setSelectedAddressId(defAddr.id);
        setForm({
          fullName: defAddr.fullName,
          addressLine1: defAddr.street,
          addressLine2: defAddr.apartment || '',
          city: defAddr.city,
          state: defAddr.state,
          zip: defAddr.postalCode,
          phone: defAddr.phone || '',
          country: 'United States',
        });
      }

      const defPm = pms.find((p) => p.isDefault) || pms[0];
      if (defPm) {
        setSelectedPaymentMethodId(defPm.id);
      }
    });
  }, [user]);

  const handleSelectSavedAddress = (id: string) => {
    setSelectedAddressId(id);
    if (id === 'custom') {
      setForm({
        fullName: user?.name || '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: 'OR',
        zip: '',
        phone: '',
        country: 'United States',
      });
      return;
    }
    const found = savedAddresses.find((a) => a.id === id);
    if (found) {
      setForm({
        fullName: found.fullName,
        addressLine1: found.street,
        addressLine2: found.apartment || '',
        city: found.city,
        state: found.state,
        zip: found.postalCode,
        phone: found.phone || '',
        country: 'United States',
      });
    }
  };

  const lines = cart
    .map((x) => {
      const b = books.find((y) => y.id === x.bookId);
      const f = b?.formats.find((y) => y.id === x.variantId);
      if (!b || !f) return null;
      return { book: b, format: f, quantity: x.quantity, total: f.price * x.quantity };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  const subtotal = lines.reduce((s, l) => s + l.total, 0);

  const isFreeShipping = subtotal >= SHIPPING_CONFIG.freeShippingThresholdCents;
  const shippingCents = lines.length ? (isFreeShipping ? 0 : SHIPPING_CONFIG.standardFlatRateCents) : 0;
  const estimatedTaxCents = calculateEstimatedTax(form.state, subtotal);
  const total = subtotal + shippingCents + estimatedTaxCents;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    if (!lines.length) {
      setErrors({ form: 'Your bag is empty. Please add a book before continuing.' });
      return;
    }

    if (user && user.isVerified === false) {
      setErrors({ form: 'Please verify your email address before completing checkout.' });
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrors({ email: 'Please enter a valid email address.' });
      return;
    }

    const validation = validateUSAddress(form);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const chosenPm = savedPaymentMethods.find((p) => p.id === selectedPaymentMethodId) || {
      brand: 'Visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2028,
    };

    const orderNumber = `ANN-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 4);

    const targetUserId = user?.id || 'usr_demo_01';

    try {
      // Save real (non-sample) order to AccountService
      await accountService.createOrder(targetUserId, {
        orderNumber,
        date: new Date().toISOString(),
        items: lines.map((x) => ({
          id: `item_${x.format.id}`,
          bookId: x.book.id,
          bookSlug: x.book.slug || x.book.id,
          title: x.book.title,
          format: x.format.name,
          price: x.format.price,
          quantity: x.quantity,
          cover: x.book.cover,
        })),
        subtotal,
        shipping: shippingCents,
        estimatedTax: estimatedTaxCents,
        total,
        status: 'Confirmed',
        shippingAddress: {
          id: `addr_ord_${Date.now()}`,
          fullName: form.fullName.trim(),
          street: form.addressLine1.trim(),
          apartment: form.addressLine2?.trim() || undefined,
          city: form.city.trim(),
          state: form.state.trim().toUpperCase(),
          postalCode: form.zip.trim(),
          country: 'United States',
          phone: form.phone?.trim() || undefined,
          isDefault: false,
        },
        paymentMethod: {
          brand: chosenPm.brand,
          last4: chosenPm.last4,
          expMonth: chosenPm.expMonth,
          expYear: chosenPm.expYear,
        },
        estimatedDelivery: deliveryDate.toISOString(),
      });
    } catch (err) {
      console.warn('[Checkout] Failed to save order to AccountService:', err);
    }

    const orderSummary = {
      ref: orderNumber,
      items: lines.map((x) => ({
        title: x.book.title,
        format: x.format.name,
        quantity: x.quantity,
        total: x.total,
      })),
      subtotal,
      shipping: shippingCents,
      estimatedTax: estimatedTaxCents,
      total,
      customer: {
        email,
        ...form,
      },
      date: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem('ann-demo-order', JSON.stringify(orderSummary));
    } catch {}

    // Clear bag
    clearCart();

    router.push('/checkout/confirmation');
  }

  return (
    <Section className="checkout-page-section">
      <Container className="checkout-page">
        <Link className="text-link" href="/cart">
          <ArrowLeft size={16} aria-hidden="true" /> {t('cartTitle')}
        </Link>

        <div className="checkout-heading">
          <span className="eyebrow">{t('checkoutTitle')}</span>
          <h1>Almost <em>yours.</em></h1>
          <p>{t('checkoutDemoNotice')}</p>
        </div>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            {user && user.isVerified === false && (
              <div
                role="alert"
                style={{
                  background: 'rgba(114, 38, 56, 0.08)',
                  border: '1px solid var(--wine)',
                  color: 'var(--wine)',
                  padding: '14px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  marginBottom: '20px',
                }}
              >
                <strong>Email verification required</strong>
                <p style={{ margin: '4px 0 0' }}>
                  Please verify your email address to place orders.{' '}
                  <Link href="/register" style={{ color: 'var(--wine)', textDecoration: 'underline', fontWeight: 600 }}>
                    Check verification link →
                  </Link>
                </p>
              </div>
            )}
            {/* Section 1: Contact */}
            <section>
              <h2>01 <span>{t('checkoutContactInfo')}</span></h2>
              <label htmlFor="checkout-email">
                {t('checkoutEmailLabel')}
              </label>
              <input
                id="checkout-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reader@example.com"
                aria-label={t('checkoutEmailLabel')}
              />
              {errors.email && <span className="field-error" style={{ color: 'var(--wine)', fontSize: '14px' }}>{errors.email}</span>}
            </section>

            {/* Section 2: US Delivery Details */}
            <section>
              <h2>02 <span>{t('checkoutShippingAddress')}</span></h2>

              {/* Saved Address Picker if available */}
              {savedAddresses.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="saved-address-selector" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Use Saved Address
                  </label>
                  <select
                    id="saved-address-selector"
                    value={selectedAddressId}
                    onChange={(e) => handleSelectSavedAddress(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--line)',
                      background: 'var(--paper)',
                      color: 'var(--ink)',
                      fontSize: '15px',
                    }}
                  >
                    {savedAddresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.fullName} — {a.street}, {a.city}, {a.state} {a.postalCode} {a.isDefault ? '(Default)' : ''}
                      </option>
                    ))}
                    <option value="custom">+ Enter a different shipping address</option>
                  </select>
                </div>
              )}

              <label htmlFor="checkout-fullName">
                {t('checkoutFullNameLabel')}
              </label>
              <input
                id="checkout-fullName"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="First and last name"
                aria-label={t('checkoutFullNameLabel')}
              />
              {errors.fullName && <span className="field-error" style={{ color: 'var(--wine)', fontSize: '14px' }}>{errors.fullName}</span>}

              <label htmlFor="checkout-addressLine1">
                {t('checkoutAddressLine1Label')}
              </label>
              <input
                id="checkout-addressLine1"
                required
                value={form.addressLine1}
                onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                placeholder="Street address or P.O. Box"
                aria-label={t('checkoutAddressLine1Label')}
              />
              {errors.addressLine1 && <span className="field-error" style={{ color: 'var(--wine)', fontSize: '14px' }}>{errors.addressLine1}</span>}

              <label htmlFor="checkout-addressLine2">
                {t('checkoutAddressLine2Label')}
              </label>
              <input
                id="checkout-addressLine2"
                value={form.addressLine2}
                onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                placeholder="Apartment, suite, unit, building, floor, etc."
                aria-label={t('checkoutAddressLine2Label')}
              />

              <div className="checkout-fields">
                <div>
                  <label htmlFor="checkout-city">
                    {t('checkoutCityLabel')}
                  </label>
                  <input
                    id="checkout-city"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="City"
                    aria-label={t('checkoutCityLabel')}
                  />
                </div>

                <div>
                  <label htmlFor="checkout-state">
                    {t('checkoutStateLabel')}
                  </label>
                  <select
                    id="checkout-state"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    aria-label={t('checkoutStateLabel')}
                  >
                    {US_STATES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="checkout-zip">
                    {t('checkoutZipLabel')}
                  </label>
                  <input
                    id="checkout-zip"
                    required
                    value={form.zip}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                    placeholder="e.g. 97201"
                    aria-label={t('checkoutZipLabel')}
                  />
                </div>
              </div>
              {errors.city && <span className="field-error" style={{ color: 'var(--wine)', fontSize: '14px' }}>{errors.city}</span>}
              {errors.state && <span className="field-error" style={{ color: 'var(--wine)', fontSize: '14px' }}>{errors.state}</span>}
              {errors.zip && <span className="field-error" style={{ color: 'var(--wine)', fontSize: '14px' }}>{errors.zip}</span>}

              <div style={{ marginTop: '14px' }}>
                <label htmlFor="checkout-phone">
                  {t('checkoutPhoneLabel')}
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(555) 000-0000"
                  aria-label={t('checkoutPhoneLabel')}
                />
              </div>

              <div style={{ marginTop: '14px' }}>
                <label htmlFor="checkout-country">
                  Country
                </label>
                <select id="checkout-country" disabled value="United States" aria-label="Country">
                  <option value="United States">United States</option>
                </select>
                {!SITE_CONFIG.allowInternational && (
                  <small style={{ color: 'var(--muted)', display: 'block', marginTop: '6px', fontSize: '14px' }}>
                    {SITE_CONFIG.internationalNotice}
                  </small>
                )}
              </div>
            </section>

            {/* Section 3: Demo Payment */}
            <div className="demo-payment">
              <ShieldCheck size={22} aria-hidden="true" />
              <div>
                <strong>DEMO CHECKOUT — NO PAYMENT TAKEN</strong>
                <p>
                  Zero card fields are required. This simulates an authorized zero-charge demo transaction.
                </p>

                {/* Saved Demo Test Card Selector */}
                {savedPaymentMethods.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <label htmlFor="checkout-payment-method" style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink)' }}>
                      Selected Test Card:
                    </label>
                    <select
                      id="checkout-payment-method"
                      value={selectedPaymentMethodId}
                      onChange={(e) => setSelectedPaymentMethodId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '4px',
                        border: '1px solid var(--line)',
                        background: 'var(--white)',
                        color: 'var(--ink)',
                        fontSize: '14px',
                        marginTop: '4px',
                      }}
                    >
                      {savedPaymentMethods.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.brand} ending in {p.last4} (exp {p.expMonth}/{p.expYear}) {p.isDefault ? '— Default' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {errors.form && <p className="form-error" role="alert">{errors.form}</p>}

            <button
              className={`button button-dark full-button ${isSubmitting ? 'submitting' : ''}`}
              type="submit"
              disabled={isSubmitting || user?.isVerified === false}
              aria-busy={isSubmitting}
            >
              <span>{isSubmitting ? t('checkoutProcessing') : `${t('checkoutPlaceOrder')} · ${formatCurrency(total)}`}</span> <span>→</span>
            </button>
          </form>

          {/* Order Summary Aside */}
          <aside className="checkout-summary">
            <span className="eyebrow">{t('checkoutOrderSummary')}</span>
            <div style={{ margin: '16px 0' }}>
              {lines.map((l) => (
                <div key={l.format.id} className="checkout-item">
                  <div>
                    <strong>{l.book.title}</strong>
                    <span>{l.format.name} × {l.quantity}</span>
                  </div>
                  <strong>{formatCurrency(l.total)}</strong>
                </div>
              ))}
            </div>

            <div className="summary-row">
              <span>{t('subtotal')}</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <div className="summary-row">
              <span>{t('shipping')}</span>
              <span>{shippingCents === 0 ? t('freeShipping') : formatCurrency(shippingCents)}</span>
            </div>
            <div className="summary-row">
              <span>{t('estimatedTax')} ({form.state})</span>
              <span>{formatCurrency(estimatedTaxCents)}</span>
            </div>

            <div className="summary-total">
              <span>{t('subtotal')}</span>
              <strong>{formatCurrency(total)}</strong>
            </div>

            <p className="privacy-small" style={{ marginTop: '18px' }}>
              <Lock size={14} style={{ display: 'inline', marginRight: '6px' }} aria-hidden="true" />
              Private & direct from Ann’s studio. No marketing trackers.
            </p>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
