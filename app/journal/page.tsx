import Link from 'next/link';
import { ArrowUpRight, Clock, Calendar } from 'lucide-react';
import { journalArticles } from '@/data/journal';
import Container from '@/components/container';
import Section from '@/components/section';

export const metadata = {
  title: 'Journal — Ann’s Bookstore',
  description: 'Essays, writing reflections, and quiet notes from Ann’s writing desk.',
};

export default function JournalPage() {
  return (
    <Section className="journal-page-section">
      <Container style={{ maxWidth: '960px' }}>
        <header className="page-intro" style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span className="eyebrow">LETTERS & REFLECTIONS</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(42px, 7vw, 68px)', margin: '12px 0 16px' }}>
            The <em>Journal.</em>
          </h1>
          <p style={{ maxWidth: '540px', margin: '0 auto', color: 'var(--muted)', fontSize: '16px' }}>
            Occasional essays on monsoon, memory, handwritten letters, and the architecture of quiet spaces.
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          {journalArticles.map((article) => (
            <article
              key={article.id}
              style={{
                padding: '36px',
                backgroundColor: 'var(--white)',
                borderRadius: '12px',
                border: '1px solid var(--line)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '14px', color: 'var(--muted)', flexWrap: 'wrap' }}>
                <span
                  style={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 600,
                    color: 'var(--wine)',
                    background: 'rgba(126, 51, 70, 0.08)',
                    padding: '2px 8px',
                    borderRadius: '4px',
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
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', margin: '0 0 8px', color: 'var(--ink)' }}>
                  <Link
                    href={`/journal/${article.slug}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
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

              <blockquote
                style={{
                  margin: '10px 0',
                  paddingLeft: '16px',
                  borderLeft: '2px solid var(--wine)',
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: '17px',
                  color: 'var(--wine)',
                }}
              >
                “{article.pullQuote}”
              </blockquote>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', flexWrap: 'wrap', gap: '12px' }}>
                <Link
                  href={`/journal/${article.slug}`}
                  className="text-link"
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  Read full reflection <ArrowUpRight size={18} aria-hidden="true" />
                </Link>

                {article.relatedBookTitle && (
                  <span style={{ fontSize: '14px', color: 'var(--muted)' }}>
                    Companion to <em>{article.relatedBookTitle}</em>
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
