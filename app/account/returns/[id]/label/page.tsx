'use client';

import { use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Printer, ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ReturnLabelPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const returnId = resolvedParams.id;
  const { user } = useAuth();

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
      {/* Top action toolbar */}
      <div
        className="no-print"
        style={{
          maxWidth: '680px',
          margin: '0 auto 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <Link
          href="/account/returns"
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
          Back to Returns &amp; Refunds
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
          Print Return Label
        </button>
      </div>

      {/* Shipping Label Sheet */}
      <div
        id="label-sheet"
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          background: 'var(--white)',
          border: '2px dashed var(--ink)',
          borderRadius: '4px',
          padding: '32px',
          boxShadow: 'var(--shadow-ambient)',
        }}
      >
        {/* Label Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '2px solid var(--ink)',
            paddingBottom: '16px',
            marginBottom: '20px',
          }}
        >
          <div>
            <span style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '0.05em' }}>
              PRIORITY MAIL RETURN®
            </span>
            <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>
              USPS PRE-PAID RETURN SERVICE
            </span>
          </div>
          <div
            style={{
              border: '2px solid var(--ink)',
              padding: '6px 14px',
              fontWeight: 900,
              fontSize: '18px',
              letterSpacing: '0.1em',
            }}
          >
            NO POSTAGE NECESSARY
          </div>
        </div>

        {/* Sender & Recipient addresses */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
              FROM (READER):
            </span>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.4 }}>
              <strong>{user?.name || 'Reader'}</strong>
              <br />
              {user?.email || 'reader.eleanor@example.com'}
              <br />
              Authorized Return Account
            </p>
          </div>

          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
              SHIP TO:
            </span>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
              <strong>ANN&apos;S BOOKSTORE — INTAKE &amp; RETURNS</strong>
              <br />
              RMA: #{returnId}
              <br />
              1420 5th Avenue, Suite 1800
              <br />
              Seattle, WA 98101-2300
            </p>
          </div>
        </div>

        {/* Simulated Barcode */}
        <div
          style={{
            borderTop: '2px solid var(--ink)',
            borderBottom: '2px solid var(--ink)',
            padding: '24px 0',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          {/* Barcode lines */}
          <div
            style={{
              height: '70px',
              maxWidth: '380px',
              margin: '0 auto 8px',
              display: 'flex',
              alignItems: 'stretch',
              justifyContent: 'center',
              gap: '2px',
            }}
          >
            {[
              3, 1, 4, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 4, 1, 2, 1, 4,
              2, 3, 1, 2, 4, 1, 3, 1, 2, 4, 1, 3,
            ].map((width, i) => (
              <div
                key={i}
                style={{
                  width: `${width * 2}px`,
                  background: i % 2 === 0 ? 'var(--ink)' : 'transparent',
                }}
              />
            ))}
          </div>
          <span style={{ fontFamily: 'monospace', fontSize: '14px', letterSpacing: '0.2em', fontWeight: 700 }}>
            420 98101 9202 0901 0200 4819 02
          </span>
        </div>

        {/* Instructions */}
        <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
          <strong>Instructions for Return:</strong>
          <ol style={{ margin: '6px 0 0', paddingLeft: '18px' }}>
            <li>Carefully pack the book(s) in their original protective packaging or an archival mailer.</li>
            <li>Fold this sheet and attach the label securely to the outside of the parcel using clear tape.</li>
            <li>Drop off the package at any US Postal Service location or hand to your mail carrier.</li>
            <li>Refunds will be credited to your original payment method within 3 business days of receipt.</li>
          </ol>
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
          #label-sheet {
            box-shadow: none !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
