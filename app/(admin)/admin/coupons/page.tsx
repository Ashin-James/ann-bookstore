'use client';

import React, { useState, useEffect } from 'react';
import { getAdminService } from '@/lib/admin/demo-admin-service';
import { CouponRecord } from '@/lib/admin/types';
import { DataTable, Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { money } from '@/src/config/site.config';
import { Plus, X } from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<CouponRecord['type']>('percent');
  const [value, setValue] = useState('10');
  const [minSpendDollars, setMinSpendDollars] = useState('25');

  const loadCoupons = async () => {
    const service = getAdminService();
    const res = await service.listCoupons();
    if (res.success) {
      setCoupons(res.data);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleToggle = async (c: CouponRecord) => {
    const service = getAdminService();
    await service.toggleCoupon(c.id, !c.active);
    loadCoupons();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const service = getAdminService();
    const parsedVal = type === 'percent' ? parseInt(value, 10) : Math.round(parseFloat(value) * 100);
    const parsedMinSpend = Math.round(parseFloat(minSpendDollars) * 100);

    const res = await service.createCoupon({
      code,
      type,
      value: parsedVal,
      minSpend: parsedMinSpend,
      actorEmail: 'demo@annsbookstore.com',
      ipHash: 'demo_localhost',
    });

    if (res.success) {
      setShowCreateModal(false);
      setCode('');
      loadCoupons();
    }
  };

  const columns: Column<CouponRecord>[] = [
    {
      key: 'code',
      header: 'Coupon Code',
      sortable: true,
      render: (row) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '15px', color: '#722638' }}>
          {row.code}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Discount Type',
      sortable: true,
      render: (row) => (
        <span style={{ textTransform: 'capitalize' }}>
          {row.type.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'value',
      header: 'Benefit',
      render: (row) => {
        if (row.type === 'percent') return `${row.value}% Off`;
        if (row.type === 'fixed') return `${money(row.value)} Off`;
        return 'Free Shipping';
      },
    },
    {
      key: 'minSpend',
      header: 'Min Spend',
      render: (row) => money(row.minSpend),
    },
    {
      key: 'usageCount',
      header: 'Redemptions',
      sortable: true,
      render: (row) => `${row.usageCount} orders`,
    },
    {
      key: 'active',
      header: 'Status',
      render: (row) => (
        <button
          onClick={() => handleToggle(row)}
          style={{
            border: 0,
            background: 'transparent',
            cursor: 'pointer',
            padding: 0,
            minHeight: '44px',
            display: 'inline-flex',
            alignItems: 'center',
          }}
          aria-label={`Toggle coupon status for ${row.code}`}
        >
          <StatusBadge status={row.active ? 'Active' : 'Disabled'} />
        </button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', margin: '0 0 6px', color: '#111827' }}>
            Promotions & Coupons
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
            Configure promotional discount codes, free shipping thresholds, and tracking usage.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            minHeight: '44px',
            padding: '10px 18px',
            backgroundColor: '#722638',
            color: '#FFFFFF',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            border: 0,
          }}
        >
          <Plus size={18} aria-hidden="true" />
          Create Coupon
        </button>
      </div>

      <DataTable
        data={coupons}
        columns={columns}
        keyExtractor={(row) => row.id}
        searchPlaceholder="Search coupon codes..."
        exportFilename="coupons-export"
      />

      {/* Create Modal */}
      {showCreateModal && (
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
              maxWidth: '440px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                New Promotion Code
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
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
                aria-label="Close modal"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Code
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. AUTUMN20"
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '8px 12px',
                    fontSize: '15px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Discount Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as CouponRecord['type'])}
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                  }}
                >
                  <option value="percent">Percentage Off (%)</option>
                  <option value="fixed">Fixed Amount Off ($ USD)</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>

              {type !== 'free_shipping' && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    {type === 'percent' ? 'Percentage Value (%)' : 'Discount Dollars ($)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Minimum Order Spend ($ USD)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={minSpendDollars}
                  onChange={(e) => setMinSpendDollars(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
