'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Check, ArrowUpRight } from 'lucide-react';
import { money } from '@/src/config/site.config';
import Container from '@/components/container';
import Section from '@/components/section';

type Order = {
  ref: string;
  items: { title: string; format: string; quantity: number; total: number }[];
  subtotal: number;
  shipping: number;
  estimatedTax?: number;
  total: number;
  customer?: {
    fullName: string;
    city: string;
    state: string;
    zip: string;
  };
};

export default function Confirmation() {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('ann-demo-order');
      if (raw) setOrder(JSON.parse(raw));
    } catch {
      setOrder(null);
    }
  }, []);

  return (
    <Section padding="lg">
      <Container size="sm">
        <div className="confirmation-page">
          <div className="confirmation-icon">
            <Check size={28} />
          </div>
          <span className="eyebrow">DEMO ORDER CONFIRMATION</span>
          <h1>
            Thank you for<br />
            <em>being here.</em>
          </h1>

          {order ? (
            <>
              <p>
                Your sample order has been completed in this demo. No payment was taken and no real order was placed.
              </p>

              <div className="confirmation-card">
                <div className="confirmation-ref">
                  <span>DEMO REFERENCE</span>
                  <strong>{order.ref}</strong>
                </div>

                {order.customer && (
                  <div style={{ fontSize: '14px', color: 'var(--muted)', padding: '8px 0', borderBottom: '1px dashed var(--line)' }}>
                    Shipping to: <strong>{order.customer.fullName}</strong> ({order.customer.city}, {order.customer.state} {order.customer.zip})
                  </div>
                )}

                {order.items.map((x, i) => (
                  <div className="summary-row" key={i}>
                    <span>
                      {x.title} · {x.format} × {x.quantity}
                    </span>
                    <strong>{money(x.total)}</strong>
                  </div>
                ))}

                <div className="summary-row">
                  <span>Shipping</span>
                  <strong>{order.shipping === 0 ? 'Free' : money(order.shipping)}</strong>
                </div>

                {typeof order.estimatedTax === 'number' && (
                  <div className="summary-row">
                    <span>Estimated tax</span>
                    <strong>{money(order.estimatedTax)}</strong>
                  </div>
                )}

                <div className="summary-total">
                  <span>Demo total</span>
                  <strong>{money(order.total)}</strong>
                </div>
              </div>
            </>
          ) : (
            <p>No demo order was found in this browser session. You can return to the books and try the flow.</p>
          )}

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link className="button button-dark" href="/account/orders">
              View Your Orders in Account Hub <ArrowUpRight size={16} />
            </Link>
            <Link className="button button-outline" href="/books">
              Back to the bookshelf
            </Link>
          </div>
          <small>Sample confirmation only · No payment or shipment exists.</small>
        </div>
      </Container>
    </Section>
  );
}
