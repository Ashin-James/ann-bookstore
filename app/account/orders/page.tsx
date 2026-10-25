'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { useStore } from '@/contexts/store-context';
import { accountService } from '@/lib/account/service';
import { Order, OrderStatus } from '@/lib/account/types';
import AccountLayout from '@/components/account/account-layout';
import { useToast } from '@/components/account/account-toast';
import {
  Search,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
  Ban,
  Package,
  AlertCircle,
} from 'lucide-react';

export default function OrdersPage() {
  const { user } = useAuth();
  const { formatCurrency, formatDate } = useLanguage();
  const { addToCart } = useStore();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'30days' | '6months' | 'year' | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) return;
    accountService.getOrders(user.id).then((res) => {
      setOrders(res);
      setLoading(false);
    });
  }, [user]);

  // Filter & Search
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.items.some((item) => item.title.toLowerCase().includes(q));

      // Status
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      // Time
      let matchesTime = true;
      const orderDate = new Date(order.date).getTime();
      const now = Date.now();
      if (timeFilter === '30days') {
        matchesTime = now - orderDate <= 30 * 24 * 60 * 60 * 1000;
      } else if (timeFilter === '6months') {
        matchesTime = now - orderDate <= 180 * 24 * 60 * 60 * 1000;
      } else if (timeFilter === 'year') {
        matchesTime = now - orderDate <= 365 * 24 * 60 * 60 * 1000;
      }

      return matchesSearch && matchesStatus && matchesTime;
    });
  }, [orders, searchQuery, statusFilter, timeFilter]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  const handleBuyAgain = (order: Order) => {
    order.items.forEach((item) => {
      addToCart(item.bookId, `${item.bookId}-${item.format.toLowerCase()}`, true);
    });
    showToast(`Added ${order.items.length} item(s) to your bag`, { type: 'success' });
  };

  const handleConfirmCancel = async () => {
    if (!user || !cancellingOrder) return;
    try {
      const updated = await accountService.cancelOrder(user.id, cancellingOrder.id);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      showToast(`Order ${updated.orderNumber} has been cancelled`, { type: 'info' });
      setCancellingOrder(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel order';
      showToast(message, { type: 'error' });
    }
  };

  return (
    <AccountLayout
      breadcrumbs={[{ label: 'Orders' }]}
      title="Your Orders"
      description="Track shipments, request returns, print invoices, and view order history."
    >
      {/* Search and Filters Bar */}
      <div
        style={{
          background: 'var(--white)',
          border: '1px solid var(--line)',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search
            size={16}
            color="var(--muted)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search orders by number or book title..."
            aria-label="Search orders"
            style={{
              width: '100%',
              padding: '10px 14px 10px 36px',
              borderRadius: '6px',
              border: '1px solid var(--line)',
              background: 'var(--paper)',
              fontSize: '14px',
              color: 'var(--ink)',
            }}
          />
        </div>

        {/* Time Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="order-time-filter" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--muted)' }}>
            Period:
          </label>
          <select
            id="order-time-filter"
            value={timeFilter}
            onChange={(e) => {
              setTimeFilter(e.target.value as typeof timeFilter);
              setPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid var(--line)',
              background: 'var(--paper)',
              fontSize: '14px',
              color: 'var(--ink)',
            }}
          >
            <option value="all">All orders</option>
            <option value="30days">Past 30 days</option>
            <option value="6months">Past 6 months</option>
            <option value="year">Past year</option>
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="order-status-filter" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--muted)' }}>
            Status:
          </label>
          <select
            id="order-status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as typeof statusFilter);
              setPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid var(--line)',
              background: 'var(--paper)',
              fontSize: '14px',
              color: 'var(--ink)',
            }}
          >
            <option value="all">All statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Packed">Packed</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: '140px',
                background: 'var(--white)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                animation: 'pulse 1.5s infinite',
              }}
            />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <Package size={36} color="var(--taupe)" style={{ marginBottom: '12px' }} aria-hidden="true" />
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: '0 0 8px' }}>
            No orders found
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '15px', maxWidth: '420px', margin: '0 auto 20px' }}>
            {searchQuery || statusFilter !== 'all' || timeFilter !== 'all'
              ? 'Try adjusting your search query or period filters.'
              : 'You have not placed any orders yet. Discover our curated volumes on the bookshelf.'}
          </p>
          <Link href="/books" className="button button-dark" style={{ padding: '10px 24px', fontSize: '14px' }}>
            Browse Books
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {paginatedOrders.map((order) => {
            const isCancellable = order.status === 'Confirmed' || order.status === 'Packed';
            const isDelivered = order.status === 'Delivered';

            return (
              <article
                key={order.id}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-contact)',
                }}
              >
                {/* Header Strip */}
                <div
                  style={{
                    background: 'var(--paper)',
                    borderBottom: '1px solid var(--line)',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ color: 'var(--muted)', display: 'block', textTransform: 'uppercase', fontSize: '11px', fontWeight: 600 }}>
                        ORDER PLACED
                      </span>
                      <strong style={{ color: 'var(--ink)' }}>{formatDate(order.date)}</strong>
                    </div>

                    <div>
                      <span style={{ color: 'var(--muted)', display: 'block', textTransform: 'uppercase', fontSize: '11px', fontWeight: 600 }}>
                        TOTAL
                      </span>
                      <strong style={{ color: 'var(--wine)' }}>{formatCurrency(order.total)}</strong>
                    </div>

                    <div>
                      <span style={{ color: 'var(--muted)', display: 'block', textTransform: 'uppercase', fontSize: '11px', fontWeight: 600 }}>
                        SHIP TO
                      </span>
                      <strong style={{ color: 'var(--ink)' }}>{order.shippingAddress.fullName}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                      {order.isSample && (
                        <span
                          style={{
                            background: 'rgba(194, 155, 98, 0.2)',
                            color: 'var(--wine-dark)',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                          }}
                        >
                          Sample order
                        </span>
                      )}
                      <span style={{ color: 'var(--muted)', fontSize: '12px' }}>
                        ORDER # {order.orderNumber}
                      </span>
                    </div>
                    <Link
                      href={`/account/orders/${order.id}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: 'var(--wine)',
                        fontSize: '13px',
                        fontWeight: 600,
                        marginTop: '4px',
                      }}
                    >
                      View Order Details <ExternalLink size={13} aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                {/* Body Content */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Status Banner */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          background:
                            order.status === 'Delivered'
                              ? 'rgba(40, 167, 69, 0.12)'
                              : order.status === 'Cancelled'
                              ? 'rgba(114, 38, 56, 0.12)'
                              : 'rgba(194, 155, 98, 0.18)',
                          color:
                            order.status === 'Delivered'
                              ? '#1E7E34'
                              : order.status === 'Cancelled'
                              ? 'var(--wine)'
                              : 'var(--wine-dark)',
                        }}
                      >
                        {order.status}
                      </span>
                      <span style={{ fontSize: '14px', color: 'var(--muted)' }}>
                        {order.estimatedDelivery}
                      </span>
                    </div>

                    {order.trackingNumber && (
                      <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                        Tracking: <strong style={{ color: 'var(--ink)' }}>{order.trackingNumber}</strong> ({order.carrier})
                      </span>
                    )}
                  </div>

                  {/* Items List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div
                            style={{
                              width: '42px',
                              height: '56px',
                              background: 'var(--paper)',
                              border: '1px solid var(--line)',
                              borderRadius: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: 'var(--font-serif)',
                              fontSize: '12px',
                              color: 'var(--wine)',
                              flexShrink: 0,
                            }}
                          >
                            Ann
                          </div>
                          <div>
                            <Link
                              href={`/books/${item.bookSlug}`}
                              style={{
                                color: 'var(--ink)',
                                fontWeight: 600,
                                fontSize: '15px',
                                textDecoration: 'none',
                              }}
                            >
                              {item.title}
                            </Link>
                            <span style={{ display: 'block', fontSize: '13px', color: 'var(--muted)' }}>
                              Format: {item.format} · Qty: {item.quantity} · {formatCurrency(item.price)} each
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Link
                            href={`/books/${item.bookSlug}`}
                            style={{
                              fontSize: '13px',
                              color: 'var(--ink)',
                              padding: '6px 12px',
                              border: '1px solid var(--line)',
                              borderRadius: '4px',
                              textDecoration: 'none',
                            }}
                          >
                            View Item
                          </Link>
                          {isDelivered && (
                            <Link
                              href={`/account/reviews?bookId=${item.bookId}&orderId=${order.id}`}
                              style={{
                                fontSize: '13px',
                                color: 'var(--wine)',
                                padding: '6px 12px',
                                border: '1px solid var(--wine)',
                                borderRadius: '4px',
                                textDecoration: 'none',
                                fontWeight: 500,
                              }}
                            >
                              Write Review
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '12px',
                      borderTop: '1px solid var(--line)',
                      paddingTop: '16px',
                      flexWrap: 'wrap',
                    }}
                  >
                    {isCancellable && (
                      <button
                        type="button"
                        onClick={() => setCancellingOrder(order)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: 'var(--wine)',
                          background: 'transparent',
                          border: '1px solid rgba(114, 38, 56, 0.3)',
                          padding: '8px 14px',
                          borderRadius: '4px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Ban size={14} aria-hidden="true" />
                        <span>Cancel Order</span>
                      </button>
                    )}

                    {isDelivered && (
                      <Link
                        href={`/account/orders/${order.id}#return`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: 'var(--ink)',
                          background: 'var(--paper)',
                          border: '1px solid var(--line)',
                          padding: '8px 14px',
                          borderRadius: '4px',
                          fontSize: '13px',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        <RotateCcw size={14} aria-hidden="true" />
                        <span>Request Return</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => handleBuyAgain(order)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#fff',
                        background: 'var(--ink)',
                        border: 0,
                        padding: '8px 16px',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <ShoppingBag size={14} aria-hidden="true" />
                      <span>Buy It Again</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                marginTop: '16px',
              }}
            >
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid var(--line)',
                  background: 'var(--white)',
                  fontSize: '14px',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: page <= 1 ? 0.5 : 1,
                }}
              >
                Previous
              </button>
              <span style={{ fontSize: '14px', color: 'var(--muted)' }}>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid var(--line)',
                  background: 'var(--white)',
                  fontSize: '14px',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: page >= totalPages ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {cancellingOrder && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 18, 17, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 'var(--z-modal, 50)',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'var(--white)',
              borderRadius: '8px',
              maxWidth: '460px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-monumental)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--wine)', marginBottom: '12px' }}>
              <AlertCircle size={22} aria-hidden="true" />
              <h3 id="cancel-order-dialog-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0 }}>
                Cancel Order {cancellingOrder.orderNumber}?
              </h3>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px' }}>
              Are you sure you want to cancel this order? This action cannot be reversed. In this demo, no charge was incurred.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="button button-outline"
                style={{ padding: '8px 18px', fontSize: '14px', minHeight: '40px' }}
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                style={{
                  background: 'var(--wine)',
                  color: '#fff',
                  border: 0,
                  borderRadius: '4px',
                  padding: '8px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '40px',
                }}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}
