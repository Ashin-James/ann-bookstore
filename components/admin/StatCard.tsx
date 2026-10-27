import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtext?: string;
  isDemoEstimate?: boolean;
}

export function StatCard({
  label,
  value,
  change,
  changeType = 'neutral',
  subtext,
  isDemoEstimate,
}: StatCardProps) {
  const changeColors = {
    positive: '#065f46',
    negative: '#991b1b',
    neutral: '#4b5563',
  };

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        padding: '20px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </span>
        {isDemoEstimate && (
          <span
            title="Demo estimate: replace with real costs"
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#86198f',
              backgroundColor: '#fdf4ff',
              border: '1px solid #f5d0fe',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            Demo estimate
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
        <span
          style={{
            fontSize: '28px',
            fontWeight: 700,
            fontFamily: 'var(--font-serif)',
            color: 'var(--ink, #1F2937)',
            lineHeight: 1.2,
          }}
        >
          {value}
        </span>
        {change && (
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: changeColors[changeType],
            }}
          >
            {change}
          </span>
        )}
      </div>

      {subtext && (
        <span style={{ fontSize: '14px', color: '#6B7280' }}>
          {subtext}
        </span>
      )}
    </div>
  );
}
