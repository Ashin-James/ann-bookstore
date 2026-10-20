import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { SITE_CONFIG } from '@/src/config/site.config';
import Container from '@/components/container';
import Section from '@/components/section';

export const metadata = {
  title: 'Privacy Policy & Your Privacy Choices — Ann’s Bookstore',
  description: 'Privacy Policy and CCPA/CPRA Consumer Rights Notice for Ann’s Bookstore.',
};

export default function PrivacyPage() {
  return (
    <Section className="privacy-page-section">
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
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>
            Effective Date: October 20, 2026 · Last Updated: October 20, 2026
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontSize: '16px', lineHeight: 1.7, color: 'var(--ink)' }}>
          <section>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', margin: '0 0 10px' }}>
              1. Information We Collect
            </h2>
            <p>
              Ann’s Bookstore collects minimal information necessary to fulfill book purchases, dispatch parcels within the United States, and communicate with readers. This includes your name, shipping address, email address, and transaction records. In demo mode, zero real payment or billing data is processed or retained.
            </p>
          </section>

          <section id="your-privacy-choices" style={{ padding: '24px', backgroundColor: 'var(--white)', border: '1px solid var(--line)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--wine)', marginBottom: '8px' }}>
              <Shield size={22} aria-hidden="true" />
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: 0 }}>
                2. California Consumer Privacy Act (CCPA / CPRA) Notice
              </h2>
            </div>
            <p style={{ margin: '0 0 14px' }}>
              Under the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA), California residents possess specific privacy rights:
            </p>
            <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><strong>Right to Know & Access:</strong> You may request disclosure of the categories and specific pieces of personal information collected about you.</li>
              <li><strong>Right to Delete:</strong> You may request deletion of personal information collected from you.</li>
              <li><strong>Right to Correct:</strong> You may request correction of inaccurate personal information.</li>
              <li><strong>Do Not Sell or Share:</strong> We do NOT sell, rent, or share personal data with third-party data brokers or advertising networks.</li>
              <li><strong>Non-Discrimination:</strong> You will not be discriminated against for exercising your statutory privacy rights.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', margin: '0 0 10px' }}>
              3. CAN-SPAM Compliance & Email Communications
            </h2>
            <p>
              When you subscribe to author letters or order notifications, we utilize a double opt-in mechanism to confirm your intent. Every commercial email contains an unambiguous unsubscribe link and our physical mailing address:
            </p>
            <blockquote style={{ margin: '12px 0', padding: '14px 20px', backgroundColor: 'var(--beige)', borderLeft: '3px solid var(--wine)', fontStyle: 'italic', fontSize: '15px' }}>
              {SITE_CONFIG.complianceMailingAddress}
            </blockquote>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', margin: '0 0 10px' }}>
              4. Contacting the Store
            </h2>
            <p>
              To exercise your privacy choices, submit a request, or ask questions regarding this policy, please reach out to <a href="mailto:privacy@example.com" style={{ color: 'var(--wine)', textDecoration: 'underline' }}>privacy@example.com</a>.
            </p>
          </section>
        </div>
      </Container>
    </Section>
  );
}
