import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Container from '@/components/container';
import Section from '@/components/section';

export const metadata = {
  title: 'Terms of Sale — Ann’s Bookstore',
  description: 'Terms of sale and purchase conditions for Ann’s Bookstore.',
};

export default function TermsPage() {
  return (
    <Section className="terms-page-section">
      <Container style={{ maxWidth: '820px' }}>
        <Link href="/" className="text-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          <ArrowLeft size={16} aria-hidden="true" /> Return home
        </Link>

        <div style={{ padding: '14px 20px', backgroundColor: '#fff8eb', border: '1px solid #fed7aa', borderRadius: '8px', color: '#9a3412', fontSize: '14px', marginBottom: '36px' }}>
          <strong>LEGAL SCAFFOLD NOTICE:</strong> [DRAFT: needs review by a lawyer. Placeholder text for US compliance.]
        </div>

        <header style={{ marginBottom: '40px' }}>
          <span className="eyebrow">LEGAL & COMPLIANCE</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '42px', margin: '10px 0 12px' }}>
            Terms of Sale
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>
            Governing all orders placed through Ann’s Bookstore in the United States.
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontSize: '16px', lineHeight: 1.7, color: 'var(--ink)' }}>
          <section>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', margin: '0 0 10px' }}>
              1. Orders & Pricing
            </h2>
            <p>
              All prices are stated in US Dollars (USD). Stated prices in this storefront represent sample demonstration values. When live orders are enabled, orders are subject to acceptance and verification. Sales tax is computed according to destination state requirements where applicable.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', margin: '0 0 10px' }}>
              2. Domestic Shipping & Title
            </h2>
            <p>
              Parcels are delivered within the United States via standard commercial carriers (USPS, UPS, FedEx). Risk of loss and title for physical items pass to you upon delivery by the carrier.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', margin: '0 0 10px' }}>
              3. Digital E-Books
            </h2>
            <p>
              E-book purchases provide a non-exclusive, non-transferable personal license to download and read the literary work. Commercial redistribution or resale is prohibited.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', margin: '0 0 10px' }}>
              4. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, Ann’s Bookstore shall not be liable for indirect, incidental, or consequential damages resulting from the purchase or use of products.
            </p>
          </section>
        </div>
      </Container>
    </Section>
  );
}
