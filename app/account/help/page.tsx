'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { accountService } from '@/lib/account/service';
import AccountLayout from '@/components/account/account-layout';
import { useToast } from '@/components/account/account-toast';
import {
  HelpCircle,
  Search,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Package,
  RotateCcw,
} from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'How long does archival packing and dispatch take?',
    a: 'Each edition is individually inspected and wrapped in acid-free tissue paper before being encased in heavy archival kraft mailers. Orders are prepared within 24 to 48 business hours and dispatched via USPS Priority Mail or courier.',
  },
  {
    q: 'What is your returns and refund policy?',
    a: 'We accept returns on books within 30 days of receipt. Books must be returned in their original condition. Once received at our Seattle workshop, refunds are issued back to your original payment method within 3 business days.',
  },
  {
    q: 'How do I cancel or modify an existing order?',
    a: 'You can cancel any order directly from Your Orders or Order Details page as long as it has not yet reached "Dispatched" status. Once dispatched, an order cannot be cancelled, but you may initiate a return upon arrival.',
  },
  {
    q: 'Can I request a rare or out-of-print title?',
    a: 'Yes. Our literary concierge maintains relationships with antiquarian scouts across the globe. You can send us a message with the desired author, edition, or publication year.',
  },
  {
    q: 'How does demo payment work in this portal?',
    a: 'This demonstration environment operates in strict zero-credential mode with simulated test cards (Visa, Mastercard, Amex, Discover). No real cards or sensitive banking records are processed or retained.',
  },
];

