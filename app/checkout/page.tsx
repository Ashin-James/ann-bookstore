'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import { useStore } from '@/contexts/store-context';
import { books } from '@/data/books';
import { money, SITE_CONFIG } from '@/src/config/site.config';
import { SHIPPING_CONFIG } from '@/src/config/shipping.config';
import { calculateEstimatedTax } from '@/src/config/tax.config';
import { US_STATES, validateUSAddress, USAddressInput } from '@/src/lib/validation/address';
import Container from '@/components/container';
import Section from '@/components/section';

export default function CheckoutPage() {
  const { cart } = useStore();
  const router = useRouter();

  const [form, setForm] = useState<USAddressInput>({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'OR',
    zip: '',
    phone: '',
    country: 'United States',
  });
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    if (!lines.length) {
      setErrors({ form: 'Your bag is empty. Please add a book before continuing.' });
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

    const order = {
      ref: `ANN-US-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
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
      sessionStorage.setItem('ann-demo-order', JSON.stringify(order));
    } catch (_) {}
    router.push('/checkout/confirmation');
  }

  if (!cart.length) {
    return (
      <Section className="empty-checkout-section">
        <Container className="empty-checkout">
          <h1>Your bag is <em>waiting.</em></h1>
          <p>Add a book before heading to checkout.</p>
          <Link className="button button-dark" href="/books">
            Explore books
          </Link>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="checkout-page-section">
      <Container className="checkout-page">
        <Link className="text-link" href="/cart">
          <ArrowLeft size={16} aria-hidden="true" /> Back to bag
        </Link>

        <div className="checkout-heading">
          <span className="eyebrow">US CHECKOUT DEMO · SECURE & TESTABLE</span>
          <h1>Almost <em>yours.</em></h1>
          <p>This is a frontend demonstration. No payment will be taken.</p>
        </div>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit} noValidate>
            {/* Section 1: Contact */}
            <section>
              <h2>01 <span>Contact</span></h2>
              <label>
                Email address
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="reader@example.com"
                />
              </label>
              {errors.email && <span className="field-error" style={{ color: 'var(--wine)', fontSize: '14px' }}>{errors.email}</span>}
            </section>

            {/* Section 2: US Delivery Details */}
            <section>
              <h2>02 <span>US Delivery address</span></h2>

              <label>
                Full name
                <input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="First and last name"
                />
              </label>
              {errors.fullName && <span className="field-error" style={{ color: 'var(--wine)', fontSize: '14px' }}>{errors.fullName}</span>}

              <label>
                Address line 1
                <input
                  required
                  value={form.addressLine1}
                  onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                  placeholder="Street address or P.O. Box"
                />
              </label>
              {errors.addressLine1 && <span className="field-error" style={{ color: 'var(--wine)', fontSize: '14px' }}>{errors.addressLine1}</span>}

              <label>
                Address line 2 <span style={{ fontSize: '14px', color: 'var(--muted)' }}>(optional)</span>
                <input
                  value={form.addressLine2}
                  onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
              </label>

              <div className="checkout-fields">
                <label>
                  City
                  <input
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="City"
                  />
                </label>

                <label>
                  State
                  <select
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    aria-label="State"
                  >
                    {US_STATES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  ZIP code
                  <input
                    required
                    value={form.zip}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                    placeholder="e.g. 97201"
                  />
                </label>
              </div>
              {errors.city && <span className="field-error" style={{ color: 'var(--wine)', fontSize: '14px' }}>{errors.city}</span>}
              {errors.state && <span className="field-error" style={{ color: 'var(--wine)', fontSize: '14px' }}>{errors.state}</span>}
              {errors.zip && <span className="field-error" style={{ color: 'var(--wine)', fontSize: '14px' }}>{errors.zip}</span>}

              <div style={{ marginTop: '14px' }}>
                <label>
                  Phone number <span style={{ fontSize: '14px', color: 'var(--muted)' }}>(optional, for delivery updates)</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="(555) 000-0000"
                  />
                </label>
              </div>

              <label style={{ marginTop: '14px' }}>
                Country
                <select disabled value="United States">
                  <option value="United States">United States</option>
                </select>
                {!SITE_CONFIG.allowInternational && (
                  <small style={{ color: 'var(--muted)', display: 'block', marginTop: '6px', fontSize: '14px' }}>
                    {SITE_CONFIG.internationalNotice}
                  </small>
                )}
              </label>
            </section>

            {/* Section 3: Demo Payment */}
            <div className="demo-payment">
              <ShieldCheck size={22} aria-hidden="true" />
              <div>
                <strong>DEMO CHECKOUT — NO PAYMENT TAKEN</strong>
                <p>
                  Zero card fields are required. This simulates an authorized zero-charge demo transaction.
                </p>
              </div>
            </div>

            {errors.form && <p className="form-error" role="alert">{errors.form}</p>}

            <button
              className="button button-dark full-button"
              type="submit"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'Processing...' : `Place demo order · ${money(total)}`}</span> <span>→</span>
            </button>
          </form>

          {/* Order Summary Aside */}
          <aside className="checkout-summary">
            <span className="eyebrow">ORDER SUMMARY</span>
            <div style={{ margin: '16px 0' }}>
              {lines.map((l) => (
                <div key={l.format.id} className="checkout-item">
                  <div>
                    <strong>{l.book.title}</strong>
                    <span>{l.format.name} × {l.quantity}</span>
                  </div>
                  <strong>{money(l.total)}</strong>
                </div>
              ))}
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>
            <div className="summary-row">
              <span>Estimated shipping</span>
              <span>{shippingCents === 0 ? 'Complimentary' : money(shippingCents)}</span>
            </div>
            <div className="summary-row">
              <span>Estimated sales tax ({form.state})</span>
              <span>{money(estimatedTaxCents)}</span>
            </div>

            <div className="summary-total">
              <span>Total</span>
              <strong>{money(total)}</strong>
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
