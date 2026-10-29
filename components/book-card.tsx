'use client';

import Link from 'next/link';
import { Heart, Plus } from 'lucide-react';
import { books, type Book } from '@/data/books';
import { money } from '@/src/config/site.config';
import { useStore } from '@/contexts/store-context';

export function Cover({
  book,
  size = 'default',
  className = '',
}: {
  book: Book;
  size?: 'default' | 'sm' | 'xs';
  className?: string;
}) {
  const isImageCover = book.cover?.startsWith('data:') || book.cover?.startsWith('http') || book.cover?.startsWith('/');
  const altText = book.coverAlt || `Cover artwork for ${book.title}`;

  if (size === 'xs') {
    return (
      <div
        className={`book-cover-thumb ${isImageCover ? '' : `cover-${book.cover}`} ${className}`.trim()}
        aria-label={altText}
        role="img"
        style={isImageCover ? { backgroundImage: `url(${book.cover})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        <div className="book-spine-hinge-thumb" aria-hidden="true" />
        <div className="book-pages-block-thumb" aria-hidden="true" />
        <div className="book-linen-texture" aria-hidden="true" />
        <div className="book-emboss-frame-thumb" aria-hidden="true">
          <span className="cover-author-thumb">{book.author || 'ANN'}</span>
          <span className="cover-title-thumb">{book.title}</span>
        </div>
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <div
        className={`book-cover-sm ${isImageCover ? '' : `cover-${book.cover}`} ${className}`.trim()}
        aria-label={altText}
        role="img"
        style={isImageCover ? { backgroundImage: `url(${book.cover})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        <div className="book-spine-hinge-sm" aria-hidden="true" />
        <div className="book-pages-block-sm" aria-hidden="true" />
        <div className="book-linen-texture" aria-hidden="true" />
        <div className="book-emboss-frame-sm" aria-hidden="true">
          <span className="cover-author-sm">{book.author || 'ANN'}</span>
          <div className="cover-title-sm">{book.title}</div>
          <div className="cover-rule-sm" />
          <span className="cover-subtitle-sm">{book.category}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`book-cover ${isImageCover ? '' : `cover-${book.cover}`} ${className}`.trim()}
      aria-label={altText}
      role="img"
      style={isImageCover ? { backgroundImage: `url(${book.cover})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      <div className="book-spine-hinge" aria-hidden="true" />
      <div className="book-pages-block" aria-hidden="true" />
      <div className="book-linen-texture" aria-hidden="true" />
      <div className="book-ribbon-bookmark" aria-hidden="true" />
      <div className="book-emboss-frame" aria-hidden="true">
        <span className="cover-author" aria-hidden="true">
          {book.author || 'ANN'}
        </span>
        <div className="cover-title" aria-hidden="true">
          {book.title}
        </div>
        <div className="cover-rule" aria-hidden="true" />
        <span className="cover-subtitle" aria-hidden="true">
          {book.note || book.category}
        </span>
        <span className="cover-bottom" aria-hidden="true">
          A STORY BY {book.author || 'ANN'}
        </span>
      </div>
    </div>
  );
}

export default function BookCard({ book }: { book: Book }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const format = book.formats[0];
  const isSaved = wishlist.includes(book.id);

  return (
    <article className="book-card">
      <div className="book-card-art">
        <Link href={`/books/${book.slug}`} aria-label={`View ${book.title}`}>
          <Cover book={book} />
        </Link>

        {/* Hover Literary Excerpt Drawer */}
        <div className="book-card-excerpt" aria-hidden="true">
          &ldquo;{book.shortDescription}&rdquo;
        </div>

        <button
          type="button"
          className={`wishlist-button ${isSaved ? 'is-saved' : ''}`}
          onClick={(e) => {
            e.currentTarget.classList.toggle('is-saved');
            toggleWishlist(book.id);
          }}
          aria-label={isSaved ? `Remove ${book.title} from wishlist` : `Add ${book.title} to wishlist`}
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="quick-add"
          onClick={() => addToCart(book.id, format.id, false)}
          aria-label={`Add ${book.title} to cart`}
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <Plus size={16} aria-hidden="true" />
          <span>Add</span>
        </button>
      </div>
      <div className="book-card-meta">
        <span className="eyebrow">{book.category}</span>
        <Link className="book-title" href={`/books/${book.slug}`}>
          {book.title}
        </Link>
        <div className="book-price">
          {money(format.price)} <span>· {format.name}</span>
        </div>
      </div>
    </article>
  );
}

export function BookGrid({ items = books }: { items?: Book[] }) {
  return (
    <div className="book-grid">
      {items.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
