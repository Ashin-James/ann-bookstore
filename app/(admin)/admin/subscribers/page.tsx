'use client';

import React, { useState, useEffect } from 'react';
import { getAdminService } from '@/lib/admin/demo-admin-service';
import { SubscriberRecord } from '@/lib/admin/types';
import { DataTable, Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Download } from 'lucide-react';

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<SubscriberRecord[]>([]);

  const loadSubscribers = async () => {
    const service = getAdminService();
    const res = await service.listSubscribers();
    if (res.success) {
      setSubscribers(res.data);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const handleExport = async () => {
    const service = getAdminService();
    const res = await service.exportSubscribersCsv('demo@annsbookstore.com', 'demo_localhost');
    if (res.success) {
      const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + res.data);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `subscribers-export-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const columns: Column<SubscriberRecord>[] = [
    {
      key: 'email',
      header: 'Subscriber Email',
      sortable: true,
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#111827' }}>
          {row.email}
        </span>
      ),
    },
    {
      key: 'source',
      header: 'Acquisition Source',
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: '13px', color: '#6B7280', textTransform: 'capitalize' }}>
          {row.source.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'subscribedAt',
      header: 'Subscribed Date',
      sortable: true,
      render: (row) => new Date(row.subscribedAt).toLocaleDateString(),
    },
    {
      key: 'status',
      header: 'Subscription State',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', margin: '0 0 6px', color: '#111827' }}>
            Newsletter Subscribers
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
            Curated list of opted-in literary journal subscribers. Export is audit-logged.
          </p>
        </div>

        <button
          onClick={handleExport}
          style={{
            minHeight: '44px',
            padding: '10px 18px',
            backgroundColor: '#722638',
            color: '#FFFFFF',
            border: 0,
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Download size={18} aria-hidden="true" />
          Export Subscribers CSV
        </button>
      </div>

      <DataTable
        data={subscribers}
        columns={columns}
        keyExtractor={(row) => row.id}
        searchPlaceholder="Search subscriber emails..."
        exportFilename="subscribers-export"
      />
    </div>
  );
}