export default function CustomerServicePage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Track an order box
  const [trackOrderInput, setTrackOrderInput] = useState('');
  const [trackResult, setTrackResult] = useState<{ found: boolean; id?: string; message?: string } | null>(null);

  // Contact form
  const [subject, setSubject] = useState('Order inquiry');
  const [orderNumberRef, setOrderNumberRef] = useState('');
  const [message, setMessage] = useState('');
  const [submittingContact, setSubmittingContact] = useState(false);
  const [ticketCreated, setTicketCreated] = useState<string | null>(null);

  // Accordion state
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !trackOrderInput.trim()) return;

    const cleaned = trackOrderInput.trim().toUpperCase();
    const orders = await accountService.getOrders(user.id);
    const match = orders.find(
      (o) =>
        o.orderNumber.toUpperCase() === cleaned ||
        o.id === cleaned ||
        (o.trackingNumber && o.trackingNumber.toUpperCase() === cleaned)
    );

    if (match) {
      setTrackResult({ found: true, id: match.id, message: `Found order #${match.orderNumber} (${match.status})` });
    } else {
      setTrackResult({
        found: false,
        message: `No order or shipment matching "${trackOrderInput.trim()}" was found in your account records.`,
      });
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast('Please provide a message for your inquiry', { type: 'error' });
      return;
    }

    setSubmittingContact(true);
    setTimeout(() => {
      const ticketNum = `TIC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      setTicketCreated(ticketNum);
      setSubmittingContact(false);
      setMessage('');
      setOrderNumberRef('');
      showToast(`Support ticket ${ticketNum} opened`, { type: 'success' });
    }, 400);
  };

  return (
    <AccountLayout
      breadcrumbs={[{ label: 'Customer Service' }]}
      title="Customer Service & Help"
      description="Track shipments, find answers to common queries, or reach our reader concierge team."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Track An Order Quick Box */}
        <section
          style={{
            background: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '24px',
          }}
          aria-labelledby="track-order-heading"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Package size={20} color="var(--wine)" aria-hidden="true" />
            <h2 id="track-order-heading" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0, color: 'var(--ink)' }}>
              Track an Order
            </h2>
          </div>
          <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--muted)' }}>
            Enter your order reference (e.g. ANN-2026-00412) or USPS tracking number to view real-time status.
          </p>

          <form onSubmit={handleTrackOrder} style={{ display: 'flex', gap: '10px', maxWidth: '520px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={trackOrderInput}
              onChange={(e) => {
                setTrackOrderInput(e.target.value);
                setTrackResult(null);
              }}
              placeholder="e.g. ANN-2026-00412"
              style={{
                flex: 1,
                minWidth: '220px',
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid var(--line)',
                background: 'var(--paper)',
                color: 'var(--ink)',
                fontSize: '15px',
              }}
            />
            <button
              type="submit"
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
                minHeight: '44px',
              }}
            >
              <Search size={15} />
              <span>Track</span>
            </button>
          </form>

          {trackResult && (
            <div
              style={{
                marginTop: '16px',
                padding: '14px 16px',
                borderRadius: '6px',
                background: trackResult.found ? 'rgba(114, 38, 56, 0.08)' : 'var(--paper)',
                border: trackResult.found ? '1px solid var(--wine)' : '1px solid var(--line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '14px', color: trackResult.found ? 'var(--wine)' : 'var(--ink)' }}>
                {trackResult.message}
              </span>
              {trackResult.found && trackResult.id && (
                <Link
                  href={`/account/orders/${trackResult.id}`}
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--wine)',
                    textDecoration: 'underline',
                  }}
                >
                  View Order Details &rarr;
                </Link>
              )}
            </div>
          )}
        </section>

        {/* Helpful Links Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <Link
            href="/shipping-returns"
            style={{
              background: 'var(--white)',
              border: '1px solid var(--line)',
              borderRadius: '8px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              textDecoration: 'none',
              color: 'var(--ink)',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--paper)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--wine)',
              }}
            >
              <Package size={20} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '15px' }}>Shipping Guidelines</strong>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Carriers, rates &amp; packaging</span>
            </div>
          </Link>

          <Link
            href="/account/returns"
            style={{
              background: 'var(--white)',
              border: '1px solid var(--line)',
              borderRadius: '8px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              textDecoration: 'none',
              color: 'var(--ink)',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--paper)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--wine)',
              }}
            >
              <RotateCcw size={20} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '15px' }}>Returns &amp; Authorisations</strong>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Print labels &amp; check status</span>
            </div>
          </Link>
        </div>

        {/* FAQ Accordion */}
        <section
          style={{
            background: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '24px',
          }}
          aria-labelledby="faq-section-heading"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <HelpCircle size={20} color="var(--wine)" aria-hidden="true" />
            <h2 id="faq-section-heading" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0, color: 'var(--ink)' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQS.map((faq, idx) => {
              const isOpen = expandedFaqIndex === idx;
              return (
                <div
                  key={idx}
                  style={{
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaqIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      background: isOpen ? 'var(--paper)' : 'transparent',
                      border: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: 600,
                      fontSize: '15px',
                      color: 'var(--ink)',
                      minHeight: '48px',
                    }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} color="var(--wine)" /> : <ChevronDown size={18} color="var(--muted)" />}
                  </button>
                  {isOpen && (
                    <div style={{ padding: '16px 20px', background: 'var(--white)', fontSize: '14px', lineHeight: 1.6, color: 'var(--muted)' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact Form */}
        <section
          style={{
            background: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '28px',
          }}
          aria-labelledby="contact-form-heading"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <MessageSquare size={20} color="var(--wine)" aria-hidden="true" />
            <h2 id="contact-form-heading" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0, color: 'var(--ink)' }}>
              Contact Our Reader Concierge
            </h2>
          </div>
          <p style={{ margin: '0 0 20px', fontSize: '14px', color: 'var(--muted)', maxWidth: '640px' }}>
            Have a question about a rare edition, binding condition, or custom book search? We answer every reader
            dispatch personally.
          </p>

          {ticketCreated ? (
            <div
              style={{
                background: 'rgba(114, 38, 56, 0.08)',
                border: '1px solid var(--wine)',
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'center',
              }}
            >
              <CheckCircle2 size={36} color="var(--wine)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: '0 0 8px', color: 'var(--ink)' }}>
                Message Received!
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--muted)' }}>
                Your inquiry has been assigned support ticket{' '}
                <strong style={{ color: 'var(--wine)' }}>#{ticketCreated}</strong>. A bookseller from our team will
                respond to <strong style={{ color: 'var(--ink)' }}>{user?.email}</strong> within 1 business day.
              </p>
              <button
                type="button"
                onClick={() => setTicketCreated(null)}
                style={{
                  padding: '8px 18px',
                  background: 'var(--wine)',
                  color: 'var(--white)',
                  border: 0,
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '38px',
                }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} style={{ maxWidth: '580px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label htmlFor="inquiry-subject" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Topic / Subject *
                </label>
                <select
                  id="inquiry-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--line)',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    fontSize: '15px',
                  }}
                >
                  <option value="Order inquiry">Order inquiry / Shipment tracking</option>
                  <option value="Return or exchange">Return or exchange request</option>
                  <option value="Book condition or binding">Book condition or binding detail</option>
                  <option value="Rare book search">Rare book acquisition request</option>
                  <option value="General reader question">General reader question</option>
                </select>
              </div>

              <div>
                <label htmlFor="order-number-ref" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Order Number (optional)
                </label>
                <input
                  id="order-number-ref"
                  type="text"
                  placeholder="e.g. ANN-2026-00412"
                  value={orderNumberRef}
                  onChange={(e) => setOrderNumberRef(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--line)',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    fontSize: '15px',
                  }}
                />
              </div>

              <div>
                <label htmlFor="inquiry-message" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Message *
                </label>
                <textarea
                  id="inquiry-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How may our booksellers assist you today?"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--line)',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    fontSize: '14px',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingContact || !message.trim()}
                style={{
                  alignSelf: 'flex-start',
                  padding: '12px 24px',
                  background: 'var(--wine)',
                  color: 'var(--white)',
                  border: 0,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: submittingContact || !message.trim() ? 'not-allowed' : 'pointer',
                  opacity: message.trim() ? 1 : 0.6,
                  minHeight: '44px',
                }}
              >
                {submittingContact ? 'Submitting...' : 'Send Inquiry'}
              </button>
            </form>
          )}
        </section>
      </div>
    </AccountLayout>
  );
}
