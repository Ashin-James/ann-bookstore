'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { accountService } from '@/lib/account/service';
import { ReturnRequest } from '@/lib/account/types';
import AccountLayout from '@/components/account/account-layout';
import { useToast } from '@/components/account/account-toast';
import {
  RotateCcw,
  Printer,
  Ban,
  Clock,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function ReturnsPage() {
  const { user } = useAuth();
  const { formatCurrency, formatDate } = useLanguage();
  const { showToast } = useToast();

  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    accountService.getReturns(user.id).then((res) => {
      setReturns(res);
      setLoading(false);
    });
  }, [user]);

  const handleCancelReturn = async (ret: ReturnRequest) => {
    if (!user) return;
    setCancellingId(ret.id);
    try {
      const updated = await accountService.cancelReturn(user.id, ret.id);
      setReturns((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      showToast(`Return request ${updated.returnNumber} cancelled`, { type: 'info' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel return';
      showToast(msg, { type: 'error' });
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: ReturnRequest['status']) => {
    switch (status) {
      case 'Return Requested':
        return {
          bg: 'rgba(114, 38, 56, 0.08)',
          color: 'var(--wine)',
          border: 'var(--wine)',
          icon: Clock,
        };
      case 'In Transit':
        return {
          bg: 'rgba(194, 155, 98, 0.1)',
          color: 'var(--gold-foil)',
          border: 'var(--gold-foil)',
          icon: RotateCcw,
        };
      case 'Refund Processed':
        return {
          bg: 'rgba(54, 50, 46, 0.08)',
          color: 'var(--ink)',
          border: 'var(--ink)',
          icon: CheckCircle2,
        };
      case 'Cancelled':
        return {
          bg: 'rgba(163, 72, 57, 0.08)',
          color: 'var(--terracotta)',
          border: 'var(--terracotta)',
          icon: Ban,
        };
      default:
        return {
          bg: 'var(--paper)',
          color: 'var(--muted)',
          border: 'var(--line)',
          icon: Clock,
        };
    }
  };

  return (
    <AccountLayout
      breadcrumbs={[{ label: 'Returns & Refunds' }]}
      title="Returns & Refunds"
      description="Track the status of your return authorisations, print shipping labels, and monitor refunds."
    >
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)' }}>
          Loading returns...
        </div>
      ) : returns.length === 0 ? (
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <RotateCcw size={40} color="var(--taupe)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: '0 0 8px' }}>
            No Active Returns
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '0 0 20px', maxWidth: '480px', marginInline: 'auto' }}>
            You have no items pending return. Eligible delivered books can be returned within 30 days of arrival.
          </p>
          <Link
            href="/account/orders"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'var(--wine)',
              color: 'var(--white)',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <span>View Delivered Orders</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {returns.map((ret) => {
            const badge = getStatusBadge(ret.status);
            const StatusIcon = badge.icon;
            const canCancel = ret.status === 'Return Requested';

            return (
              <div
                key={ret.id}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  padding: '24px',
                }}
              >
                {/* Header info */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid var(--line)',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Return Authorisation
                    </span>
                    <strong style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--ink)' }}>
                      #{ret.returnNumber}
                    </strong>
                    <span style={{ fontSize: '13px', color: 'var(--muted)', marginLeft: '12px' }}>
                      Requested {formatDate(ret.createdAt)} · Order #{ret.orderNumber}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`,
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '0.03em',
                    }}
                  >
                    <StatusIcon size={14} />
                    <span>{ret.status}</span>
                  </div>
                </div>

                {/* Item Details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: '0 0 4px', color: 'var(--ink)' }}>
                      {ret.itemTitle}
                    </h3>
                    <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'var(--muted)' }}>
                      Format: {ret.itemFormat} · Quantity: {ret.quantity} · Reason: <strong>{ret.reason}</strong>
                    </p>
                    {ret.comment && (
                      <p
                        style={{
                          margin: '8px 0 0',
                          fontSize: '13px',
                          color: 'var(--ink)',
                          background: 'var(--paper)',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontStyle: 'italic',
                        }}
                      >
                        &ldquo;{ret.comment}&rdquo;
                      </p>
                    )}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>
                      Estimated Refund
                    </span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--wine)' }}>
                      {formatCurrency(ret.refundAmount)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div
                  style={{
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    {ret.status !== 'Cancelled' ? (
                      <Link
                        href={`/account/returns/${ret.returnNumber}/label`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          background: 'var(--ink)',
                          color: 'var(--paper)',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 600,
                          textDecoration: 'none',
                          minHeight: '38px',
                        }}
                      >
                        <Printer size={14} aria-hidden="true" />
                        <span>Print Return Label</span>
                      </Link>
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                        Return request cancelled.
                      </span>
                    )}
                  </div>

                  {canCancel && (
                    <button
                      type="button"
                      onClick={() => handleCancelReturn(ret)}
                      disabled={cancellingId === ret.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        background: 'transparent',
                        border: '1px solid var(--line)',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--terracotta)',
                        cursor: cancellingId === ret.id ? 'not-allowed' : 'pointer',
                        minHeight: '38px',
                      }}
                    >
                      <Ban size={14} aria-hidden="true" />
                      <span>{cancellingId === ret.id ? 'Cancelling...' : 'Cancel Return'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AccountLayout>
  );
}
