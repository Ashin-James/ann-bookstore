'use client';

import Link from 'next/link';
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import { useStore } from '@/contexts/store-context';
import { books } from '@/data/books';
import { money } from '@/src/config/site.config';
import { Cover } from '@/components/book-card';
import Container from '@/components/container';
import Section from '@/components/section';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useStore();
  const lines = cart
    .map((line) => {
      const book = books.find((b) => b.id === line.bookId);
      const format = book?.formats.find((f) => f.id === line.variantId);
      if (!book || !format) return null;
      return { ...line, book, format, total: format.price * line.quantity };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  const subtotal = lines.reduce((s, l) => s + l.total, 0);

  return (
    <Section className="cart-page-section">
      <Container className="cart-page">
        <span className="eyebrow">YOUR LITTLE STACK</span>
        <h1>Your <em>bag.</em></h1>
        {!lines.length ? (
          <div className="empty-state">
            <div className="empty-bag" aria-hidden="true">✳</div>
            <h2>Nothing in your bag. Yet.</h2>
            <p>There is always another story waiting to be found.</p>
            <Link className="button button-dark" href="/books">
              Explore the bookshelf
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-lines">
              {lines.map((line) => (
                <article className="cart-line" key={line.variantId}>
                  <Link href={`/books/${line.book.slug}`} className="cart-cover" aria-label={`View ${line.book.title}`}>
                    <Cover book={line.book} />
                  </Link>
                  <div className="cart-line-info">
                    <span className="eyebrow">{line.book.category}</span>
                    <Link href={`/books/${line.book.slug}`} className="cart-line-title">
                      {line.book.title}
                    </Link>
                    <span>{line.format.name}</span>
                    <strong>{money(line.format.price)}</strong>
                    <div className="quantity-control">
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.variantId, line.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.variantId, line.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="cart-line-end">
                    <strong>{money(line.total)}</strong>
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => removeFromCart(line.variantId)}
                      aria-label={`Remove ${line.book.title} from bag`}
                    >
                      <Trash2 size={16} aria-hidden="true" /> Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="cart-summary">
              <span className="eyebrow">ORDER SUMMARY</span>
              <div className="summary-row">
                <span>Subtotal</span>
                <strong>{money(subtotal)}</strong>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="summary-total">
                <span>Subtotal</span>
                <strong>{money(subtotal)}</strong>
              </div>
              <p className="demo-note">Demo only. No real order or payment will be created.</p>
              <Link className="button button-dark full-button" href="/checkout">
                Continue to checkout <span>→</span>
              </Link>
              <Link className="text-link continue-link" href="/books">
                <ArrowLeft size={16} aria-hidden="true" /> Continue exploring
              </Link>
            </aside>
          </div>
        )}
      </Container>
    </Section>
  );
}
