import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'demo' | 'neutral';

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  isDemoEstimate?: boolean;
}

export function StatusBadge({ status, variant, isDemoEstimate }: StatusBadgeProps) {
  let computedVariant: BadgeVariant = variant || 'neutral';

  const s = status.toLowerCase();
  if (!variant) {
    if (s.includes('delivered') || s.includes('paid') || s.includes('active') || s.includes('approved')) {
      computedVariant = 'success';
    } else if (s.includes('shipped') || s.includes('dispatched') || s.includes('pending')) {
      computedVariant = 'warning';
    } else if (s.includes('cancelled') || s.includes('refunded') || s.includes('rejected') || s.includes('disabled')) {
      computedVariant = 'error';
    } else if (s.includes('packed') || s.includes('processing')) {
      computedVariant = 'info';
    }
  }

  const colorStyles: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
    success: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
    warning: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
    error: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
    info: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
    demo: { bg: '#fdf4ff', text: '#86198f', border: '#f5d0fe' },
    neutral: { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' },
  };

  const style = colorStyles[computedVariant];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '9999px',
        fontSize: '14px',
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: style.text,
        }}
        aria-hidden="true"
      />
      {status}
      {isDemoEstimate && (
        <span
          title="Demo estimate: replace with real costs"
          style={{
            marginLeft: '4px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#701a75',
            backgroundColor: '#fae8ff',
            padding: '2px 6px',
            borderRadius: '4px',
          }}
        >
          Demo estimate
        </span>
      )}
    </span>
  );
}
