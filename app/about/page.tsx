import Link from 'next/link';
import { ArrowUpRight, Feather, Heart } from 'lucide-react';
import Container from '@/components/container';
import Section from '@/components/section';

export const metadata = {
  title: 'About Ann — Stories That Stay',
  description: 'Learn about Ann’s literary journey, the themes of monsoon and memory, and her writing philosophy.',
};

export default function AboutPage() {
  return (
    <Section className="about-page-section">
      <Container style={{ maxWidth: '920px' }}>
        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span className="eyebrow">ABOUT THE AUTHOR</span>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(44px, 7vw, 76px)',
              margin: '14px 0 16px',
              lineHeight: 1.1,
            }}
          >
            Stories begin<br />
            with <em>noticing.</em>
          </h1>
          <p style={{ maxWidth: '580px', margin: '0 auto', color: 'var(--muted)', fontSize: '18px', fontStyle: 'italic' }}>
            “The rain did not begin with thunder; it arrived as a rumor on the veranda wind.”
          </p>
        </header>

        {/* Atmospheric Author Feature Banner */}
        <div
          className="about-art"
          style={{
            height: '320px',
            borderRadius: '12px',
            backgroundColor: 'var(--wine)',
            color: 'var(--paper)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '50px',
            boxShadow: '0 10px 30px rgba(126, 51, 70, 0.2)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '120px',
              fontWeight: 700,
              opacity: 0.18,
              userSelect: 'none',
            }}
            aria-hidden="true"
          >
            A.
          </span>
          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <span style={{ fontSize: '14px', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.9 }}>
              THE WRITING DESK · KOCHI, KERALA
            </span>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', margin: '8px 0 0', fontStyle: 'italic' }}>
              Where words are composed unhurriedly.
            </p>
          </div>
        </div>

        {/* Core Biography and Philosophy */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', fontSize: '17px', lineHeight: 1.8, color: 'var(--ink)' }}>
          <p style={{ fontSize: '20px', lineHeight: 1.6, color: 'var(--ink)', fontWeight: 400 }}>
            Ann is an author writing from the rain-swept coast of southern India. Her work examines themes of ancestral homes, silent devotion, coastal folklore, and the delicate trade-offs between communal duty and personal truth.
          </p>

          <p>
            Her debut novel, <em>The Quiet Hours</em>, was awarded literary recognition for its atmospheric portrayal of domestic solitude during the south-west monsoon. Composed over three rainy months, it asks how families hold onto love when time and circumstance demand silence.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px',
              margin: '20px 0',
            }}
          >
            <div
              style={{
                padding: '24px',
                backgroundColor: 'var(--white)',
                borderRadius: '8px',
                border: '1px solid var(--line)',
              }}
            >
              <div style={{ color: 'var(--wine)', marginBottom: '10px' }}>
                <Feather size={22} aria-hidden="true" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: '0 0 8px' }}>
                Archival Craft
              </h3>
              <p style={{ fontSize: '15px', margin: 0, color: 'var(--muted)', lineHeight: 1.6 }}>
                Every physical volume is printed on acid-free archival paper with attention to tactile binding, cloth spines, and enduring beauty.
              </p>
            </div>

            <div
              style={{
                padding: '24px',
                backgroundColor: 'var(--white)',
                borderRadius: '8px',
                border: '1px solid var(--line)',
              }}
            >
              <div style={{ color: 'var(--wine)', marginBottom: '10px' }}>
                <Heart size={22} aria-hidden="true" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: '0 0 8px' }}>
                Quiet Intimacy
              </h3>
              <p style={{ fontSize: '15px', margin: 0, color: 'var(--muted)', lineHeight: 1.6 }}>
                Stories written not for speed, but for contemplation—meant to be read beside rain, over morning tea, or in unhurried silence.
              </p>
            </div>
          </div>

          <p>
            All special hardcover editions ordered directly through this bookstore include an author bookplate signed by Ann. E-book editions are offered DRM-free in open EPUB formats.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '20px' }}>
            <Link href="/books" className="button button-dark">
              Explore Ann’s Books <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/journal" className="button button-outline">
              Read the Journal
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}
