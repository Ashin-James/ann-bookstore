'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, RotateCcw } from 'lucide-react';
import { useStore } from '@/contexts/store-context';
import { books } from '@/data/books';
import { money } from '@/src/config/site.config';
import { SHIPPING_CONFIG } from '@/src/config/shipping.config';
import { Cover } from '@/components/book-card';
import { useLanguage } from '@/contexts/language-context';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    lastRemovedItem,
    undoRemove,
    addToCart,
    cartCount,
  } = useStore();
  const { t } = useLanguage();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isCartOpen) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => closeButtonRef.current?.focus(), 50);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
      triggerRef.current?.focus();
    }
  }, [isCartOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        e.preventDefault();
        closeCart();
      }

      // Trap focus inside drawer
      if (e.key === 'Tab' && isCartOpen && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const lines = cart
    .map((line) => {
      const book = books.find((b) => b.id === line.bookId);
      const format = book ? book.formats.find((f) => f.id === line.variantId) : undefined;
      if (!book || !format) return null;
      return {
        ...line,
        book,
        format,
        lineTotal: format.price * line.quantity,
      };
    })
    .filter((line): line is NonNullable<typeof line> => line !== null);

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const freeShippingThreshold = SHIPPING_CONFIG.freeShippingThresholdCents;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const diff = freeShippingThreshold - subtotal;

  const crossSells = books.filter((b) => !cart.some((c) => c.bookId === b.id)).slice(0, 2);

  return (
    <div
      className="cart-drawer-backdrop"
      onClick={closeCart}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping bag"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-drawer)',
        backgroundColor: 'rgba(20, 18, 15, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        ref={panelRef}
        className="cart-drawer-panel lifted-shadow"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '100%',
          backgroundColor: 'var(--paper)',
          borderLeft: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 600 }}>
              {t('cartTitle')}
            </span>
            <span
              style={{
                fontSize: '14px',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'var(--beige)',
                color: 'var(--muted)',
                fontWeight: 600,
              }}
            >
              {cartCount}
            </span>
          </div>
          <button
            ref={closeButtonRef}
            onClick={closeCart}
            style={{
              border: 0,
              background: 'transparent',
              minWidth: '44px',
              minHeight: '44px',
              cursor: 'pointer',
              color: 'var(--muted)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close cart drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div
          style={{
            padding: '12px 20px',
            background: 'rgba(126, 51, 70, 0.05)',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              marginBottom: '6px',
            }}
          >
            <span style={{ fontWeight: 500, color: 'var(--wine)' }}>
              {diff > 0
                ? `Add ${money(diff)} more for free delivery`
                : '✓ Complimentary delivery unlocked!'}
            </span>
            <span style={{ color: 'var(--muted)', fontSize: '14px' }}>{progressPercent}%</span>
          </div>
          <div
            style={{
              height: '6px',
              background: 'var(--line)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: 'var(--wine)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Undo Toast */}
        {lastRemovedItem && (
          <div
            style={{
              margin: '12px 20px 0',
              padding: '10px 14px',
              backgroundColor: '#fff8eb',
              border: '1px solid #fed7aa',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '14px',
              color: '#9a3412',
            }}
          >
            <span>Story removed from bag.</span>
            <button
              onClick={undoRemove}
              style={{
                border: 0,
                background: 'transparent',
                fontWeight: 600,
                color: 'var(--wine)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: '44px',
                gap: '6px',
                fontSize: '14px',
              }}
            >
              <RotateCcw size={14} /> Undo
            </button>
          </div>
        )}

        {/* Cart Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {lines.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 10px', color: 'var(--muted)' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--beige)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'var(--wine)',
                }}
              >
                <ShoppingBag size={26} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: '0 0 6px', color: 'var(--ink)' }}>
                {t('cartEmpty')}
              </h3>
              <p style={{ fontSize: '15px', margin: '0 0 24px', lineHeight: 1.5 }}>
                {t('cartEmptySub')}
              </p>
              <Link
                href="/books"
                onClick={closeCart}
                className="button button-dark"
                style={{ display: 'inline-flex', padding: '12px 24px', fontSize: '14px', minHeight: '44px' }}
              >
                {t('exploreBooks')}
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {lines.map((item) => (
                <div
                  key={item.variantId}
                  style={{
                    display: 'flex',
                    gap: '14px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid var(--line)',
                  }}
                >
                  <div
                    style={{
                      width: '45px',
                      height: '62px',
                      flexShrink: 0,
                      transform: 'scale(0.25)',
                      transformOrigin: 'top left',
                      marginRight: '-110px',
                      marginBottom: '-165px',
                      pointerEvents: 'none',
                    }}
                    aria-hidden="true"
                  >
                    <Cover book={item.book} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0, paddingLeft: '8px' }}>
                    <Link
                      href={`/books/${item.book.slug}`}
                      onClick={closeCart}
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '17px',
                        fontWeight: 600,
                        color: 'var(--ink)',
                        display: 'block',
                        lineHeight: 1.3,
                        minHeight: '28px',
                      }}
                    >
                      {item.book.title}
                    </Link>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '14px',
                        color: 'var(--muted)',
                        marginTop: '2px',
                      }}
                    >
                      {item.format.name}
                    </span>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '12px',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      {/* Quantity Stepper */}
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          border: '1px solid var(--line)',
                          borderRadius: '6px',
                          background: 'var(--white)',
                          height: '44px',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          style={{
                            border: 0,
                            background: 'transparent',
                            minWidth: '44px',
                            minHeight: '44px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          aria-label={`Decrease quantity of ${item.book.title}`}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: '15px', fontWeight: 600, minWidth: '24px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          style={{
                            border: 0,
                            background: 'transparent',
                            minWidth: '44px',
                            minHeight: '44px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          aria-label={`Increase quantity of ${item.book.title}`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)' }}>
                          {money(item.lineTotal)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.variantId)}
                          style={{
                            border: 0,
                            background: 'transparent',
                            color: 'var(--muted)',
                            minWidth: '44px',
                            minHeight: '44px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                          aria-label={`Remove ${item.book.title} from cart`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cross-Sell Recommendations */}
          {crossSells.length > 0 && lines.length > 0 && (
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed var(--line)' }}>
              <span
                style={{
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--muted)',
                  display: 'block',
                  marginBottom: '10px',
                }}
              >
                {t('readersAlsoLoved')}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {crossSells.map((cb) => {
                  const defaultFormat = cb.formats[0];
                  return (
                    <div
                      key={cb.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: 'rgba(0,0,0,0.02)',
                        borderRadius: '6px',
                        border: '1px solid var(--line)',
                        minHeight: '52px',
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1, paddingRight: '10px' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '15px',
                            fontWeight: 600,
                            display: 'block',
                            color: 'var(--ink)',
                          }}
                        >
                          {cb.title}
                        </span>
                        <span style={{ fontSize: '14px', color: 'var(--wine)' }}>
                          {money(defaultFormat.price)} · {defaultFormat.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => addToCart(cb.id, defaultFormat.id, false)}
                        style={{
                          border: '1px solid var(--wine)',
                          background: 'transparent',
                          color: 'var(--wine)',
                          fontSize: '14px',
                          fontWeight: 600,
                          padding: '8px 14px',
                          minHeight: '44px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        + Add
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer & Checkout */}
        {lines.length > 0 && (
          <div
            style={{
              padding: '18px 20px',
              paddingBottom: 'max(18px, env(safe-area-inset-bottom))',
              borderTop: '1px solid var(--line)',
              backgroundColor: 'var(--white)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '15px',
                marginBottom: '6px',
              }}
            >
              <span style={{ color: 'var(--muted)' }}>{t('subtotal')}</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600 }}>
                {money(subtotal)}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '14px',
                color: 'var(--muted)',
                marginBottom: '16px',
              }}
            >
              <span>{t('shipping')}</span>
              <span>{diff <= 0 ? t('freeShipping') : 'Calculated at checkout'}</span>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="button button-dark"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '13px',
                fontSize: '15px',
                minHeight: '48px',
                marginBottom: '8px',
              }}
            >
              <span>{t('checkout')}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>

            <Link
              href="/cart"
              onClick={closeCart}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: 'var(--muted)',
                textDecoration: 'underline',
                minHeight: '44px',
              }}
            >
              View full bag details
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
