'use client';

import Link from 'next/link';
import { ArrowUpRight, Feather, Heart, BookOpen, Compass } from 'lucide-react';
import Container from '@/components/container';
import Section from '@/components/section';
import Reveal from '@/components/reveal';

export default function AboutPage() {
  return (
    <Section className="about-page-section">
      <Container style={{ maxWidth: '920px' }}>
        {/* Header Intro */}
        <Reveal variant="fadeUp">
          <header className="page-intro">
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
        </Reveal>

        {/* Atmospheric Author Feature Banner */}
        <Reveal variant="scaleUp" delay={0.15}>
          <div className="about-feature-art" role="img" aria-label="Ann's Writing Desk in Kochi, Kerala">
            <span className="about-monogram" aria-hidden="true">
              A.
            </span>
            <div className="about-stamp">
              <span className="stamp-sub">
                THE WRITING DESK · KOCHI, KERALA
              </span>
              <p className="stamp-heading">
                Where words are composed unhurriedly.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Core Biography and Philosophy */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '28px', fontSize: '17px', lineHeight: 1.8, color: 'var(--ink)' }}>
          <Reveal variant="fadeUp" delay={0.2}>
            <p style={{ fontSize: '21px', lineHeight: 1.6, color: 'var(--ink)', fontWeight: 400 }}>
              Ann is an author writing from the rain-swept coast of southern India. Her work examines themes of ancestral homes, silent devotion, coastal folklore, and the delicate trade-offs between communal duty and personal truth.
            </p>
          </Reveal>

          <Reveal variant="fadeUp" delay={0.25}>
            <p style={{ color: 'var(--muted)' }}>
              Her debut novel, <em>The Quiet Hours</em>, was awarded literary recognition for its atmospheric portrayal of domestic solitude during the south-west monsoon. Composed over three rainy months, it asks how families hold onto love when time and circumstance demand silence.
            </p>
          </Reveal>

          {/* Pillars of Craft Grid */}
          <div className="about-pillars-grid">
            <Reveal variant="fadeUp" delay={0.3}>
              <div className="about-pillar-card">
                <div className="about-pillar-icon" aria-hidden="true">
                  <Feather size={22} />
                </div>
                <h3>Archival Craft</h3>
                <p>
                  Every physical volume is printed on acid-free archival paper with tactile cloth spine binding, sewn signatures, and ribbon markers built to endure generations.
                </p>
              </div>
            </Reveal>

            <Reveal variant="fadeUp" delay={0.35}>
              <div className="about-pillar-card">
                <div className="about-pillar-icon" aria-hidden="true">
                  <Heart size={22} />
                </div>
                <h3>Quiet Intimacy</h3>
                <p>
                  Stories written not for speed, but for contemplation—meant to be read beside rain, over morning tea, or in unhurried silence.
                </p>
              </div>
            </Reveal>

            <Reveal variant="fadeUp" delay={0.4}>
              <div className="about-pillar-card">
                <div className="about-pillar-icon" aria-hidden="true">
                  <BookOpen size={22} />
                </div>
                <h3>DRM-Free E-Books</h3>
                <p>
                  We believe when you buy a digital story, you own it permanently. All e-books are supplied in universal, DRM-free EPUB formats with custom typography.
                </p>
              </div>
            </Reveal>

            <Reveal variant="fadeUp" delay={0.45}>
              <div className="about-pillar-card">
                <div className="about-pillar-icon" aria-hidden="true">
                  <Compass size={22} />
                </div>
                <h3>Signed Bookplates</h3>
                <p>
                  Special editions ordered through this atelier include a hand-stamped, personalized author bookplate signed by Ann in archival India ink.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Pull Quote Box */}
          <Reveal variant="fadeUp" delay={0.3}>
            <div className="about-quote-box">
              <blockquote>
                “Literature is not the mirror that tells us who we are in the rush of daytime; it is the lantern we carry into the quiet rooms of night.”
              </blockquote>
              <cite>— Ann, from <em>On Monsoon and Memory</em></cite>
            </div>
          </Reveal>

          {/* Action CTAs */}
          <Reveal variant="fadeUp" delay={0.35}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px', alignItems: 'center' }}>
              <Link href="/books" className="button button-dark" style={{ minHeight: '48px', padding: '12px 28px' }}>
                Explore Ann’s Books <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/journal" className="button button-outline" style={{ minHeight: '48px', padding: '12px 26px' }}>
                Read the Journal
              </Link>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
