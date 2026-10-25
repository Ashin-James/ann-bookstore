'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { accountService } from '@/lib/account/service';
import { UserReview, Order } from '@/lib/account/types';
import AccountLayout from '@/components/account/account-layout';
import { useToast } from '@/components/account/account-toast';
import {
  Star,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
} from 'lucide-react';

function ReviewsContent() {
  const searchParams = useSearchParams();
  const prefillBookId = searchParams.get('bookId');

  const { user } = useAuth();
  const { formatDate } = useLanguage();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'my-reviews' | 'writeable'>('my-reviews');
  const [loading, setLoading] = useState(true);

  // Review Modal (Add or Edit)
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<UserReview | null>(null);
  const [targetBook, setTargetBook] = useState<{ bookId: string; bookSlug: string; bookTitle: string; orderId: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      accountService.getReviews(user.id),
      accountService.getOrders(user.id),
    ]).then(([revs, ords]) => {
      setReviews(revs);
      setOrders(ords);
      setLoading(false);

      // If URL came with prefill bookId from Order detail "Write a Review"
      if (prefillBookId) {
        for (const o of ords) {
          const item = o.items.find((i) => i.bookId === prefillBookId);
          if (item) {
            setTargetBook({
              bookId: item.bookId,
              bookSlug: item.bookSlug || item.bookId,
              bookTitle: item.title,
              orderId: o.id,
            });
            setRating(5);
            setHeadline('');
            setBody('');
            setReviewModalOpen(true);
            break;
          }
        }
      }
    });
  }, [user, prefillBookId]);

  // Delivered items eligible for review
  const unreviewedDeliveredItems = orders
    .filter((o) => o.status === 'Delivered')
    .flatMap((o) =>
      o.items.map((item) => ({
        bookId: item.bookId,
        bookSlug: item.bookSlug || item.bookId,
        bookTitle: item.title,
        orderId: o.id,
        orderNumber: o.orderNumber,
        format: item.format,
        cover: item.cover,
      }))
    )
    .filter((item) => !reviews.some((r) => r.bookId === item.bookId));

  const openWriteModal = (item: { bookId: string; bookSlug: string; bookTitle: string; orderId: string }) => {
    setEditingReview(null);
    setTargetBook(item);
    setRating(5);
    setHeadline('');
    setBody('');
    setReviewModalOpen(true);
  };

  const openEditModal = (rev: UserReview) => {
    setEditingReview(rev);
    setTargetBook({
      bookId: rev.bookId,
      bookSlug: rev.bookSlug,
      bookTitle: rev.bookTitle,
      orderId: rev.orderId,
    });
    setRating(rev.rating);
    setHeadline(rev.headline);
    setBody(rev.body);
    setReviewModalOpen(true);
  };

  const handleDeleteReview = async (rev: UserReview) => {
    if (!user) return;
    try {
      await accountService.deleteReview(user.id, rev.id);
      setReviews((prev) => prev.filter((r) => r.id !== rev.id));
      showToast(`Review for "${rev.bookTitle}" deleted`, { type: 'info' });
    } catch {
      showToast('Failed to delete review', { type: 'error' });
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !targetBook) return;
    if (!headline.trim() || !body.trim()) {
      showToast('Please provide both a headline and a review body', { type: 'error' });
      return;
    }

    setSubmitting(true);
    // Basic string sanitisation: strip HTML tags
    const cleanHeadline = headline.replace(/<[^>]*>?/gm, '').trim();
    const cleanBody = body.replace(/<[^>]*>?/gm, '').trim();

    try {
      if (editingReview) {
        const updated = await accountService.updateReview(user.id, editingReview.id, {
          rating,
          headline: cleanHeadline,
          body: cleanBody,
        });
        setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        showToast('Review updated successfully', { type: 'success' });
      } else {
        const created = await accountService.createReview(user.id, {
          bookId: targetBook.bookId,
          bookSlug: targetBook.bookSlug,
          bookTitle: targetBook.bookTitle,
          orderId: targetBook.orderId,
          rating,
          headline: cleanHeadline,
          body: cleanBody,
        });
        setReviews((prev) => [created, ...prev]);
        showToast('Thank you! Your reader review has been published', { type: 'success' });
        setActiveTab('my-reviews');
      }
      setReviewModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit review';
      showToast(msg, { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AccountLayout
      breadcrumbs={[{ label: 'Your Reviews' }]}
      title="Your Reviews"
      description="Share reflections and literary marginalia on books you have read."
    >
      {/* Navigation tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', paddingBottom: '12px', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('my-reviews')}
          style={{
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '14px',
            fontWeight: activeTab === 'my-reviews' ? 700 : 500,
            background: activeTab === 'my-reviews' ? 'var(--ink)' : 'var(--white)',
            color: activeTab === 'my-reviews' ? 'var(--paper)' : 'var(--ink)',
            border: '1px solid var(--line)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            minHeight: '40px',
          }}
        >
          <span>My Reviews</span>
          <span style={{ fontSize: '12px', opacity: 0.8 }}>({reviews.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('writeable')}
          style={{
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '14px',
            fontWeight: activeTab === 'writeable' ? 700 : 500,
            background: activeTab === 'writeable' ? 'var(--ink)' : 'var(--white)',
            color: activeTab === 'writeable' ? 'var(--paper)' : 'var(--ink)',
            border: '1px solid var(--line)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            minHeight: '40px',
          }}
        >
          <span>Reviews I Can Write</span>
          <span style={{ fontSize: '12px', opacity: 0.8 }}>({unreviewedDeliveredItems.length})</span>
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)' }}>
          Loading reviews...
        </div>
      ) : activeTab === 'my-reviews' ? (
        reviews.length === 0 ? (
          <div
            style={{
              background: 'var(--white)',
              border: '1px solid var(--line)',
              borderRadius: '8px',
              padding: '48px 24px',
              textAlign: 'center',
            }}
          >
            <Star size={40} color="var(--taupe)" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: '0 0 8px' }}>
              No Reviews Written Yet
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '0 0 20px' }}>
              You haven&apos;t written any reviews yet. Review delivered books to share notes with other readers.
            </p>
            {unreviewedDeliveredItems.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('writeable')}
                style={{
                  padding: '10px 20px',
                  background: 'var(--wine)',
                  color: 'var(--white)',
                  border: 0,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Review a Delivered Book
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reviews.map((rev) => (
              <div
                key={rev.id}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  padding: '24px',
                }}
              >
                {/* Header with Title and Sample Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <Link
                        href={`/books/${rev.bookSlug}`}
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '20px',
                          fontWeight: 700,
                          color: 'var(--ink)',
                          textDecoration: 'none',
                        }}
                      >
                        {rev.bookTitle}
                      </Link>
                      {rev.isSample && (
                        <span
                          style={{
                            background: 'var(--paper-warm)',
                            border: '1px solid var(--beige)',
                            color: 'var(--muted)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                        >
                          Sample Review
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>
                      Reviewed on {formatDate(rev.createdAt)}
                    </span>
                  </div>

                  {/* Rating Stars */}
                  <div style={{ display: 'flex', gap: '2px' }} aria-label={`Rating: ${rev.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={18}
                        fill={star <= rev.rating ? 'var(--gold-foil)' : 'none'}
                        color={star <= rev.rating ? 'var(--gold-foil)' : 'var(--taupe)'}
                      />
                    ))}
                  </div>
                </div>

                {/* Headline & Body */}
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px', color: 'var(--ink)' }}>
                  {rev.headline}
                </h3>
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--ink-secondary)', margin: '0 0 16px' }}>
                  {rev.body}
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => openEditModal(rev)}
                    style={{
                      background: 'transparent',
                      border: 0,
                      padding: 0,
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--wine)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      minHeight: '32px',
                    }}
                  >
                    <Edit2 size={13} />
                    <span>Edit Review</span>
                  </button>
                  <span style={{ color: 'var(--line)' }}>|</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteReview(rev)}
                    style={{
                      background: 'transparent',
                      border: 0,
                      padding: 0,
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--terracotta)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      minHeight: '32px',
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Writeable Items Tab */
        unreviewedDeliveredItems.length === 0 ? (
          <div
            style={{
              background: 'var(--white)',
              border: '1px solid var(--line)',
              borderRadius: '8px',
              padding: '48px 24px',
              textAlign: 'center',
            }}
          >
            <CheckCircle2 size={40} color="var(--wine)" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: '0 0 8px' }}>
              You Are All Caught Up!
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>
              All items from your delivered orders have been reviewed.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {unreviewedDeliveredItems.map((item) => (
              <div
                key={`${item.orderId}-${item.bookId}`}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: '0 0 4px', color: 'var(--ink)' }}>
                    {item.bookTitle}
                  </h3>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    Format: {item.format} · From Order #{item.orderNumber}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => openWriteModal(item)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    background: 'var(--wine)',
                    color: 'var(--white)',
                    border: 0,
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    minHeight: '40px',
                  }}
                >
                  <Star size={14} />
                  <span>Write a Review</span>
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Write / Edit Review Modal */}
      {reviewModalOpen && targetBook && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-dialog-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 18, 17, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <form
            onSubmit={handleSubmitReview}
            style={{
              background: 'var(--white)',
              borderRadius: '8px',
              maxWidth: '540px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-monumental)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 id="review-dialog-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0, color: 'var(--ink)' }}>
                  {editingReview ? 'Edit Your Review' : 'Write a Reader Review'}
                </h3>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{targetBook.bookTitle}</span>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: '4px', minHeight: '36px' }}
                aria-label="Close dialog"
              >
                <X size={20} color="var(--muted)" />
              </button>
            </div>

            {/* Rating Star Selector */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Overall Rating *
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{
                      background: 'transparent',
                      border: 0,
                      cursor: 'pointer',
                      padding: '4px',
                      minHeight: '36px',
                    }}
                    aria-label={`${star} star`}
                  >
                    <Star
                      size={28}
                      fill={star <= rating ? 'var(--gold-foil)' : 'none'}
                      color={star <= rating ? 'var(--gold-foil)' : 'var(--taupe)'}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Headline */}
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="review-headline-input" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Headline / One-Line Summary *
              </label>
              <input
                id="review-headline-input"
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="What most stood out to you?"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--line)',
                  background: 'var(--paper)',
                  color: 'var(--ink)',
                  fontSize: '15px',
                }}
              />
            </div>

            {/* Body */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="review-body-input" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Review Text *
              </label>
              <textarea
                id="review-body-input"
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share your thoughts on prose style, pacing, and emotional resonance..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--line)',
                  background: 'var(--paper)',
                  color: 'var(--ink)',
                  fontSize: '14px',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                disabled={submitting}
                style={{
                  padding: '10px 18px',
                  background: 'transparent',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '42px',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !headline.trim() || !body.trim()}
                style={{
                  padding: '10px 22px',
                  background: 'var(--wine)',
                  color: 'var(--white)',
                  border: 0,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  minHeight: '42px',
                }}
              >
                {submitting ? 'Saving...' : editingReview ? 'Save Changes' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AccountLayout>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense
      fallback={
        <AccountLayout breadcrumbs={[{ label: 'Your Reviews' }]} title="Your Reviews">
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)' }}>
            Loading reviews...
          </div>
        </AccountLayout>
      }
    >
      <ReviewsContent />
    </Suspense>
  );
}
