'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { books } from '@/data/books';
import { journalArticles } from '@/data/journal';
import { Cover } from '@/components/book-card';
import { useLanguage } from '@/contexts/language-context';
import { money } from '@/src/config/site.config';
import Container from '@/components/container';
import Section from '@/components/section';
import { heroVariants, motionTokens } from '@/lib/motion';

export default function Home() {
  const featured = books[0];
  const shelfBooks = books.slice(1, 4);
  const latestArticles = journalArticles.slice(0, 3);
  const { t } = useLanguage();

  return (
    <>
      {/* 1. HERO SECTION */}
      <Section className="hero-section" padding="lg">
        <Container className="hero-layout">
          <motion.div
            className="hero-copy"
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            custom={0}
          >
            <h1>
              Some stories<br />
              stay <em>with us.</em>
            </h1>
            <p className="hero-sentence">
              A family, one long monsoon, and the small choices that change everything.
            </p>
            <div className="hero-actions">
              <Link className="button button-dark" href={`/books/${featured.slug}`}>
                {t('discoverBook')} <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link className="text-link editorial-link" href={`/books/${featured.slug}/chapter-one`}>
                {t('readChapterOne')} <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="hero-art-wrapper"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionTokens.duration.normal, ease: [0.2, 0, 0, 1] }}
          >
            <div className="hero-book-shadow" aria-label={`Featured edition: ${featured.title}`}>
              <Cover book={featured} />
            </div>
          </motion.div>
        </Container>
      </Section>

      {/* 2. FEATURED BOOK STORY */}
      <Section className="featured-story-section" padding="lg">
        <Container size="md">
          <div className="featured-story-grid">
            <div className="featured-story-art">
              <Link href={`/books/${featured.slug}`} aria-label={`Read more about ${featured.title}`}>
                <div className="lifted-book">
                  <Cover book={featured} />
                </div>
              </Link>
            </div>
            <div className="featured-story-copy">
              <span className="section-label">FEATURED EDITION</span>
              <h2>{featured.title}</h2>
              <p className="editorial-lead">
                An intimate portrait of return, memory, and the unspoken architecture of family life during an unbroken southern monsoon.
              </p>
              <Link className="text-link editorial-link" href={`/books/${featured.slug}`}>
                Explore the edition <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* 3. THE SHELF (3 books, staggered, text links) */}
      <Section id="shelf" className="shelf-section" padding="lg">
        <Container>
          <div className="section-intro">
            <div>
              <span className="section-label">THE BOOKSHELF</span>
              <h2>Selected Works</h2>
            </div>
            <Link className="text-link editorial-link" href="/books">
              {t('exploreAll')} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="calm-shelf-grid">
            {shelfBooks.map((book) => {
              const format = book.formats[0];
              return (
                <article key={book.id} className="shelf-item">
                  <Link href={`/books/${book.slug}`} className="shelf-art-link" aria-label={`View ${book.title}`}>
                    <div className="lifted-book">
                      <Cover book={book} />
                    </div>
                  </Link>
                  <div className="shelf-meta">
                    <span className="section-label">{book.category}</span>
                    <h3 className="shelf-book-title">
                      <Link href={`/books/${book.slug}`} className="shelf-title-link">
                        {book.title}
                      </Link>
                    </h3>
                    <div className="shelf-book-price">
                      {money(format.price)} · <span>{format.name}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* 4. AUTHOR NOTE (portrait slot, one quote, one link) */}
      <Section className="author-note-section" padding="lg">
        <Container size="md">
          <div className="author-note-layout">
            <div className="author-monogram-slot" aria-hidden="true">
              <span className="author-monogram-letter">A</span>
            </div>
            <div className="author-note-content">
              <span className="section-label">THE AUTHOR</span>
              <blockquote className="author-quote">
                “Ann writes about the quiet thresholds where a single afternoon reshapes a lifetime.”
              </blockquote>
              <Link className="text-link editorial-link" href="/about">
                About the author <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* 5. JOURNAL TEASER (3 article titles as text rows, no cards or images) */}
      <Section className="journal-teaser-section" padding="lg">
        <Container size="md">
          <div className="section-intro">
            <div>
              <span className="section-label">FROM THE DESK</span>
              <h2>Notes & Reflections</h2>
            </div>
            <Link className="text-link editorial-link" href="/journal">
              All reflections <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="journal-text-rows">
            {latestArticles.map((art) => (
              <div key={art.id} className="journal-text-row">
                <div className="journal-row-meta">
                  <span className="journal-cat">{art.category}</span>
                  <span className="journal-divider">·</span>
                  <span className="journal-time">{art.readTime}</span>
                </div>
                <h3 className="journal-row-title">
                  <Link href={`/journal/${art.slug}`} className="journal-row-link">
                    {art.title}
                  </Link>
                </h3>
                <Link
                  href={`/journal/${art.slug}`}
                  className="journal-row-action"
                  aria-label={`Read ${art.title}`}
                >
                  <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 6. COMPANION SECTION (one calm card: "What are you in the mood for?", 4 mood chips, one input) */}
      <Section className="companion-calm-section" padding="lg">
        <Container size="sm">
          <div className="companion-calm-card">
            <div className="companion-card-header">
              <Sparkles size={22} className="companion-accent-icon" aria-hidden="true" />
              <span className="section-label">LITERARY COMPANION</span>
              <h2>What are you in the mood for?</h2>
              <p className="companion-card-sub">
                Ask Ann’s companion to find a story that matches your weather, memory, or day.
              </p>
            </div>

            <div className="companion-chips-row" role="group" aria-label="Suggested reading journeys">
              <button type="button" className="mood-chip-btn" onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-companion', { detail: { query: "A quiet rainy afternoon" } }));
                }
              }}>
                A quiet rainy afternoon
              </button>
              <button type="button" className="mood-chip-btn" onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-companion', { detail: { query: "Stories about family" } }));
                }
              }}>
                Stories about family
              </button>
              <button type="button" className="mood-chip-btn" onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-companion', { detail: { query: "A journey without spoilers" } }));
                }
              }}>
                A journey without spoilers
              </button>
              <button type="button" className="mood-chip-btn" onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-companion', { detail: { query: "Where should I begin?" } }));
                }
              }}>
                Where should I begin?
              </button>
            </div>

            <form
              className="companion-calm-form"
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.target as HTMLFormElement).elements.namedItem('companion-input') as HTMLInputElement;
                if (input?.value.trim() && typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-companion', { detail: { query: input.value.trim() } }));
                  input.value = '';
                }
              }}
            >
              <label htmlFor="companion-section-input" className="sr-only">
                Ask the reading companion
              </label>
              <div className="companion-input-wrap">
                <input
                  id="companion-section-input"
                  name="companion-input"
                  type="text"
                  placeholder="Describe a mood, weather, or journey..."
                  className="companion-calm-input"
                />
                <button
                  type="submit"
                  className="button button-dark companion-calm-submit"
                  aria-label="Ask companion"
                >
                  <span>Ask</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </form>
          </div>
        </Container>
      </Section>
    </>
  );
}
