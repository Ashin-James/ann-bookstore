'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight, Mail, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { books } from '@/data/books';
import { journalArticles } from '@/data/journal';
import { BookGrid, Cover } from '@/components/book-card';
import { useLanguage } from '@/contexts/language-context';
import { SITE_CONFIG } from '@/src/config/site.config';
import Container from '@/components/container';
import Section from '@/components/section';
import { heroVariants, motionTokens } from '@/lib/motion';

export default function Home() {
  const featured = books[0];
  const { t } = useLanguage();
  const latestArticles = journalArticles.slice(0, 2);
  const [subscribed, setSubscribed] = useState(false);

  return (
    <>
      {/* Hero Section */}
      <Section className="hero-section" style={{ overflow: 'hidden' }}>
        <Container className="hero">
          <motion.div
            className="hero-copy"
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            custom={0}
          >
            <span className="eyebrow hero-kicker">
              <span className="tiny-dot" aria-hidden="true" /> A NOVEL BY ANN
            </span>
            <h1>
              Some stories<br />
              stay <em>with us.</em>
            </h1>
            <p className="hero-description">
              A family, one long monsoon, and the small choices that change everything.
            </p>
            <div className="hero-actions">
              <Link className="button button-dark" href={`/books/${featured.slug}`}>
                {t('discoverBook')} <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <Link className="text-link" href={`/books/${featured.slug}/chapter-one`}>
                {t('readChapterOne')} <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
            <div className="hero-note">
              <span className="note-line" aria-hidden="true" />
              For the moments that make us who we are.
            </div>
          </motion.div>

          <motion.div
            className="hero-art"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionTokens.duration.normal, ease: [0.2, 0.0, 0, 1.0] }}
          >
            <div className="art-sun" aria-hidden="true" />
            <div className="art-label">
              <span>{t('featuredStory')}</span>
              <span>NO. 01</span>
            </div>
            <Cover book={featured} />
            <div className="hero-art-caption">
              <span>THE QUIET HOURS</span>
              <span>01 / 04</span>
            </div>
            <div className="art-orbit" aria-hidden="true" />
          </motion.div>

          <a className="scroll-cue" href="#shelf">
            <ArrowDown size={16} aria-hidden="true" /> {t('scrollDiscover')}
          </a>
        </Container>
      </Section>

      {/* Marquee Band */}
      <div className="marquee-band" role="region" aria-label="Key themes">
        <span>MONSOON</span>
        <i aria-hidden="true">✳</i>
        <span>SILENCE</span>
        <i aria-hidden="true">✳</i>
        <span>RETURN</span>
        <i aria-hidden="true">✳</i>
        <span>THE THINGS WE KEEP</span>
      </div>

      {/* The Shelf */}
      <Section id="shelf" className="shelf-section">
        <Container>
          <div className="section-heading">
            <div>
              <span className="eyebrow">{t('curatedShelf')}</span>
              <h2>{t('curatedShelfTitle')}</h2>
            </div>
            <Link className="text-link" href="/books">
              {t('exploreAll')} <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <BookGrid />
        </Container>
      </Section>

      {/* Author Section */}
      <Section className="author-outer-section">
        <Container>
          <div className="author-section">
            <div className="author-art">
              <div className="author-monogram" aria-hidden="true">
                A<span>.</span>
              </div>
              <div className="author-photo-note">
                A PLACE FOR WORDS<br />
                AND OTHER QUIET THINGS
              </div>
            </div>
            <div className="author-copy">
              <span className="eyebrow">{t('authorNote')}</span>
              <h2>
                Every story begins<br />
                with <em>something small.</em>
              </h2>
              <p>
                Sometimes it is a sound from another room. Sometimes it is the smell of rain on a familiar street.
                Ann writes about the small moments that quietly change everything.
              </p>
              <p className="placeholder-note">
                Composed unhurriedly on acid-free archival paper from the rain-swept coast of southern India.
              </p>
              <Link className="text-link light-link" href="/about">
                {t('getToknowAnn')} <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <span className="author-signature">Ann.</span>
            </div>
          </div>
        </Container>
      </Section>

      {/* Quote Section */}
      <Section className="quote-section">
        <Container>
          <span className="eyebrow">A THOUGHT TO KEEP</span>
          <blockquote>“Somewhere between the rain and the remembering, we find our way home.”</blockquote>
          <span className="quote-caption">ANN · FROM THE QUIET HOURS</span>
        </Container>
      </Section>

      {/* Editorial Journal Preview */}
      <Section style={{ borderTop: '1px solid var(--line)', background: 'var(--white)' }}>
        <Container>
          <div className="section-heading">
            <div>
              <span className="eyebrow">FROM THE WRITING DESK</span>
              <h2>Notes from the <em>Journal.</em></h2>
            </div>
            <Link className="text-link" href="/journal">
              Read all reflections <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {latestArticles.map((art) => (
              <article
                key={art.id}
                style={{
                  padding: '28px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--paper)',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '14px', color: 'var(--muted)', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--wine)', fontWeight: 600 }}>{art.category}</span>
                    <span>·</span>
                    <span>{art.readTime}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: '0 0 10px', color: 'var(--ink)' }}>
                    <Link href={`/journal/${art.slug}`} style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', minHeight: '44px' }}>
                      {art.title}
                    </Link>
                  </h3>
                  <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 16px' }}>
                    {art.excerpt}
                  </p>
                </div>

                <Link href={`/journal/${art.slug}`} className="text-link" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Read essay <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* Newsletter Section */}
      <Section id="journal" className="newsletter-outer-section">
        <Container className="newsletter-section">
          <div>
            <span className="eyebrow">LETTERS FROM ANN</span>
            <h2>
              A little note, <em>now and then.</em>
            </h2>
            <p>Occasional notes on writing, new books, and the small things worth noticing.</p>
          </div>
          {subscribed ? (
            <div
              style={{
                padding: '24px',
                backgroundColor: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                maxWidth: '520px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--wine)', marginBottom: '8px' }}>
                <CheckCircle2 size={20} aria-hidden="true" />
                <strong style={{ fontSize: '15px' }}>Check your inbox to confirm your subscription (Double Opt-In)</strong>
              </div>
              <p style={{ fontSize: '14px', margin: '0 0 10px', color: 'var(--muted)', lineHeight: 1.5 }}>
                A confirmation link has been simulated. Once confirmed, you will receive occasional letters on writing and new editions.
              </p>
              <small style={{ fontSize: '14px', color: 'var(--muted)', display: 'block', borderTop: '1px dashed var(--line)', paddingTop: '8px' }}>
                {SITE_CONFIG.complianceMailingAddress} · {SITE_CONFIG.unsubscribeNotice}
              </small>
            </div>
          ) : (
            <form
              className="newsletter-form"
              onSubmit={(e) => {
                e.preventDefault();
                setSubscribed(true);
              }}
            >
              <label htmlFor="newsletter-email">Your email address</label>
              <div>
                <input id="newsletter-email" type="email" required placeholder="reader@example.com" />
                <button
                  type="submit"
                  aria-label="Submit email for newsletter"
                  style={{ minWidth: '44px', minHeight: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Mail size={20} />
                </button>
              </div>
              <small style={{ display: 'block', marginTop: '8px' }}>
                Double opt-in verification required. {SITE_CONFIG.unsubscribeNotice}
              </small>
            </form>
          )}
        </Container>
      </Section>
    </>
  );
}
