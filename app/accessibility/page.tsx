import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Container from '@/components/container';
import Section from '@/components/section';

export const metadata = {
  title: 'Accessibility Statement — Ann’s Bookstore',
  description: 'Commitment to digital accessibility and WCAG 2.2 AA standards at Ann’s Bookstore.',
};

export default function AccessibilityPage() {
  return (
    <Section className="accessibility-page-section">
      <Container style={{ maxWidth: '820px' }}>
        <Link href="/" className="text-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          <ArrowLeft size={16} aria-hidden="true" /> Return home
        </Link>

        <div style={{ padding: '14px 20px', backgroundColor: '#fff8eb', border: '1px solid #fed7aa', borderRadius: '8px', color: '#9a3412', fontSize: '14px', marginBottom: '36px' }}>
          <strong>LEGAL SCAFFOLD NOTICE:</strong> [DRAFT: needs review by a lawyer. Placeholder text for US compliance.]
        </div>

        <header style={{ marginBottom: '40px' }}>
          <span className="eyebrow">INCLUSION & ACCESS</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '42px', margin: '10px 0 12px' }}>
            Accessibility Statement
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>
            Commitment to digital inclusion for all readers.
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontSize: '16px', lineHeight: 1.7, color: 'var(--ink)' }}>
          <section>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', margin: '0 0 10px' }}>
              1. Our Commitment
            </h2>
            <p>
              Ann’s Bookstore is committed to ensuring that our digital storefront is accessible to all individuals, including individuals with disabilities. We continually work to align our website with the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA standards.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', margin: '0 0 10px' }}>
              2. Accessibility Features
            </h2>
            <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><strong>Keyboard Navigation:</strong> All interactive elements, dropdowns, dialogs, and drawer menus can be navigated using standard keyboard shortcuts (Tab, Enter, Escape, Arrow keys).</li>
              <li><strong>Color Contrast:</strong> Text colors meet or exceed the 4.5:1 minimum contrast ratio against background surfaces.</li>
              <li><strong>Reduced Motion:</strong> Respects the <code style={{ background: 'var(--beige)', padding: '2px 6px', borderRadius: '4px', fontSize: '14px' }}>prefers-reduced-motion</code> system setting by disabling heavy animations and smooth scrolling.</li>
              <li><strong>Screen Readers:</strong> Semantic HTML5 landmarks, ARIA labels, and live regions are implemented for cart updates and announcements.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', margin: '0 0 10px' }}>
              3. Feedback & Assistance
            </h2>
            <p>
              If you encounter any difficulty accessing any part of our website, or if you require assistance placing an order, please email us at <a href="mailto:accessibility@example.com" style={{ color: 'var(--wine)', textDecoration: 'underline' }}>accessibility@example.com</a>. We welcome your feedback and will work to provide the information or service you require.
            </p>
          </section>
        </div>
      </Container>
    </Section>
  );
}
