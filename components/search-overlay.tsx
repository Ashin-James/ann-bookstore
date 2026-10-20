'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, CornerDownLeft, BookOpen } from 'lucide-react';
import { books } from '@/data/books';
import { money } from '@/src/config/site.config';
import { Cover } from '@/components/book-card';
import { useLanguage } from '@/contexts/language-context';

export default function SearchOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setSelectedIndex(0);
      triggerRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab' && isOpen) {
        const dialog = document.querySelector('[role="dialog"]');
        if (dialog) {
          const focusables = dialog.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusables.length > 0) {
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filtered = query.trim()
    ? books.filter((b) => {
        const q = query.toLowerCase();
        return (
          b.title.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          (b.shortDescription && b.shortDescription.toLowerCase().includes(q))
        );
      })
    : books;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      router.push(`/books/${filtered[selectedIndex].slug}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="search-overlay-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search stories"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-overlay)',
        backgroundColor: 'rgba(20, 18, 15, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '60px 16px 20px',
      }}
    >
      <div
        className="search-overlay-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: 'var(--paper)',
          borderRadius: '12px',
          border: '1px solid var(--line)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            borderBottom: '1px solid var(--line)',
            gap: '12px',
          }}
        >
          <Search size={20} color="var(--wine)" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('searchPlaceholder')}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '16px',
              fontFamily: 'var(--font-sans)',
              color: 'var(--ink)',
              minHeight: '44px',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                border: 0,
                background: 'transparent',
                minWidth: '44px',
                minHeight: '44px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            style={{
              fontSize: '14px',
              padding: '6px 12px',
              minHeight: '44px',
              minWidth: '44px',
              borderRadius: '6px',
              border: '1px solid var(--line)',
              color: 'var(--ink)',
              background: 'transparent',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close search dialog"
          >
            ESC
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '12px', flex: 1 }}>
          <div
            style={{
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--muted)',
              padding: '6px 12px 10px',
            }}
          >
            {query.trim() ? `${filtered.length} stories found` : 'Ann’s Bookshelf'}
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--muted)' }}>
              <BookOpen size={28} style={{ margin: '0 auto 12px', opacity: 0.5 }} aria-hidden="true" />
              <p style={{ margin: 0, fontSize: '15px' }}>{t('searchNoResults')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filtered.map((book, idx) => {
                const isSelected = idx === selectedIndex;
                const minPrice = Math.min(...book.formats.map((f) => f.price));
                return (
                  <Link
                    key={book.id}
                    href={`/books/${book.slug}`}
                    onClick={onClose}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'rgba(126, 51, 70, 0.08)' : 'transparent',
                      border: isSelected ? '1px solid rgba(126, 51, 70, 0.2)' : '1px solid transparent',
                      textDecoration: 'none',
                      minHeight: '52px',
                    }}
                  >
                    <div
                      style={{
                        width: '42px',
                        height: '58px',
                        flexShrink: 0,
                        transform: 'scale(0.24)',
                        transformOrigin: 'top left',
                        marginRight: '-120px',
                        marginBottom: '-165px',
                        pointerEvents: 'none',
                      }}
                      aria-hidden="true"
                    >
                      <Cover book={book} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0, paddingLeft: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '17px',
                            fontWeight: 600,
                            color: 'var(--ink)',
                          }}
                        >
                          {book.title}
                        </span>
                        <span
                          style={{
                            fontSize: '14px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'var(--beige)',
                            color: 'var(--ink)',
                          }}
                        >
                          {book.category}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: '4px 0 0',
                          fontSize: '14px',
                          color: 'var(--muted)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {book.shortDescription || book.description}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--wine)' }}>
                        from {money(minPrice)}
                      </span>
                      {isSelected && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '4px',
                            color: 'var(--wine)',
                            fontSize: '14px',
                            marginTop: '4px',
                          }}
                        >
                          <span>Open</span>
                          <CornerDownLeft size={14} aria-hidden="true" />
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--line)',
            backgroundColor: 'rgba(0,0,0,0.02)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px',
            color: 'var(--muted)',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <span>Use &uarr; &darr; to navigate, Enter to select</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
