'use client';

import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Heart, ShieldCheck, ShoppingBag } from 'lucide-react';
import { books } from '@/data/books';
import { money } from '@/src/config/site.config';
import { Cover, BookGrid } from '@/components/book-card';
import { useStore } from '@/contexts/store-context';
import Container from '@/components/container';
import Section from '@/components/section';

export default function BookDetail() {
  const params = useParams<{ slug: string }>();
  const book = books.find((b) => b.slug === params.slug);
  const [formatId, setFormatId] = useState(book?.formats[0]?.id || '');
  const [qty, setQty] = useState(1);
  const { addToCart, toggleWishlist, wishlist } = useStore();

  if (!book) return notFound();

  const format = book.formats.find((f) => f.id === formatId) || book.formats[0];
  const related = books.filter((b) => b.id !== book.id).slice(0, 4);

  return (
    <Section className="product-page-section">
      <Container>
        <div className="breadcrumbs">
          <Link href="/books">
            <ArrowLeft size={16} aria-hidden="true" /> All books
          </Link>
          <span>/</span>
          <span>{book.title}</span>
        </div>

        <div className="product-layout">
          <div className="product-art-panel">
            <div className="product-cover-large">
              <Cover book={book} />
            </div>
            <span className="eyebrow">A BOOK TO MAKE YOUR OWN</span>
          </div>

          <div className="product-info">
            <span className="eyebrow">{book.category.toUpperCase()} · BY ANN</span>
            <h1>{book.title}</h1>
            <p className="product-subtitle">{book.shortDescription}</p>

            <div className="product-price">
              {money(format.price)} <span>[SAMPLE PRICE: USD]</span>
            </div>

            <div className="product-divider" />
            <p className="product-description">{book.description}</p>

            <label className="field-label">Choose your edition</label>
            <div className="format-options">
              {book.formats.map((f) => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => setFormatId(f.id)}
                  className={formatId === f.id ? 'format-option selected' : 'format-option'}
                  aria-pressed={formatId === f.id}
                >
                  <span>{f.name}</span>
                  <strong>{money(f.price)}</strong>
                </button>
              ))}
            </div>

            <div className="purchase-row">
              <div className="quantity-control">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(Math.min(20, qty + 1))}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="button button-dark add-product"
                onClick={() => {
                  for (let i = 0; i < qty; i++) addToCart(book.id, format.id);
                }}
              >
                <ShoppingBag size={18} aria-hidden="true" /> Add to bag · {money(format.price * qty)}
              </button>

              <button
                type="button"
                className={`product-wishlist ${wishlist.includes(book.id) ? 'is-saved' : ''}`}
                onClick={() => toggleWishlist(book.id)}
                aria-label={wishlist.includes(book.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={20} fill={wishlist.includes(book.id) ? 'currentColor' : 'none'} aria-hidden="true" />
              </button>
            </div>

            <div className="trust-note">
              <ShieldCheck size={20} aria-hidden="true" />
              <span>DEMO: No payment is taken and no order is fulfilled</span>
            </div>

            <div className="product-details">
              <div>
                <span>Author</span>
                <strong>Ann</strong>
              </div>
              <div>
                <span>Format</span>
                <strong>{format.name}</strong>
              </div>
              <div>
                <span>Language</span>
                <strong>English</strong>
              </div>
            </div>

            <Link className="text-link" href={`/books/${book.slug}/chapter-one`}>
              Read a sample chapter <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="related-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">IF THIS SPEAKS TO YOU</span>
              <h2>More to <em>discover.</em></h2>
            </div>
            <Link className="text-link" href="/books">
              All books <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <BookGrid items={related} />
        </div>
      </Container>
    </Section>
  );
}
