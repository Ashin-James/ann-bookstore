'use client';

import React, { useState, useEffect } from 'react';
import { getAdminService } from '@/lib/admin/demo-admin-service';
import { BookRecord, VariantRecord } from '@/lib/admin/types';
import { money } from '@/src/config/site.config';
import { Edit3, Percent, Check, X } from 'lucide-react';

export default function AdminBooksPage() {
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [editingVariant, setEditingVariant] = useState<VariantRecord | null>(null);
  const [editCostDollars, setEditCostDollars] = useState('');
  const [bulkPercent, setBulkPercent] = useState('30');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadBooks = async () => {
    const service = getAdminService();
    const res = await service.listBooks();
    if (res.success) {
      setBooks(res.data);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleSaveCost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariant) return;

    const parsedCents = Math.round(parseFloat(editCostDollars) * 100);
    if (isNaN(parsedCents) || parsedCents < 0) return;

    const service = getAdminService();
    const res = await service.updateVariantCost({
      variantId: editingVariant.id,
      costCents: parsedCents,
      actorEmail: 'demo@annsbookstore.com',
      ipHash: 'demo_localhost',
    });

    if (res.success) {
      setMessage(`Updated cost for ${editingVariant.sku} to ${money(parsedCents)}.`);
      setEditingVariant(null);
      loadBooks();
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleBulkSetCost = async (e: React.FormEvent) => {
    e.preventDefault();
    const pct = parseFloat(bulkPercent);
    if (isNaN(pct) || pct <= 0) return;

    const service = getAdminService();
    const res = await service.bulkSetVariantCosts({
      percentageOfPrice: pct,
      actorEmail: 'demo@annsbookstore.com',
      ipHash: 'demo_localhost',
    });

    if (res.success) {
      setMessage(`Successfully updated ${res.data.updatedCount} variant costs to ${pct}% of retail price.`);
      setShowBulkModal(false);
      loadBooks();
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', margin: '0 0 6px', color: '#111827' }}>
            Book Catalogue & Production Costs
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
            Manage editions, inventory levels, SKUs, and unit production cost economics.
          </p>
        </div>

        <button
          onClick={() => setShowBulkModal(true)}
          style={{
            minHeight: '44px',
            padding: '10px 18px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#374151',
          }}
        >
          <Percent size={18} aria-hidden="true" />
          Bulk Set Cost as % of Price
        </button>
      </div>

      {message && (
        <div
          role="status"
          style={{
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Check size={18} aria-hidden="true" />
          <span>{message}</span>
        </div>
      )}

      {/* Books & Variants List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {books.map((book) => (
          <div
            key={book.id}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', fontWeight: 700, margin: '0 0 4px', color: '#111827' }}>
                  {book.title}
                </h2>
                <span style={{ fontSize: '14px', color: '#6B7280' }}>
                  {book.category} · by {book.author}
                </span>
              </div>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  backgroundColor: '#ECFDF5',
                  color: '#065F46',
                }}
              >
                {book.status}
              </span>
            </div>

            {/* Variants Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                    <th style={{ padding: '10px 14px', fontSize: '14px', fontWeight: 600, color: '#4B5563' }}>Format</th>
                    <th style={{ padding: '10px 14px', fontSize: '14px', fontWeight: 600, color: '#4B5563' }}>SKU</th>
                    <th style={{ padding: '10px 14px', fontSize: '14px', fontWeight: 600, color: '#4B5563' }}>Price</th>
                    <th style={{ padding: '10px 14px', fontSize: '14px', fontWeight: 600, color: '#4B5563' }}>Unit Cost</th>
                    <th style={{ padding: '10px 14px', fontSize: '14px', fontWeight: 600, color: '#4B5563' }}>Margin</th>
                    <th style={{ padding: '10px 14px', fontSize: '14px', fontWeight: 600, color: '#4B5563' }}>Stock</th>
                    <th style={{ padding: '10px 14px', fontSize: '14px', fontWeight: 600, color: '#4B5563', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {book.variants.map((v) => {
                    const margin = v.price > 0 ? Math.round(((v.price - v.cost) / v.price) * 100) : 0;
                    return (
                      <tr key={v.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: 600 }}>{v.format}</td>
                        <td style={{ padding: '12px 14px', fontSize: '13px', color: '#6B7280', fontFamily: 'monospace' }}>{v.sku}</td>
                        <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: 600 }}>{money(v.price)}</td>
                        <td style={{ padding: '12px 14px', fontSize: '14px' }}>
                          <span style={{ fontWeight: 600, color: '#111827' }}>{money(v.cost)}</span>
                          {v.isDemoCost && (
                            <span
                              title="Demo estimate: replace with real costs"
                              style={{
                                marginLeft: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#86198f',
                                backgroundColor: '#fdf4ff',
                                border: '1px solid #f5d0fe',
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              Demo estimate
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: 600, color: margin >= 50 ? '#065F46' : '#92400E' }}>
                          {margin}%
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '14px' }}>
                          {v.format.toLowerCase().includes('ebook') ? 'Digital' : `${v.stock} units`}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              setEditingVariant(v);
                              setEditCostDollars((v.cost / 100).toFixed(2));
                            }}
                            style={{
                              border: 0,
                              background: 'transparent',
                              color: '#722638',
                              fontWeight: 600,
                              fontSize: '14px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              minHeight: '44px',
                            }}
                          >
                            <Edit3 size={14} aria-hidden="true" />
                            Edit Cost
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Cost Modal */}
      {editingVariant && (
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
              maxWidth: '420px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Set Cost: {editingVariant.sku}
              </h3>
              <button
                onClick={() => setEditingVariant(null)}
                style={{
                  border: 0,
                  background: 'transparent',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  minHeight: '44px',
                  minWidth: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Close cost modal"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSaveCost} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label htmlFor="variant-cost" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Unit Production Cost ($ USD)
                </label>
                <input
                  id="variant-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={editCostDollars}
                  onChange={(e) => setEditCostDollars(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '8px 12px',
                    fontSize: '16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                  }}
                />
                <span style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', display: 'block' }}>
                  Retail Price: {money(editingVariant.price)}. Saving a real cost will replace the demo estimate badge.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingVariant(null)}
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
                  type="submit"
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
                  Save Cost
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Percentage Cost Modal */}
      {showBulkModal && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Bulk Set Cost as % of Price
              </h3>
              <button
                onClick={() => setShowBulkModal(false)}
                style={{
                  border: 0,
                  background: 'transparent',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  minHeight: '44px',
                  minWidth: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Close bulk modal"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleBulkSetCost} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label htmlFor="bulk-percent-input" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Target Cost Percentage (% of Retail)
                </label>
                <input
                  id="bulk-percent-input"
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={bulkPercent}
                  onChange={(e) => setBulkPercent(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '8px 12px',
                    fontSize: '16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                  }}
                />
                <span style={{ fontSize: '13px', color: '#6B7280', marginTop: '6px', display: 'block' }}>
                  Preview: A $28.00 hardcover edition will have its unit cost updated to{' '}
                  <strong>{money(Math.round(2800 * (parseFloat(bulkPercent) || 30) / 100))}</strong>.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
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
                  type="submit"
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
                  Apply to All Variants
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
