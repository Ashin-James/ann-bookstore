'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminService } from '@/lib/admin/demo-admin-service';
import { DashboardKPIs } from '@/lib/admin/types';
import { StatCard } from '@/components/admin/StatCard';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { money } from '@/src/config/site.config';
import { AlertTriangle, ArrowRight, ShoppingBag } from 'lucide-react';

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const service = getAdminService();
      const res = await service.getDashboardKPIs();
      if (res.success) {
        setKpis(res.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !kpis) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-serif)', margin: 0, color: '#111827' }}>
          Overview & Sales Pulse
        </h1>
        <p style={{ color: '#6B7280', fontSize: '14px' }}>Loading business metrics...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Title & Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', margin: '0 0 6px', color: '#111827' }}>
            Store Pulse & Metrics
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
            Real-time commerce overview across 5,000 orders and 600 readers.
          </p>
        </div>

        <Link
          href="/admin/orders"
          style={{
            minHeight: '44px',
            padding: '10px 18px',
            backgroundColor: '#722638',
            color: '#FFFFFF',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShoppingBag size={18} aria-hidden="true" />
          View All Orders
        </Link>
      </div>

      {/* KPI Cards Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
        }}
      >
        <StatCard
          label="Customers"
          value={kpis.customersCount.toLocaleString()}
          subtext="600 readers enrolled"
        />
        <StatCard
          label="Gross Sales"
          value={money(kpis.grossSalesCents)}
          subtext="Past 24 months total"
        />
        <StatCard
          label="COGS (Cost)"
          value={money(kpis.totalCostCents)}
          isDemoEstimate={kpis.hasDemoCostEstimates}
          subtext="Production & royalty costs"
        />
        <StatCard
          label="Gross Margin"
          value={`${kpis.grossMarginPercent}%`}
          isDemoEstimate={kpis.hasDemoCostEstimates}
          subtext="Revenue after COGS"
        />
        <StatCard
          label="Orders"
          value={kpis.ordersCount.toLocaleString()}
          subtext="Completed & active"
        />
        <StatCard
          label="Average Order"
          value={money(kpis.aovCents)}
          subtext="Per completed order"
        />
      </div>

      {/* Low Stock Alert if any */}
      {kpis.lowStockVariants.length > 0 && (
        <div
          style={{
            backgroundColor: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '8px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={20} color="#D97706" aria-hidden="true" />
            <div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#92400E' }}>
                Low Inventory Warning ({kpis.lowStockVariants.length} items)
              </span>
              <p style={{ margin: 0, fontSize: '14px', color: '#B45309' }}>
                Some physical editions are below their threshold. Check inventory before next restock.
              </p>
            </div>
          </div>
          <Link
            href="/admin/books"
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: '#92400E',
              textDecoration: 'none',
              minHeight: '44px',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Review Stock →
          </Link>
        </div>
      )}

      {/* Recent Orders Section */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#111827' }}>
              Recent Orders
            </h2>
            <span style={{ fontSize: '14px', color: '#6B7280' }}>
              Latest dispatches and reader purchases
            </span>
          </div>

          <Link
            href="/admin/orders"
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#722638',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              minHeight: '44px',
            }}
          >
            View all 5,000 orders
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                <th style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#4B5563' }}>Order #</th>
                <th style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#4B5563' }}>Date</th>
                <th style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#4B5563' }}>Customer</th>
                <th style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#4B5563' }}>Status</th>
                <th style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#4B5563' }}>Items</th>
                <th style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#4B5563', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {kpis.recentOrders.map((ord) => (
                <tr key={ord.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: '#722638' }}>
                    {ord.orderNumber}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#6B7280' }}>
                    {new Date(ord.date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#111827' }}>
                    {ord.customerName}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px' }}>
                    <StatusBadge status={ord.status} />
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4B5563' }}>
                    {ord.items.map((i) => `${i.title} (${i.format})`).join(', ')}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, textAlign: 'right', color: '#111827' }}>
                    {money(ord.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
