'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { useStore } from '@/contexts/store-context';
import { accountService } from '@/lib/account/service';
import { Order, OrderStatus, ReturnReason } from '@/lib/account/types';
import AccountLayout from '@/components/account/account-layout';
import { useToast } from '@/components/account/account-toast';
import {
  Package,
  ArrowLeft,
  Printer,
  ShoppingBag,
  Ban,
  RotateCcw,
  Star,
  ExternalLink,
  MapPin,
  CreditCard,
  CheckCircle2,
  Clock,
  X,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const router = useRouter();
  const { user } = useAuth();
  const { formatCurrency, formatDate } = useLanguage();
  const { addToCart } = useStore();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReasonInput, setCancelReasonInput] = useState('Order placed by mistake');

  const [returnItem, setReturnItem] = useState<{ id: string; title: string; format: string; price: number } | null>(null);
  const [returnReason, setReturnReason] = useState<ReturnReason>('Defective / Damaged');
  const [returnComment, setReturnComment] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    if (!user) return;
    accountService.getOrderById(user.id, orderId).then((res) => {
      setOrder(res);
      setLoading(false);
    });
  }, [user, orderId]);

  const handleBuyAgain = () => {
    if (!order) return;
    order.items.forEach((item) => {
      addToCart(item.bookId, `${item.bookId}-${item.format.toLowerCase()}`, true);
    });
    showToast(`Added ${order.items.length} item(s) to your bag`, { type: 'success' });
  };

  const handleConfirmCancel = async () => {
    if (!user || !order) return;
    setCancelling(true);
    try {
      const updated = await accountService.cancelOrder(user.id, order.id, cancelReasonInput);
      setOrder(updated);
      showToast(`Order ${updated.orderNumber} has been cancelled`, { type: 'info' });
      setShowCancelModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel order';
      showToast(msg, { type: 'error' });
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !order || !returnItem) return;
    setSubmittingReturn(true);
    try {
      const res = await accountService.createReturn(user.id, {
        orderId: order.id,
        orderNumber: order.orderNumber,
        itemId: returnItem.id,
        itemTitle: returnItem.title,
        itemFormat: returnItem.format,
        quantity: 1,
        reason: returnReason,
        comment: returnComment.trim() || undefined,
        refundAmount: returnItem.price,
      });
      showToast(`Return request ${res.returnNumber} created`, { type: 'success' });
      setReturnItem(null);
      router.push('/account/returns');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit return request';
      showToast(msg, { type: 'error' });
    } finally {
      setSubmittingReturn(false);
    }
  };

  // Carrier tracking URL builder
  const getTrackingUrl = (carrier?: string, trackingNumber?: string) => {
    if (!trackingNumber) return '#';
    const c = (carrier || '').toLowerCase();
    if (c.includes('usps')) {
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
    }
    if (c.includes('ups')) {
      return `https://www.ups.com/track?tracknum=${trackingNumber}`;
    }
    if (c.includes('fedex')) {
      return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
    }
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  };

  const STEPS: { status: OrderStatus; label: string; desc: string }[] = [
    { status: 'Confirmed', label: 'Order Confirmed', desc: 'Payment verified & order acknowledged' },
    { status: 'Packed', label: 'Archival Packing', desc: 'Hand-wrapped in archival protective kraft' },
    { status: 'Dispatched', label: 'Dispatched', desc: 'In custody of postal carrier' },
    { status: 'Delivered', label: 'Delivered', desc: 'Safely delivered to your address' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'Confirmed':
        return 0;
      case 'Packed':
        return 1;
      case 'Dispatched':
        return 2;
      case 'Delivered':
        return 3;
      case 'Cancelled':
        return -1;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <AccountLayout
        breadcrumbs={[{ label: 'Orders', href: '/account/orders' }, { label: 'Order Details' }]}
        title="Order Details"
      >
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              border: '3px solid var(--line)',
              borderTopColor: 'var(--wine)',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p>Loading order details...</p>
        </div>
      </AccountLayout>
    );
  }

  if (!order) {
    return (
      <AccountLayout
        breadcrumbs={[{ label: 'Orders', href: '/account/orders' }, { label: 'Not Found' }]}
        title="Order Not Found"
      >
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <Package size={44} color="var(--taupe)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', margin: '0 0 12px' }}>
            We couldn&apos;t find this order
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '15px', margin: '0 0 24px' }}>
            This order ID may have been removed or does not belong to your account.
          </p>
          <Link
            href="/account/orders"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'var(--wine)',
              color: 'var(--white)',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '15px',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} />
            Back to Your Orders
          </Link>
        </div>
      </AccountLayout>
    );
  }

  const currentStep = getStepIndex(order.status);
  const canCancel = order.status === 'Confirmed' || order.status === 'Packed';
  const isDelivered = order.status === 'Delivered';

  return (
    <AccountLayout
      breadcrumbs={[
        { label: 'Orders', href: '/account/orders' },
        { label: `Order #${order.orderNumber}` },
      ]}
      title={`Order #${order.orderNumber}`}
      description={`Placed on ${formatDate(order.date)} · ${order.items.length} item(s)`}
      action={
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            href={`/account/orders/${order.id}/invoice`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: 'var(--white)',
              border: '1px solid var(--line)',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--ink)',
              minHeight: '42px',
              textDecoration: 'none',
            }}
          >
            <Printer size={15} aria-hidden="true" />
            <span>Print Invoice</span>
          </Link>
          <button
            type="button"
            onClick={handleBuyAgain}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: 'var(--ink)',
              border: '1px solid var(--ink)',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--paper)',
              cursor: 'pointer',
              minHeight: '42px',
            }}
          >
            <ShoppingBag size={15} aria-hidden="true" />
            <span>Buy It Again</span>
          </button>
        </div>
      }
    >
      {/* Sample Order Banner */}
      {order.isSample && (
        <div
          style={{
            background: 'var(--paper-warm)',
            border: '1px solid var(--beige)',
            borderRadius: '6px',
            padding: '10px 16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            color: 'var(--muted)',
          }}
        >
          <span
            style={{
              background: 'var(--beige)',
              color: 'var(--ink)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Sample Order
          </span>
          <span>This is an editorial demonstration order pre-loaded for your account.</span>
        </div>
      )}

      {/* Status Timeline */}
      <div
        style={{
          background: 'var(--white)',
          border: '1px solid var(--line)',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: '0 0 4px', color: 'var(--ink)' }}>
              Shipment Status:{' '}
              <span
                style={{
                  color:
                    order.status === 'Cancelled'
                      ? 'var(--terracotta)'
                      : order.status === 'Delivered'
                      ? 'var(--wine)'
                      : 'var(--ink)',
                }}
              >
                {order.status}
              </span>
            </h2>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>
              {order.status === 'Cancelled'
                ? `Cancelled on ${order.cancelledAt ? formatDate(order.cancelledAt) : 'recently'}`
                : `Estimated Delivery: ${formatDate(order.estimatedDelivery)}`}
            </p>
          </div>

          {order.trackingNumber && order.status !== 'Cancelled' && (
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>
                Carrier: {order.carrier || 'USPS Priority'}
              </span>
              <a
                href={getTrackingUrl(order.carrier, order.trackingNumber)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--wine)',
                  textDecoration: 'none',
                }}
              >
                <span>Track #{order.trackingNumber}</span>
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
          )}
        </div>

        {/* Timeline Steps or Cancelled Notice */}
        {order.status === 'Cancelled' ? (
          <div
            style={{
              padding: '16px',
              borderRadius: '6px',
              background: 'rgba(163, 72, 57, 0.08)',
              border: '1px solid var(--terracotta)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <Ban size={20} color="var(--terracotta)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', fontSize: '14px', color: 'var(--terracotta)', marginBottom: '4px' }}>
                This order was cancelled
              </strong>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink)' }}>
                Reason: {order.cancelReason || 'Cancelled by customer'}. No charges were finalized, or a full refund was
                credited to your original payment method.
              </p>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              position: 'relative',
            }}
          >
            {STEPS.map((step, idx) => {
              const isPast = idx < currentStep;
              const isNow = idx === currentStep;
              return (
                <div
                  key={step.status}
                  style={{
                    padding: '16px',
                    borderRadius: '6px',
                    background: isNow ? 'var(--paper)' : 'transparent',
                    border: isNow ? '1px solid var(--wine)' : '1px solid var(--line)',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    {isPast ? (
                      <CheckCircle2 size={18} color="var(--wine)" aria-hidden="true" />
                    ) : isNow ? (
                      <Clock size={18} color="var(--wine)" aria-hidden="true" />
                    ) : (
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: '2px solid var(--taupe)',
                        }}
                      />
                    )}
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: isNow || isPast ? 700 : 500,
                        color: isNow || isPast ? 'var(--ink)' : 'var(--muted)',
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Cancel Button if eligible */}
        {canCancel && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                background: 'transparent',
                border: '1px solid var(--line)',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--terracotta)',
                cursor: 'pointer',
                minHeight: '40px',
              }}
            >
              <Ban size={15} aria-hidden="true" />
              <span>Cancel Order</span>
            </button>
          </div>
        )}
      </div>

      {/* Items Section */}
      <div
        style={{
          background: 'var(--white)',
          border: '1px solid var(--line)',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: '0 0 20px', color: 'var(--ink)' }}>
          Items in this Order ({order.items.length})
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {order.items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '20px',
                paddingBottom: '20px',
                borderBottom: '1px solid var(--line)',
                flexWrap: 'wrap',
              }}
            >
              {/* Cover thumbnail */}
              <div
                style={{
                  width: '64px',
                  height: '92px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  background: 'var(--paper)',
                  flexShrink: 0,
                  border: '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.cover}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Package size={24} color="var(--taupe)" />
                )}
              </div>

              {/* Title & info */}
              <div style={{ flex: 1, minWidth: '220px' }}>
                <Link
                  href={`/books/${item.bookSlug || item.bookId}`}
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '17px',
                    fontWeight: 700,
                    color: 'var(--ink)',
                    textDecoration: 'none',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  {item.title}
                </Link>
                <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '8px' }}>
                  Format: {item.format} · Qty: {item.quantity} · Price: {formatCurrency(item.price)}
                </div>

                {/* Per-Item Actions */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(item.bookId, `${item.bookId}-${item.format.toLowerCase()}`, true);
                      showToast(`Added "${item.title}" to your bag`, { type: 'success' });
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--wine)',
                      background: 'transparent',
                      border: 0,
                      padding: 0,
                      cursor: 'pointer',
                      minHeight: '32px',
                    }}
                  >
                    <ShoppingBag size={14} aria-hidden="true" />
                    <span>Buy it again</span>
                  </button>

                  {isDelivered && (
                    <>
                      <span style={{ color: 'var(--line)' }}>|</span>
                      <button
                        type="button"
                        onClick={() =>
                          setReturnItem({
                            id: item.id,
                            title: item.title,
                            format: item.format,
                            price: item.price,
                          })
                        }
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--ink)',
                          background: 'transparent',
                          border: 0,
                          padding: 0,
                          cursor: 'pointer',
                          minHeight: '32px',
                        }}
                      >
                        <RotateCcw size={14} aria-hidden="true" />
                        <span>Request Return</span>
                      </button>
                      <span style={{ color: 'var(--line)' }}>|</span>
                      <Link
                        href={`/account/reviews?bookId=${item.bookId}&orderId=${order.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--wine)',
                          textDecoration: 'none',
                          minHeight: '32px',
                        }}
                      >
                        <Star size={14} aria-hidden="true" />
                        <span>Write a Review</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Total for item */}
              <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '16px', color: 'var(--ink)' }}>
                {formatCurrency(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Address & Payment & Summary Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Shipping Address */}
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <MapPin size={18} color="var(--wine)" aria-hidden="true" />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: 0, color: 'var(--ink)' }}>
              Shipping Address
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--ink)' }}>
            <strong>{order.shippingAddress.fullName}</strong>
            <br />
            {order.shippingAddress.street}
            {order.shippingAddress.apartment && <>, {order.shippingAddress.apartment}</>}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.country}
            {order.shippingAddress.phone && (
              <>
                <br />
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Phone: {order.shippingAddress.phone}</span>
              </>
            )}
          </p>
        </div>

        {/* Payment Method */}
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <CreditCard size={18} color="var(--wine)" aria-hidden="true" />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: 0, color: 'var(--ink)' }}>
              Payment Method
            </h3>
          </div>
          {order.paymentMethod ? (
            <div style={{ fontSize: '14px', color: 'var(--ink)', lineHeight: 1.6 }}>
              <strong>{order.paymentMethod.brand}</strong> ending in {order.paymentMethod.last4}
              <br />
              <span style={{ color: 'var(--muted)', fontSize: '13px' }}>
                Expires: {String(order.paymentMethod.expMonth).padStart(2, '0')}/{order.paymentMethod.expYear}
              </span>
              <br />
              <span
                style={{
                  display: 'inline-block',
                  marginTop: '8px',
                  background: 'var(--paper)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: 'var(--muted)',
                }}
              >
                Demo card transaction
              </span>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>
              Standard Card Checkout
            </p>
          )}
        </div>

        {/* Order Totals Summary */}
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '24px',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              margin: '0 0 16px',
              color: 'var(--ink)',
              borderBottom: '1px solid var(--line)',
              paddingBottom: '10px',
            }}
          >
            Order Summary
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
              <span>Items Subtotal:</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
              <span>Shipping & Handling:</span>
              <span>{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
              <span>Estimated Tax:</span>
              <span>{formatCurrency(order.estimatedTax)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 700,
                fontSize: '16px',
                color: 'var(--ink)',
                borderTop: '1px solid var(--line)',
                paddingTop: '10px',
                marginTop: '4px',
              }}
            >
              <span>Grand Total:</span>
              <span style={{ color: 'var(--wine)' }}>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-order-dialog-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 18, 17, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--white)',
              borderRadius: '8px',
              maxWidth: '480px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-monumental)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 id="cancel-order-dialog-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0, color: 'var(--ink)' }}>
                Cancel Order #{order.orderNumber}
              </h3>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: '4px', minHeight: '36px' }}
                aria-label="Close dialog"
              >
                <X size={20} color="var(--muted)" />
              </button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '0 0 16px', lineHeight: 1.5 }}>
              Are you sure you want to cancel this order? Since this order has not yet been dispatched, your payment
              authorisation will be voided immediately.
            </p>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--ink)' }}>
              Reason for cancellation
            </label>
            <select
              value={cancelReasonInput}
              onChange={(e) => setCancelReasonInput(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid var(--line)',
                background: 'var(--paper)',
                color: 'var(--ink)',
                fontSize: '15px',
                marginBottom: '20px',
              }}
            >
              <option value="Order placed by mistake">Order placed by mistake</option>
              <option value="Found a better price elsewhere">Found a better price elsewhere</option>
              <option value="Need to change shipping address">Need to change shipping address</option>
              <option value="Shipping time is too slow">Shipping time is too slow</option>
              <option value="Other">Other</option>
            </select>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                style={{
                  padding: '10px 18px',
                  background: 'transparent',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '42px',
                }}
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                style={{
                  padding: '10px 20px',
                  background: 'var(--terracotta)',
                  border: 0,
                  borderRadius: '6px',
                  color: 'var(--white)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: cancelling ? 'not-allowed' : 'pointer',
                  minHeight: '42px',
                }}
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Return Modal */}
      {returnItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="return-item-dialog-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 18, 17, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <form
            onSubmit={handleSubmitReturn}
            style={{
              background: 'var(--white)',
              borderRadius: '8px',
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-monumental)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 id="return-item-dialog-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0, color: 'var(--ink)' }}>
                Request Return: {returnItem.title}
              </h3>
              <button
                type="button"
                onClick={() => setReturnItem(null)}
                style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: '4px', minHeight: '36px' }}
                aria-label="Close dialog"
              >
                <X size={20} color="var(--muted)" />
              </button>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '0 0 16px' }}>
              Format: {returnItem.format} · Refund amount:{' '}
              <strong style={{ color: 'var(--ink)' }}>{formatCurrency(returnItem.price)}</strong>
            </p>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--ink)' }}>
              Reason for return *
            </label>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value as ReturnReason)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid var(--line)',
                background: 'var(--paper)',
                color: 'var(--ink)',
                fontSize: '15px',
                marginBottom: '16px',
              }}
            >
              <option value="Defective / Damaged">Defective / Damaged</option>
              <option value="Wrong item received">Wrong item received</option>
              <option value="Changed mind">Changed mind</option>
              <option value="Arrived too late">Arrived too late</option>
            </select>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--ink)' }}>
              Additional comments (optional)
            </label>
            <textarea
              rows={3}
              value={returnComment}
              onChange={(e) => setReturnComment(e.target.value)}
              placeholder="Describe any issues with condition or packaging..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid var(--line)',
                background: 'var(--paper)',
                color: 'var(--ink)',
                fontSize: '14px',
                marginBottom: '20px',
                resize: 'vertical',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setReturnItem(null)}
                disabled={submittingReturn}
                style={{
                  padding: '10px 18px',
                  background: 'transparent',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '42px',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReturn}
                style={{
                  padding: '10px 20px',
                  background: 'var(--wine)',
                  border: 0,
                  borderRadius: '6px',
                  color: 'var(--white)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: submittingReturn ? 'not-allowed' : 'pointer',
                  minHeight: '42px',
                }}
              >
                {submittingReturn ? 'Submitting...' : 'Generate Return Label'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AccountLayout>
  );
}
