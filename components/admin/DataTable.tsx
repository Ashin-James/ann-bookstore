'use client';

import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, Download, Search, CheckSquare, Square } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  exportValue?: (row: T) => string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  searchPlaceholder?: string;
  searchKeys?: (keyof T | string)[];
  exportFilename?: string;
  onBulkAction?: (action: string, selectedIds: string[]) => void;
  bulkActions?: { id: string; label: string }[];
}

export function DataTable<T extends object>({
  data,
  columns,
  keyExtractor,
  searchPlaceholder = 'Search records...',
  searchKeys,
  exportFilename = 'export',
  onBulkAction,
  bulkActions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Filtered Data
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) => {
      const rec = row as Record<string, unknown>;
      if (searchKeys) {
        return searchKeys.some((k) => String(rec[String(k)] ?? '').toLowerCase().includes(q));
      }
      return Object.values(rec).some((val) => String(val ?? '').toLowerCase().includes(q));
    });
  }, [data, search, searchKeys]);

  // Sorted Data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const recA = a as Record<string, unknown>;
      const recB = b as Record<string, unknown>;
      const valA = recA[sortKey];
      const valB = recB[sortKey];
      if (valA === valB) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, sortKey, sortOrder]);

  // Paginated Data
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Sorting Handler
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Bulk Selection
  const toggleSelectAll = () => {
    if (selectedIds.size === pagedData.length && pagedData.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pagedData.map(keyExtractor)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = columns.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(',');
    const rows = sortedData.map((row) =>
      columns
        .map((col) => {
          const rec = row as Record<string, unknown>;
          const val = col.exportValue ? col.exportValue(row) : String(rec[col.key] ?? '');
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exportFilename}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Table Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              maxWidth: '360px',
            }}
          >
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', color: '#9CA3AF' }}
              aria-hidden="true"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '8px 12px 8px 38px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                color: '#111827',
              }}
              aria-label="Search records"
            />
          </div>

          {selectedIds.size > 0 && bulkActions && onBulkAction && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                {selectedIds.size} selected
              </span>
              {bulkActions.map((act) => (
                <button
                  key={act.id}
                  onClick={() => onBulkAction(act.id, Array.from(selectedIds))}
                  style={{
                    minHeight: '44px',
                    padding: '8px 14px',
                    fontSize: '14px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    backgroundColor: '#F3F4F6',
                    border: '1px solid #D1D5DB',
                    cursor: 'pointer',
                  }}
                >
                  {act.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleExportCsv}
          style={{
            minHeight: '44px',
            padding: '8px 16px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 600,
            borderRadius: '6px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #D1D5DB',
            color: '#374151',
            cursor: 'pointer',
          }}
          aria-label="Export table data to CSV"
        >
          <Download size={18} aria-hidden="true" />
          Export CSV
        </button>
      </div>

      {/* Table Container */}
      <div
        style={{
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          overflowX: 'auto',
          backgroundColor: '#FFFFFF',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {bulkActions && (
                <th style={{ padding: '12px 16px', width: '44px' }}>
                  <button
                    onClick={toggleSelectAll}
                    style={{
                      border: 0,
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '44px',
                      minWidth: '44px',
                    }}
                    aria-label="Select all rows"
                  >
                    {selectedIds.size === pagedData.length && pagedData.length > 0 ? (
                      <CheckSquare size={20} color="#722638" />
                    ) : (
                      <Square size={20} color="#9CA3AF" />
                    )}
                  </button>
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#4B5563',
                    letterSpacing: '0.02em',
                  }}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      style={{
                        border: 0,
                        background: 'transparent',
                        padding: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: sortKey === col.key ? '#722638' : '#4B5563',
                        minHeight: '44px',
                      }}
                    >
                      {col.header}
                      <ArrowUpDown size={14} aria-hidden="true" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (bulkActions ? 1 : 0)}
                  style={{ padding: '36px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}
                >
                  No records match your criteria.
                </td>
              </tr>
            ) : (
              pagedData.map((row) => {
                const id = keyExtractor(row);
                const isSelected = selectedIds.has(id);
                return (
                  <tr
                    key={id}
                    style={{
                      borderBottom: '1px solid #F3F4F6',
                      backgroundColor: isSelected ? '#FFF8F9' : 'transparent',
                    }}
                  >
                    {bulkActions && (
                      <td style={{ padding: '12px 16px', width: '44px' }}>
                        <button
                          onClick={() => toggleSelectRow(id)}
                          style={{
                            border: 0,
                            background: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '44px',
                            minWidth: '44px',
                          }}
                          aria-label={`Select row ${id}`}
                        >
                          {isSelected ? (
                            <CheckSquare size={20} color="#722638" />
                          ) : (
                            <Square size={20} color="#9CA3AF" />
                          )}
                        </button>
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        style={{ padding: '14px 16px', fontSize: '14px', color: '#1F2937' }}
                      >
                        {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '4px 0',
        }}
      >
        <span style={{ fontSize: '14px', color: '#6B7280' }}>
          Showing {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)} to{' '}
          {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} records
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            style={{
              minHeight: '44px',
              minWidth: '44px',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              backgroundColor: '#FFFFFF',
              color: currentPage <= 1 ? '#9CA3AF' : '#374151',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              fontSize: '14px',
              fontWeight: 600,
            }}
            aria-label="Previous page"
          >
            <ChevronLeft size={18} aria-hidden="true" />
            Previous
          </button>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151', padding: '0 8px' }}>
            {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            style={{
              minHeight: '44px',
              minWidth: '44px',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              backgroundColor: '#FFFFFF',
              color: currentPage >= totalPages ? '#9CA3AF' : '#374151',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              fontSize: '14px',
              fontWeight: 600,
            }}
            aria-label="Next page"
          >
            Next
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
