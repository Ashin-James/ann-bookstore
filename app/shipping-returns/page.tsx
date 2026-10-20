import Link from 'next/link';
import { ArrowLeft, Truck, RotateCcw } from 'lucide-react';
import { SHIPPING_CONFIG } from '@/src/config/shipping.config';
import Container from '@/components/container';
import Section from '@/components/section';

export const metadata = {
  title: 'Shipping & Returns — Ann’s Bookstore',
  description: 'US shipping rates, delivery estimates, carrier tracking, and return policy for Ann’s Bookstore.',
};

export default function ShippingReturnsPage() {
  return (
    <Section className="shipping-returns-section">
      <Container style={{ maxWidth: '820px' }}>
        <Link href="/" className="text-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          <ArrowLeft size={16} aria-hidden="true" /> Return home
        </Link>

        <div style={{ padding: '14px 20px', backgroundColor: '#fff8eb', border: '1px solid #fed7aa', borderRadius: '8px', color: '#9a3412', fontSize: '14px', marginBottom: '36px' }}>
          <strong>LEGAL SCAFFOLD NOTICE:</strong> [DRAFT: needs review by a lawyer. Placeholder text for US compliance.]
        </div>

        <header style={{ marginBottom: '40px' }}>
          <span className="eyebrow">DOMESTIC US FULFILLMENT</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '42px', margin: '10px 0 12px' }}>
            Shipping & Returns
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>
            Complimentary US standard delivery on orders over $35.
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontSize: '16px', lineHeight: 1.7, color: 'var(--ink)' }}>
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--wine)', marginBottom: '8px' }}>
              <Truck size={22} aria-hidden="true" />
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: 0 }}>
                1. Domestic US Shipping
              </h2>
            </div>
            <p>
              We ship to all 50 US states, Washington D.C., and US territories using major domestic carriers (USPS Ground Advantage / Priority Mail, UPS Ground, and FedEx Home Delivery).
            </p>
            <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Standard Shipping:</strong> $4.00 flat rate. {SHIPPING_CONFIG.estimateText}</li>
              <li><strong>Complimentary Shipping:</strong> Automatically applied to all domestic orders over $35.00.</li>
              <li><strong>Tracking:</strong> Door-to-door tracking numbers are provided upon dispatch with direct links to USPS, UPS, or FedEx.</li>
            </ul>
          </section>

          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--wine)', marginBottom: '8px' }}>
              <RotateCcw size={22} aria-hidden="true" />
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: 0 }}>
                2. 30-Day Return Policy
              </h2>
            </div>
            <p>
              We want you to love every book that arrives at your door. You may return unopened, unread physical books within 30 days of receipt for a full refund to your original payment method.
            </p>
            <p>
              If a book arrives damaged or defective in transit, contact <a href="mailto:orders@example.com" style={{ color: 'var(--wine)', textDecoration: 'underline' }}>orders@example.com</a> within 7 days with a photograph, and a complimentary replacement copy will be dispatched immediately.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: '0 0 8px' }}>
              3. Digital E-Book Deliveries
            </h2>
            <p>
              E-books are fulfilled via instantaneous digital download in DRM-free EPUB and PDF formats. Due to the immediate delivery of digital goods, e-book sales are final once downloaded.
            </p>
          </section>
        </div>
      </Container>
    </Section>
  );
}
