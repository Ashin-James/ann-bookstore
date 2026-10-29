'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Clock, Calendar, Sparkles } from 'lucide-react';
import { JournalArticle, getStorefrontJournalArticles } from '@/data/journal';
import Container from '@/components/container';
import Section from '@/components/section';
import Reveal from '@/components/reveal';

export default function JournalPage() {
  const [articles, setArticles] = useState<JournalArticle[]>(() => getStorefrontJournalArticles());

  useEffect(() => {
    const sync = () => {
      setArticles(getStorefrontJournalArticles());
    };
    sync();
    window.addEventListener('ann_journal_updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('ann_journal_updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return (
    <Section className="journal-page-section">
      <Container style={{ maxWidth: '960px' }}>
        <Reveal variant="fadeUp">
          <header className="page-intro">
            <span className="newsletter-badge" style={{ marginBottom: '16px' }}>
              <Sparkles size={13} aria-hidden="true" /> LETTERS &amp; ESSAYS
            </span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(44px, 7vw, 72px)', margin: '12px 0 16px', lineHeight: 1.1 }}>
              The <em>Journal.</em>
            </h1>
            <p style={{ maxWidth: '560px', margin: '0 auto', color: 'var(--muted)', fontSize: '17px', lineHeight: 1.6 }}>
              Occasional dispatches on monsoon, memory, handwritten letters, and the architecture of quiet, contemplative spaces.
            </p>
          </header>
        </Reveal>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginTop: '20px' }}>
          {articles.map((article, idx) => (
            <Reveal key={article.id} variant="fadeUp" delay={idx * 0.12}>
              <article className="journal-article-item" data-testid={`journal-card-${article.slug}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '14px', color: 'var(--muted)', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontWeight: 700,
                      color: 'var(--wine)',
                      background: 'rgba(126, 51, 70, 0.08)',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                    }}
                  >
                    {article.category}
                  </span>
                  <span>·</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={15} aria-hidden="true" /> {article.date}
                  </span>
                  <span>·</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={15} aria-hidden="true" /> {article.readTime}
                  </span>
                </div>

                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.2vw, 36px)', margin: '0 0 8px', color: 'var(--ink)' }}>
                    <Link
                      href={`/journal/${article.slug}`}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                      className="book-title"
                    >
                      {article.title}
                    </Link>
                  </h2>
                  <p style={{ fontSize: '16px', color: 'var(--muted)', fontStyle: 'italic', margin: 0 }}>
                    {article.subtitle}
                  </p>
                </div>

                <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'var(--ink)', margin: 0 }}>
                  {article.excerpt}
                </p>

                <div style={{ marginTop: '8px' }}>
                  <Link
                    href={`/journal/${article.slug}`}
                    className="text-link"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--wine)' }}
                  >
                    Read essay <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
