'use client';

import React, { useState, useEffect } from 'react';
import { getAdminService } from '@/lib/admin/demo-admin-service';
import { ReviewRecord } from '@/lib/admin/types';
import { DataTable, Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Check, X, Star, MessageSquare } from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [selectedReview, setSelectedReview] = useState<ReviewRecord | null>(null);
  const [replyText, setReplyText] = useState('');

  const loadReviews = async () => {
    const service = getAdminService();
    const res = await service.listReviews();
    if (res.success) {
      setReviews(res.data);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleModerate = async (reviewId: string, status: 'approved' | 'rejected', reply?: string) => {
    const service = getAdminService();
    await service.moderateReview({
      reviewId,
      status,
      reply,
      actorEmail: 'demo@annsbookstore.com',
      ipHash: 'demo_localhost',
    });
    setSelectedReview(null);
    setReplyText('');
    loadReviews();
  };

  const columns: Column<ReviewRecord>[] = [
    {
      key: 'bookTitle',
      header: 'Book',
      sortable: true,
      render: (row) => <span style={{ fontWeight: 600 }}>{row.bookTitle}</span>,
    },
    {
      key: 'customerName',
      header: 'Reviewer',
      sortable: true,
      render: (row) => (
        <div>
          <div>{row.customerName}</div>
          <div style={{ fontSize: '13px', color: '#6B7280' }}>{row.customerEmail}</div>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#D97706' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={16}
              fill={i < row.rating ? '#D97706' : 'none'}
              stroke="#D97706"
              aria-hidden="true"
            />
          ))}
        </div>
      ),
    },
    {
      key: 'comment',
      header: 'Review Content',
      render: (row) => (
        <div style={{ maxWidth: '320px', fontSize: '13px', color: '#374151', lineHeight: 1.4 }}>
          {row.comment}
          {row.reply && (
            <div style={{ marginTop: '4px', fontStyle: 'italic', color: '#722638' }}>
              Ann’s Reply: “{row.reply}”
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {row.status !== 'approved' && (
            <button
              onClick={() => handleModerate(row.id, 'approved')}
              style={{
                minHeight: '44px',
                padding: '6px 12px',
                border: '1px solid #A7F3D0',
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Approve review"
            >
              <Check size={14} aria-hidden="true" />
              Approve
            </button>
          )}
          {row.status !== 'rejected' && (
            <button
              onClick={() => handleModerate(row.id, 'rejected')}
              style={{
                minHeight: '44px',
                padding: '6px 12px',
                border: '1px solid #FECACA',
                backgroundColor: '#FEF2F2',
                color: '#991B1B',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Reject review"
            >
              <X size={14} aria-hidden="true" />
              Reject
            </button>
          )}
          <button
            onClick={() => {
              setSelectedReview(row);
              setReplyText(row.reply || '');
            }}
            style={{
              minHeight: '44px',
              padding: '6px 12px',
              border: '1px solid #D1D5DB',
              backgroundColor: '#FFFFFF',
              color: '#374151',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <MessageSquare size={14} aria-hidden="true" />
            Reply
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', margin: '0 0 6px', color: '#111827' }}>
          Reader Reviews Moderation
        </h1>
        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
          Moderate submitted reader reflections, approve public testimonials, and post personal author replies.
        </p>
      </div>

      <DataTable
        data={reviews}
        columns={columns}
        keyExtractor={(row) => row.id}
        searchPlaceholder="Search reviews by book, reviewer, words..."
        exportFilename="reviews-export"
      />

      {/* Reply Modal */}
      {selectedReview && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              padding: '28px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 12px' }}>
              Reply as Ann to {selectedReview.customerName}
            </h3>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 14px', fontStyle: 'italic' }}>
              “{selectedReview.comment}”
            </p>
            <textarea
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a personal note of gratitude..."
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                marginBottom: '16px',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setSelectedReview(null)}
                style={{
                  minHeight: '44px',
                  padding: '8px 16px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleModerate(selectedReview.id, 'approved', replyText)}
                style={{
                  minHeight: '44px',
                  padding: '8px 18px',
                  backgroundColor: '#722638',
                  color: '#FFFFFF',
                  border: 0,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Save & Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
