'use client';

import React, { useState, useEffect } from 'react';
import { getAdminService } from '@/lib/admin/demo-admin-service';
import { CustomerRecord } from '@/lib/admin/types';
import { DataTable, Column } from '@/components/admin/DataTable';
import { money } from '@/src/config/site.config';
import { Mail, Phone, Calendar, X } from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [selectedCust, setSelectedCust] = useState<CustomerRecord | null>(null);

  const loadCustomers = async () => {
    const service = getAdminService();
    const res = await service.listCustomers({ limit: 600 });
    if (res.success) {
      setCustomers(res.data);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const columns: Column<CustomerRecord>[] = [
    {
      key: 'name',
      header: 'Reader Name',
      sortable: true,
      render: (row) => (
        <button
          onClick={() => setSelectedCust(row)}
          style={{
            border: 0,
            background: 'transparent',
            padding: 0,
            color: '#722638',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '14px',
            textDecoration: 'underline',
            minHeight: '44px',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          {row.name}
        </button>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (row) => <span style={{ color: '#4B5563' }}>{row.email}</span>,
    },
    {
      key: 'totalOrders',
      header: 'Orders',
      sortable: true,
      render: (row) => `${row.totalOrders} orders`,
    },
    {
      key: 'totalSpent',
      header: 'Lifetime Value (LTV)',
      sortable: true,
      render: (row) => (
        <span style={{ fontWeight: 700, color: '#111827' }}>
          {money(row.totalSpent)}
        </span>
      ),
      exportValue: (row) => `$${(row.totalSpent / 100).toFixed(2)}`,
    },
    {
      key: 'tags',
      header: 'Tags',
      render: (row) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {row.tags.map((t, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: '#F3F4F6',
                color: '#374151',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', margin: '0 0 6px', color: '#111827' }}>
          Readers & Customers Hub
        </h1>
        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
          Manage reader profiles, lifetime purchasing value, notes, and preferences across 600 customer accounts.
        </p>
      </div>

      <DataTable
        data={customers}
        columns={columns}
        keyExtractor={(row) => row.id}
        searchPlaceholder="Search readers by name or email..."
        exportFilename="customers-export"
      />

      {/* Detail Slide-over */}
      {selectedCust && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setSelectedCust(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: '#FFFFFF',
              height: '100%',
              overflowY: 'auto',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', margin: 0, color: '#111827' }}>
                  {selectedCust.name}
                </h2>
                <span style={{ fontSize: '14px', color: '#6B7280' }}>
                  Enrolled reader #{selectedCust.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedCust(null)}
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
                aria-label="Close details"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#4B5563' }}>
                <Mail size={18} aria-hidden="true" />
                <span>{selectedCust.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#4B5563' }}>
                <Phone size={18} aria-hidden="true" />
                <span>{selectedCust.phone || 'No phone recorded'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#4B5563' }}>
                <Calendar size={18} aria-hidden="true" />
                <span>Customer since {new Date(selectedCust.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#F9FAFB',
                borderRadius: '8px',
                padding: '20px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                border: '1px solid #E5E7EB',
              }}
            >
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                  Total Orders
                </span>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>
                  {selectedCust.totalOrders}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                  Lifetime Value
                </span>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#065F46' }}>
                  {money(selectedCust.totalSpent)}
                </div>
              </div>
            </div>

            {selectedCust.notes && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px', color: '#111827' }}>
                  Curator & Atelier Notes
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#4B5563', lineHeight: 1.5, backgroundColor: '#FFFBEB', padding: '12px', borderRadius: '6px', border: '1px solid #FDE68A' }}>
                  {selectedCust.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
