'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Calendar, Clock } from 'lucide-react';
import { JournalArticle, getStorefrontJournalArticleBySlug } from '@/data/journal';
import { books } from '@/data/books';
import Container from '@/components/container';
import Section from '@/components/section';

export default function JournalArticlePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug as string;

  const [article, setArticle] = useState<JournalArticle | undefined | null>(() => {
    if (typeof window !== 'undefined' && slug) {
      return getStorefrontJournalArticleBySlug(slug);
    }
    return undefined;
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (slug) {
      const found = getStorefrontJournalArticleBySlug(slug);
      setArticle(found || null);
    }
  }, [slug]);

  // If after mounting no article was found (or it is draft/scheduled in future), trigger notFound() (404)
  if (mounted && article === null) {
    return notFound();
  }

  // Pre-mount fallback if slug matches initial seed
  const currentArticle = article || (slug ? getStorefrontJournalArticleBySlug(slug) : undefined);
  if (mounted && !currentArticle) {
    return notFound();
  }

  if (!currentArticle) {
    return null;
  }

  const relatedBook = currentArticle.relatedBookSlug
    ? books.find((b) => b.slug === currentArticle.relatedBookSlug)
    : null;

  return (
    <Section className="journal-article-section">
      <Container style={{ maxWidth: '800px' }}>
        <Link
          href="/journal"
          className="text-link"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '40px', fontSize: '14px' }}
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to all journal entries
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '14px', color: 'var(--muted)', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 600,
              color: 'var(--wine)',
            }}
          >
            {currentArticle.category}
          </span>
          <span>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={15} aria-hidden="true" /> {currentArticle.date}
          </span>
          <span>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={15} aria-hidden="true" /> {currentArticle.readTime}
          </span>
        </div>

        <h1
          data-testid="journal-article-title"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(36px, 6vw, 56px)',
            lineHeight: 1.15,
            color: 'var(--ink)',
            margin: '0 0 16px',
          }}
        >
          {currentArticle.title}
        </h1>

        {currentArticle.subtitle && (
          <p
            style={{
              fontSize: '18px',
              color: 'var(--muted)',
              fontStyle: 'italic',
              lineHeight: 1.5,
              margin: '0 0 36px',
              borderBottom: '1px solid var(--line)',
              paddingBottom: '24px',
            }}
          >
            {currentArticle.subtitle}
          </p>
        )}

        {currentArticle.coverImage && (
          <div style={{ margin: '0 0 36px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentArticle.coverImage}
              alt={currentArticle.coverImageAlt || currentArticle.title}
              style={{ width: '100%', maxHeight: '440px', objectFit: 'cover', borderRadius: '4px' }}
            />
          </div>
        )}

        {/* Article Body */}
        {currentArticle.contentHtml ? (
          <div
            data-testid="journal-article-content"
            className="journal-article-html-body"
            style={{ fontSize: '18px', lineHeight: 1.85, color: 'var(--ink)', display: 'flex', flexDirection: 'column', gap: '20px' }}
            dangerouslySetInnerHTML={{ __html: currentArticle.contentHtml }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '18px', lineHeight: 1.85, color: 'var(--ink)' }}>
            {currentArticle.body.map((para, idx) => {
              if (idx === 1 && currentArticle.pullQuote) {
                return (
                  <div key={idx}>
                    <p style={{ margin: '0 0 24px' }}>{para}</p>
                    <blockquote
                      style={{
                        margin: '32px 0',
                        padding: '24px 32px',
                        borderLeft: '3px solid var(--wine)',
                        backgroundColor: 'rgba(126, 51, 70, 0.04)',
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: '22px',
                        lineHeight: 1.5,
                        color: 'var(--wine)',
                      }}
                    >
                      “{currentArticle.pullQuote}”
                    </blockquote>
                  </div>
                );
              }
              return (
                <p
                  key={idx}
                  style={{
                    margin: 0,
                    ...(idx === 0
                      ? {
                          fontSize: '20px',
                          color: 'var(--ink)',
                          fontWeight: 400,
                        }
                      : {}),
                  }}
                >
                  {para}
                </p>
              );
            })}
          </div>
        )}

        {/* Companion Book Recommendation */}
        {relatedBook && (
          <div
            style={{
              marginTop: '60px',
              padding: '28px',
              borderRadius: '10px',
              backgroundColor: 'var(--beige)',
              border: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ minWidth: '240px', flex: 1 }}>
              <span
                style={{
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--wine)',
                  fontWeight: 600,
                }}
              >
                FROM THE BOOKSHELF
              </span>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: '4px 0 6px', color: 'var(--ink)' }}>
                {relatedBook.title}
              </h3>
              <p style={{ margin: 0, fontSize: '15px', color: 'var(--muted)' }}>
                {relatedBook.shortDescription}
              </p>
            </div>
            <Link
              href={`/books/${relatedBook.slug}`}
              className="button button-dark"
              style={{ flexShrink: 0, display: 'inline-flex', padding: '12px 20px', fontSize: '14px', minHeight: '44px' }}
            >
              Explore edition <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        )}
      </Container>
    </Section>
  );
}
