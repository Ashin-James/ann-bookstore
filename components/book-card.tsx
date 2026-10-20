'use client';

import Link from 'next/link';
import { Heart, Plus } from 'lucide-react';
import { books, type Book } from '@/data/books';
import { money } from '@/src/config/site.config';
import { useStore } from '@/contexts/store-context';

export function Cover({ book }: { book: Book }) {
  return (
    <div
      className={`book-cover cover-${book.cover}`}
      aria-label={`Cover artwork for ${book.title}`}
      role="img"
    >
      <span className="cover-author" aria-hidden="true">
        ANN
      </span>
      <div className="cover-title" aria-hidden="true">
        {book.title}
      </div>
      <div className="cover-rule" aria-hidden="true" />
      <span className="cover-subtitle" aria-hidden="true">
        {book.note || book.category}
      </span>
      <span className="cover-bottom" aria-hidden="true">
        A STORY BY ANN
      </span>
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
        <button
          type="button"
          className={`wishlist-button ${isSaved ? 'is-saved' : ''}`}
          onClick={() => toggleWishlist(book.id)}
          aria-label={isSaved ? `Remove ${book.title} from wishlist` : `Add ${book.title} to wishlist`}
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="quick-add"
          onClick={() => addToCart(book.id, format.id)}
          aria-label={`Add ${book.title} to cart`}
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <Plus size={18} aria-hidden="true" />
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
