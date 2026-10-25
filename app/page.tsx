'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowDown, ArrowRight, ArrowUpRight, Mail, CheckCircle2, Lock, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { books } from '@/data/books';
import { journalArticles } from '@/data/journal';
import { BookGrid, Cover } from '@/components/book-card';
import { useLanguage } from '@/contexts/language-context';
import { SITE_CONFIG } from '@/src/config/site.config';
import Container from '@/components/container';
import Section from '@/components/section';
import Reveal, { RevealItem } from '@/components/reveal';
import { heroVariants, motionTokens } from '@/lib/motion';

const marqueeItems = [
  { roman: 'I', title: 'MONSOON', num: '01' },
  { roman: 'II', title: 'THE RETURN', num: '02' },
  { roman: 'III', title: 'THE SILENCE', num: '03' },
  { roman: 'IV', title: 'MEMORY', num: '04' },
  { roman: 'V', title: 'BELONGING', num: '05' },
  { roman: 'VI', title: 'WHAT WE KEEP', num: '06' },
];

export default function Home() {
  const featured = books[0];
  const { t } = useLanguage();
  const latestArticles = journalArticles.slice(0, 2);
  const [subscribed, setSubscribed] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'Novel' | 'Essays' | 'E-book'>('all');

  const filteredBooks = selectedFilter === 'all'
    ? books
    : books.filter((b) => b.category.toLowerCase().includes(selectedFilter.toLowerCase()));

  return (
    <>
      {/* 1. Hero Section — The Collector's Edition Centerpiece */}
      <Section className="hero-section">
        <Container className="hero">
          <motion.div
            className="hero-copy"
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            custom={0}
          >
            <div className="hero-kicker">
              <span className="archival-badge">
                <span className="tiny-dot" aria-hidden="true" />
                ARCHIVAL FIRST IMPRESSION // VOL. 01
              </span>
            </div>

            <h1>
              Some stories<br />
              stay <em>with us.</em>
            </h1>

            <p className="hero-description">
              A family, one long rainy season, and the small choices that quietly change everything.
              An intimate exploration of memory, loss, and the courage to return.
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
              Composed unhurriedly on acid-free paper from the rain-swept southern coast.
            </div>
          </motion.div>

          {/* 3D Physical Tome Centerpiece */}
          <motion.div
            className="hero-art"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionTokens.duration.relaxed, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="art-sun" aria-hidden="true" />
            <div className="hero-pedestal-shadow" aria-hidden="true" />

            <div className="art-label">
              <span>[ THE QUIET HOURS ]</span>
              <span>NO. 01 // FIRST EDITION</span>
            </div>

            <div className="hero-book-wrap">
              <Cover book={featured} />
            </div>

            <div className="hero-provenance" aria-hidden="true">
              <span>HARDCOVER IN NATURAL CLOTH</span>
              <span className="provenance-sep">✦</span>
              <span>384 PAGES</span>
              <span className="provenance-sep">✦</span>
              <span>SMYTH-SEWN BINDING</span>
            </div>

            <div className="hero-art-caption">
              <span>EDITION 01 / 04</span>
              <span>KERALA ATELIER</span>
            </div>
          </motion.div>

          <a className="scroll-cue" href="#shelf">
            <ArrowDown size={14} aria-hidden="true" /> {t('scrollDiscover')}
          </a>
        </Container>
      </Section>

      {/* 2. Marquee Band — The Archival Woven Linen Ribbon */}
      <div className="marquee-band" role="region" aria-label="Key themes and taxonomy">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div className="marquee-item" key={copy} aria-hidden={copy === 1 ? 'true' : undefined}>
              {marqueeItems.map((item, i) => (
                <span key={`${copy}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                  <i aria-hidden="true">✦</i>
                  <span>{item.roman}. {item.title}</span>
                  <span className="marquee-num">[{item.num}]</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 3. The Shelf — The Salon Specimen Table */}
      <Section id="shelf" className="shelf-section">
        <Container>
          <Reveal variant="fadeUp">
            <div className="section-heading">
              <div>
                <span className="eyebrow">[ 2026 CATALOGUE // EDITIONS 01 — 04 ]</span>
                <h2>{t('curatedShelfTitle')}</h2>
              </div>
              <Link className="text-link" href="/books">
                {t('exploreAll')} <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </div>

            {/* Filter Pill Switcher */}
            <div className="shelf-controls">
              <div className="shelf-filters" role="tablist" aria-label="Filter volumes by category">
                <button
                  type="button"
                  className={`shelf-filter-btn ${selectedFilter === 'all' ? 'is-active' : ''}`}
                  onClick={() => setSelectedFilter('all')}
                  role="tab"
                  aria-selected={selectedFilter === 'all'}
                >
                  All Volumes (4)
                </button>
                <button
                  type="button"
                  className={`shelf-filter-btn ${selectedFilter === 'Novel' ? 'is-active' : ''}`}
                  onClick={() => setSelectedFilter('Novel')}
                  role="tab"
                  aria-selected={selectedFilter === 'Novel'}
                >
                  Novels (2)
                </button>
                <button
                  type="button"
                  className={`shelf-filter-btn ${selectedFilter === 'Essays' ? 'is-active' : ''}`}
                  onClick={() => setSelectedFilter('Essays')}
                  role="tab"
                  aria-selected={selectedFilter === 'Essays'}
                >
                  Essays (1)
                </button>
                <button
                  type="button"
                  className={`shelf-filter-btn ${selectedFilter === 'E-book' ? 'is-active' : ''}`}
                  onClick={() => setSelectedFilter('E-book')}
                  role="tab"
                  aria-selected={selectedFilter === 'E-book'}
                >
                  Digital Folios (1)
                </button>
              </div>

              <span className="eyebrow" style={{ fontSize: '11px' }}>
                ARCHIVAL LINEN & DECKLE EDITIONS
              </span>
            </div>
          </Reveal>

          <Reveal variant="fadeUp" delay={0.15}>
            <BookGrid items={filteredBooks} />
          </Reveal>
        </Container>
      </Section>

      {/* 4. Author Section — The Atelier Chamber (High-Contrast Dramatic Break) */}
      <Section className="author-outer-section">
        <Container>
          <Reveal variant="scaleUp">
            <div className="author-section">
              {/* Studio Window Art with Passe-Partout & Brass Corner Tabs */}
              <div className="author-art">
                <div className="author-monogram" aria-hidden="true">
                  A.
                </div>
                <div className="author-photo-matting">
                  <div className="brass-tab brass-tl" aria-hidden="true" />
                  <div className="brass-tab brass-tr" aria-hidden="true" />
                  <div className="brass-tab brass-bl" aria-hidden="true" />
                  <div className="brass-tab brass-br" aria-hidden="true" />
                  <Image
                    src="/images/author-studio.jpg"
                    alt="Ann's coastal writing desk overlooking the rain-swept southern coast"
                    width={800}
                    height={600}
                    className="author-studio-img"
                    priority
                  />
                </div>
                <div className="author-photo-note">
                  <span>ANN&apos;S DESK // KERALA COAST</span>
                  <span>EST. MMXXIV</span>
                </div>
              </div>

              {/* Atelier Reflection & Hand-Pressed Note */}
              <div className="author-copy">
                <span className="eyebrow">[ ATELIER REFLECTIONS // THE AUTHOR ]</span>
                <h2>
                  Every story begins<br />
                  with <em>something small.</em>
                </h2>
                <p>
                  Sometimes it is a sound from another room when the household is asleep.
                  Sometimes it is the smell of rain on a familiar veranda.
                  Ann writes about the quiet, unhurried moments that irrevocably alter who we become.
                </p>

                <div className="stationery-note">
                  <p>
                    &ldquo;Words, like rainfall, find their own level if given enough quiet. Composed unhurriedly on acid-free archival paper.&rdquo;
                  </p>
                </div>

                <div className="author-signature-wrap">
                  <Link className="text-link" style={{ color: '#FAF7F2' }} href="/about">
                    {t('getToknowAnn')} <ArrowUpRight size={18} aria-hidden="true" />
                  </Link>
                  <span className="author-signature-gold">Ann.</span>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* 5. Quote Section — The Architectural Sanctuary */}
      <Section className="quote-section">
        <Container>
          <Reveal variant="fadeUpSlow">
            <span className="eyebrow">[ A THOUGHT TO KEEP ]</span>
            <blockquote>
              &ldquo;Somewhere between the rain and the remembering, we find our way home.&rdquo;
            </blockquote>

            {/* Blind-Embossed Wax Seal Emblem */}
            <div className="wax-seal-wrapper">
              <svg
                className="wax-seal-emblem"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="50" cy="50" r="46" fill="#722638" />
                <circle cx="50" cy="50" r="42" stroke="#C29B62" strokeWidth="1.5" strokeDasharray="2 2" />
                <circle cx="50" cy="50" r="38" stroke="#C29B62" strokeWidth="1" />
                <text
                  x="50"
                  y="58"
                  textAnchor="middle"
                  fontFamily="var(--font-serif), Georgia, serif"
                  fontSize="24"
                  fontStyle="italic"
                  fontWeight="600"
                  fill="#FFFDF9"
                >
                  A.
                </text>
                <text
                  x="50"
                  y="72"
                  textAnchor="middle"
                  fontFamily="var(--font-sans), monospace"
                  fontSize="6.5"
                  letterSpacing="2"
                  fill="#E0C89F"
                >
                  MMXXIV
                </text>
              </svg>

              <span className="quote-caption">ANN · FROM THE QUIET HOURS · FIRST EDITION</span>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* 6. Editorial Journal Preview — The Broadsheet Literary Gazette */}
      <Section style={{ borderTop: '1px solid var(--line)', background: 'var(--paper)' }}>
        <Container>
          <Reveal variant="fadeUp">
            <div className="section-heading">
              <div>
                <span className="eyebrow">[ THE LITERARY GAZETTE // ISSUE NO. 14 ]</span>
                <h2>Notes from the <em>Journal.</em></h2>
              </div>
              <Link className="text-link" href="/journal">
                Read all reflections <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </Reveal>

          <Reveal variant="fadeUp" delay={0.12} stagger staggerDelay={0.15} className="journal-grid">
            {latestArticles.map((art, idx) => (
              <RevealItem key={art.id}>
                <article className="journal-card">
                  <div>
                    <div className="journal-card-meta">
                      <span className="journal-card-category">
                        FOLIO 0{idx + 1} · {art.category}
                      </span>
                      <span className="journal-read-time">
                        <Clock size={13} aria-hidden="true" /> {art.readTime}
                      </span>
                    </div>
                    <h3>
                      <Link href={`/journal/${art.slug}`}>
                        {art.title}
                      </Link>
                    </h3>
                    <p className="journal-card-excerpt">
                      {art.excerpt}
                    </p>
                  </div>

                  <Link
                    href={`/journal/${art.slug}`}
                    className="text-link"
                    style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.06em' }}
                  >
                    READ ESSAY <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                </article>
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </Section>

      {/* 7. Newsletter Section — The Deckle-Edged Correspondence */}
      <Section id="journal" className="newsletter-outer-section">
        <Container className="newsletter-section">
          <Reveal variant="fadeUp">
            <div className="newsletter-stationery-card">
              {/* Postal Cancellation Stamp */}
              <div className="postal-cancellation" aria-hidden="true">
                KERALA ATELIER · POSTAGE PAID · NO. 88
              </div>

              <div className="newsletter-copy">
                <span className="eyebrow newsletter-badge">
                  <span aria-hidden="true">✍</span> THE COLLECTOR&apos;S DISPATCH
                </span>
                <h2>
                  Letters from the <em>Coastal Studio.</em>
                </h2>
                <p>
                  Occasional letters on literature, unhurried reflections, and new edition announcements sent quietly once a month.
                </p>
                <div className="newsletter-perks" aria-hidden="true">
                  <span>✦ SENT ONCE A MONTH</span>
                  <span>✦ ARCHIVAL PRINT NEWS</span>
                  <span>✦ STRICTLY NO SPAM</span>
                </div>
              </div>

              <div className="newsletter-interactive">
                {subscribed ? (
                  <div className="newsletter-success-box">
                    <div className="success-header">
                      <CheckCircle2 size={22} className="success-icon" aria-hidden="true" />
                      <strong>Check your inbox to confirm your subscription (Double Opt-In)</strong>
                    </div>
                    <p>
                      A confirmation link has been simulated. Once confirmed, you will receive occasional letters on writing and new editions.
                    </p>
                    <small>
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
                    <div className="newsletter-input-group">
                      <Mail size={18} className="input-prefix-icon" aria-hidden="true" />
                      <input
                        id="newsletter-email"
                        type="email"
                        required
                        placeholder="reader@example.com"
                      />
                      <button
                        type="submit"
                        className="newsletter-submit-btn"
                        aria-label="Submit email for newsletter"
                        style={{ minWidth: '44px', minHeight: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <span>Join Atelier</span>
                        <ArrowRight size={16} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="newsletter-trust-note">
                      <Lock size={13} aria-hidden="true" />
                      <small>
                        Double opt-in verification required. {SITE_CONFIG.unsubscribeNotice}
                      </small>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
