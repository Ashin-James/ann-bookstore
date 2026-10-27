'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getAdminService } from '@/lib/admin/demo-admin-service';
import { AuditLogEntry } from '@/lib/admin/types';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Download } from 'lucide-react';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [actorFilter, setActorFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const loadLogs = useCallback(async () => {
    const service = getAdminService();
    const res = await service.listAuditLogs({
      actorEmail: actorFilter || undefined,
      entity: entityFilter || undefined,
      limit: 200,
    });
    if (res.success) {
      setLogs(res.data);
    }
  }, [actorFilter, entityFilter]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleExport = async () => {
    const service = getAdminService();
    const res = await service.exportAuditCsv();
    if (res.success) {
      const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + res.data);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `audit-log-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const columns: Column<AuditLogEntry>[] = [
    {
      key: 'createdAt',
      header: 'Timestamp',
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: '13px', color: '#6B7280' }}>
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actorEmail',
      header: 'Actor',
      sortable: true,
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#111827' }}>
          {row.actorEmail}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      sortable: true,
      render: (row) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '13px',
            backgroundColor: '#F3F4F6',
            padding: '2px 8px',
            borderRadius: '4px',
            color: '#722638',
            fontWeight: 700,
          }}
        >
          {row.action}
        </span>
      ),
    },
    {
      key: 'entity',
      header: 'Entity & Target ID',
      render: (row) => (
        <span style={{ fontSize: '13px', color: '#374151' }}>
          {row.entity} {row.entityId ? `(#${row.entityId})` : ''}
        </span>
      ),
    },
    {
      key: 'ipHash',
      header: 'Salted IP Hash',
      render: (row) => (
        <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#9CA3AF' }}>
          {row.ipHash}
        </span>
      ),
    },
    {
      key: 'diff',
      header: 'State Summary',
      render: (row) => {
        if (!row.beforeState && !row.afterState) return <span style={{ color: '#9CA3AF' }}>—</span>;
        return (
          <div style={{ maxWidth: '280px', fontSize: '12px', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {row.afterState ? JSON.stringify(row.afterState) : JSON.stringify(row.beforeState)}
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', margin: '0 0 6px', color: '#111827' }}>
            System Audit Log
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
            Immutable trace of administrative mutations, auth events, role changes, and pricing updates.
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
          Export Audit CSV
        </button>
      </div>

      {/* Entity Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
          placeholder="Filter by actor email..."
          style={{
            minHeight: '44px',
            padding: '8px 12px',
            fontSize: '14px',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            width: '240px',
          }}
        />
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          style={{
            minHeight: '44px',
            padding: '8px 12px',
            fontSize: '14px',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
          }}
        >
          <option value="">All Entities</option>
          <option value="order">Order</option>
          <option value="variant">Variant / Cost</option>
          <option value="coupon">Coupon</option>
          <option value="review">Review</option>
          <option value="staff">Staff</option>
          <option value="session">Session / Auth</option>
        </select>
      </div>

      <DataTable
        data={logs}
        columns={columns}
        keyExtractor={(row) => row.id}
        searchPlaceholder="Search audit events..."
        exportFilename="audit-log-export"
      />
    </div>
  );
}
