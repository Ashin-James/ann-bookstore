'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, X, RotateCcw } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  onUndo?: () => void;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  if (!toast) return null;

  return (
    <aside
      aria-label="Notification message"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        backgroundColor: '#1F2937',
        color: '#FFFFFF',
        borderRadius: '8px',
        padding: '14px 18px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '420px',
      }}
    >
      {toast.type === 'success' && <CheckCircle2 size={20} color="#34D399" aria-hidden="true" />}
      {toast.type === 'error' && <AlertCircle size={20} color="#F87171" aria-hidden="true" />}

      <span style={{ fontSize: '14px', lineHeight: 1.4, flex: 1 }}>
        {toast.message}
      </span>

      {toast.onUndo && (
        <button
          onClick={() => {
            toast.onUndo?.();
            onDismiss();
          }}
          style={{
            border: 0,
            background: 'transparent',
            color: '#FBBF24',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            minHeight: '44px',
            padding: '0 8px',
          }}
        >
          <RotateCcw size={14} aria-hidden="true" />
          Undo
        </button>
      )}

      <button
        onClick={onDismiss}
        style={{
          border: 0,
          background: 'transparent',
          color: '#9CA3AF',
          cursor: 'pointer',
          minHeight: '44px',
          minWidth: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Dismiss notification"
      >
        <X size={18} aria-hidden="true" />
      </button>
    </aside>
  );
}
