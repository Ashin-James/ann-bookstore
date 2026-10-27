import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        backgroundColor: '#FFFFFF',
        border: '1px dashed #D1D5DB',
        borderRadius: '8px',
        margin: '24px 0',
      }}
    >
      {Icon && (
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#F3F4F6',
            color: '#6B7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <Icon size={24} aria-hidden="true" />
        </div>
      )}
      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '14px', color: '#6B7280', maxWidth: '380px', margin: '0 0 20px', lineHeight: 1.5 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            minHeight: '44px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 600,
            borderRadius: '6px',
            backgroundColor: 'var(--wine, #722638)',
            color: '#FFFFFF',
            border: 0,
            cursor: 'pointer',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
