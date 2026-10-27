'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getAdminService } from '@/lib/admin/demo-admin-service';
import { OrderRecord } from '@/lib/admin/types';
import { DataTable, Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { money } from '@/src/config/site.config';
import { X, Send, Truck } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [newStatus, setNewStatus] = useState<OrderRecord['status']>('Pending');
  const [noteText, setNoteText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadOrders = useCallback(async () => {
    const service = getAdminService();
    const res = await service.listOrders({
      status: statusFilter === 'all' ? undefined : statusFilter,
      limit: 500,
    });
    if (res.success) {
      setOrders(res.data.orders);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    const service = getAdminService();
    const res = await service.updateOrderStatus({
      orderId: selectedOrder.id,
      newStatus,
      actorEmail: 'demo@annsbookstore.com',
      ipHash: 'demo_localhost',
    });
    if (res.success) {
      setSelectedOrder(res.data);
      loadOrders();
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !noteText.trim()) return;
    const service = getAdminService();
    const res = await service.addOrderNote({
      orderId: selectedOrder.id,
      note: noteText,
      authorName: 'Ann',
    });
    if (res.success) {
      setSelectedOrder(res.data);
      setNoteText('');
      loadOrders();
    }
  };

  const columns: Column<OrderRecord>[] = [
    {
      key: 'orderNumber',
      header: 'Order #',
      sortable: true,
      render: (row) => (
        <button
          onClick={() => {
            setSelectedOrder(row);
            setNewStatus(row.status);
          }}
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
          {row.orderNumber}
        </button>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (row) => new Date(row.date).toLocaleDateString(),
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.customerName}</div>
          <div style={{ fontSize: '13px', color: '#6B7280' }}>{row.customerEmail}</div>
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
      key: 'items',
      header: 'Items',
      render: (row) => (
        <span style={{ fontSize: '13px', color: '#4B5563' }}>
          {row.items.reduce((sum, i) => sum + i.quantity, 0)} items ({row.items[0]?.title})
        </span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      sortable: true,
      render: (row) => (
        <span style={{ fontWeight: 700, color: '#111827' }}>
          {money(row.total)}
        </span>
      ),
      exportValue: (row) => `$${(row.total / 100).toFixed(2)}`,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', margin: '0 0 6px', color: '#111827' }}>
          Orders Fulfillment & Queue
        </h1>
        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
          Manage order dispatches, packing timelines, internal notes, and tracking across all 5,000 orders.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
        {['all', 'Pending', 'Paid', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            style={{
              minHeight: '44px',
              padding: '8px 16px',
              borderRadius: '9999px',
              border: 0,
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: statusFilter === st ? '#722638' : '#FFFFFF',
              color: statusFilter === st ? '#FFFFFF' : '#4B5563',
              boxShadow: statusFilter === st ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
              cursor: 'pointer',
            }}
          >
            {st === 'all' ? 'All Orders' : st}
          </button>
        ))}
      </div>

      {/* Orders DataTable */}
      <DataTable
        data={orders}
        columns={columns}
        keyExtractor={(row) => row.id}
        searchPlaceholder="Search order #, customer name, email..."
        exportFilename="orders-export"
      />

      {/* Order Detail Slide-Over Modal */}
      {selectedOrder && (
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
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
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
                  {selectedOrder.orderNumber}
                </h2>
                <span style={{ fontSize: '14px', color: '#6B7280' }}>
                  Placed on {new Date(selectedOrder.date).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
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

            {/* Workflow Status Box */}
            <div
              style={{
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Current Status:</span>
                <StatusBadge status={selectedOrder.status} />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderRecord['status'])}
                  style={{
                    flex: 1,
                    minHeight: '44px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                  }}
                  aria-label="Select order status"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Refunded">Refunded</option>
                </select>
                <button
                  onClick={handleUpdateStatus}
                  style={{
                    minHeight: '44px',
                    padding: '8px 16px',
                    backgroundColor: '#722638',
                    color: '#FFFFFF',
                    border: 0,
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Update
                </button>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 12px', color: '#111827' }}>
                Purchased Books
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: '#F9FAFB',
                      borderRadius: '6px',
                      border: '1px solid #F3F4F6',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.title}</div>
                      <div style={{ fontSize: '13px', color: '#6B7280' }}>
                        {item.format} · Qty: {item.quantity} · Cost:{' '}
                        {money(item.cost)}{' '}
                        {item.isDemoCost && (
                          <span style={{ fontSize: '11px', color: '#86198f' }}>[Demo estimate]</span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>
                      {money(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Delivery */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px', color: '#111827' }}>
                Shipping Address
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#4B5563', lineHeight: 1.5 }}>
                {selectedOrder.shippingAddress.fullName}
                <br />
                {selectedOrder.shippingAddress.street}
                {selectedOrder.shippingAddress.apartment && ` ${selectedOrder.shippingAddress.apartment}`}
                <br />
                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                {selectedOrder.shippingAddress.postalCode}
                <br />
                {selectedOrder.shippingAddress.country}
              </p>
              {selectedOrder.trackingNumber && (
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#065F46' }}>
                  <Truck size={18} aria-hidden="true" />
                  <span>
                    {selectedOrder.carrier}: <strong>{selectedOrder.trackingNumber}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Notes Timeline */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px', color: '#111827' }}>
                Internal Notes & Inscriptions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {(selectedOrder.notes || []).map((note, idx) => (
                  <div key={idx} style={{ padding: '8px 12px', backgroundColor: '#FEF3C7', borderRadius: '6px', fontSize: '13px', color: '#92400E' }}>
                    {note}
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add private fulfillment note..."
                  style={{
                    flex: 1,
                    minHeight: '44px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    minHeight: '44px',
                    padding: '8px 14px',
                    backgroundColor: '#1F2937',
                    color: '#FFFFFF',
                    border: 0,
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Send size={14} aria-hidden="true" />
                  Post
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
