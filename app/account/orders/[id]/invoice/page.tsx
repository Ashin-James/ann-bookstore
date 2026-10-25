'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { accountService } from '@/lib/account/service';
import { Order } from '@/lib/account/types';
import { Printer, ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderInvoicePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const { user } = useAuth();
  const { formatCurrency, formatDate } = useLanguage();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    accountService.getOrderById(user.id, orderId).then((res) => {
      setOrder(res);
      setLoading(false);
    });
  }, [user, orderId]);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'var(--font-sans)', color: 'var(--muted)' }}>
        Loading invoice...
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'var(--font-sans)' }}>
        <h2>Order Not Found</h2>
        <p style={{ color: 'var(--muted)' }}>We could not find the order corresponding to this invoice.</p>
        <Link href="/account/orders" style={{ color: 'var(--wine)', textDecoration: 'underline' }}>
          Back to Your Orders
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--paper)',
        color: 'var(--ink)',
        padding: '36px 20px 80px',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Top action toolbar (hidden on print) */}
      <div
        className="no-print"
        style={{
          maxWidth: '820px',
          margin: '0 auto 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <Link
          href={`/account/orders/${order.id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--muted)',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} />
          Back to Order Details
        </Link>

        <button
          type="button"
          onClick={() => window.print()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'var(--ink)',
            color: 'var(--paper)',
            border: 0,
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Printer size={16} />
          Print / Save PDF
        </button>
      </div>

      {/* Invoice Sheet */}
      <div
        id="invoice-sheet"
        style={{
          maxWidth: '820px',
          margin: '0 auto',
          background: 'var(--white)',
          border: '1px solid var(--line)',
          borderRadius: '8px',
          padding: '48px',
          boxShadow: 'var(--shadow-ambient)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid var(--ink)',
            paddingBottom: '24px',
            marginBottom: '32px',
            gap: '24px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--wine)',
                letterSpacing: '-0.02em',
                display: 'block',
              }}
            >
              Ann&apos;s Bookstore
            </span>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.4 }}>
              Independent Literary Bookseller &amp; Publisher
              <br />
              1420 5th Avenue, Suite 1800 · Seattle, WA 98101
              <br />
              help@annbooks.demo · (206) 555-0192
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                display: 'block',
              }}
            >
              INVOICE / RECEIPT
            </span>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '22px',
                fontWeight: 700,
                color: 'var(--ink)',
                display: 'block',
              }}
            >
              #{order.orderNumber}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
              Date: {formatDate(order.date)}
            </span>
          </div>
        </div>

        {/* Addresses Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
            fontSize: '14px',
          }}
        >
          <div>
            <strong
              style={{
                display: 'block',
                fontSize: '11px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: '6px',
              }}
            >
              Billed To
            </strong>
            <p style={{ margin: 0, lineHeight: 1.5 }}>
              {order.billingAddress?.fullName || order.shippingAddress.fullName}
              <br />
              {order.billingAddress?.street || order.shippingAddress.street}
              {(order.billingAddress?.apartment || order.shippingAddress.apartment) && (
                <>, {order.billingAddress?.apartment || order.shippingAddress.apartment}</>
              )}
              <br />
              {order.billingAddress?.city || order.shippingAddress.city},{' '}
              {order.billingAddress?.state || order.shippingAddress.state}{' '}
              {order.billingAddress?.postalCode || order.shippingAddress.postalCode}
              <br />
              {order.billingAddress?.country || order.shippingAddress.country}
            </p>
          </div>

          <div>
            <strong
              style={{
                display: 'block',
                fontSize: '11px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: '6px',
              }}
            >
              Shipped To
            </strong>
            <p style={{ margin: 0, lineHeight: 1.5 }}>
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.street}
              {order.shippingAddress.apartment && <>, {order.shippingAddress.apartment}</>}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
            </p>
          </div>

          <div>
            <strong
              style={{
                display: 'block',
                fontSize: '11px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: '6px',
              }}
            >
              Payment &amp; Status
            </strong>
            <p style={{ margin: 0, lineHeight: 1.5 }}>
              Status: <strong>{order.status}</strong>
              <br />
              Payment: {order.paymentMethod ? `${order.paymentMethod.brand} *${order.paymentMethod.last4}` : 'Card'}
              <br />
              Carrier: {order.carrier || 'USPS Priority'}
              {order.trackingNumber && (
                <>
                  <br />
                  Tracking: {order.trackingNumber}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '32px',
            fontSize: '14px',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid var(--ink)', textAlign: 'left' }}>
              <th style={{ padding: '10px 0', fontWeight: 700 }}>Description</th>
              <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>Format</th>
              <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>Qty</th>
              <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Unit Price</th>
              <th style={{ padding: '10px 0', fontWeight: 700, textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '14px 0', fontWeight: 600 }}>{item.title}</td>
                <td style={{ padding: '14px 12px', textAlign: 'center', color: 'var(--muted)' }}>{item.format}</td>
                <td style={{ padding: '14px 12px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '14px 12px', textAlign: 'right', color: 'var(--muted)' }}>
                  {formatCurrency(item.price)}
                </td>
                <td style={{ padding: '14px 0', textAlign: 'right', fontWeight: 600 }}>
                  {formatCurrency(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Breakdown */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
          <div style={{ width: '280px', fontSize: '14px', lineHeight: 1.8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
              <span>Items Subtotal:</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
              <span>Shipping &amp; Handling:</span>
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
                fontSize: '17px',
                color: 'var(--ink)',
                borderTop: '2px solid var(--ink)',
                paddingTop: '8px',
                marginTop: '8px',
              }}
            >
              <span>Total Paid:</span>
              <span style={{ color: 'var(--wine)' }}>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div
          style={{
            borderTop: '1px solid var(--line)',
            paddingTop: '20px',
            fontSize: '12px',
            color: 'var(--muted)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          <p style={{ margin: '0 0 4px' }}>
            Thank you for supporting Ann&apos;s independent bookstore. All orders are wrapped with archival care.
          </p>
          <p style={{ margin: 0 }}>
            Questions regarding this order? Contact our reader concierge at help@annbooks.demo or visit /account/help.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
          #invoice-sheet {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
