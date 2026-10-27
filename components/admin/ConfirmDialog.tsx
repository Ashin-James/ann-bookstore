'use client';

import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  requireMatchString?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  requireMatchString,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [inputVal, setInputVal] = useState('');

  if (!isOpen) return null;

  const isMatchValid = !requireMatchString || inputVal.trim() === requireMatchString.trim();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '460px',
          padding: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#FEE2E2',
                color: '#991B1B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={20} aria-hidden="true" />
            </div>
            <h2 id="confirm-dialog-title" style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#111827' }}>
              {title}
            </h2>
          </div>
          <button
            onClick={onCancel}
            style={{
              border: 0,
              background: 'transparent',
              cursor: 'pointer',
              minHeight: '44px',
              minWidth: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6B7280',
            }}
            aria-label="Close dialog"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <p style={{ fontSize: '14px', color: '#4B5563', margin: 0, lineHeight: 1.5 }}>
          {description}
        </p>

        {requireMatchString && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="confirm-match-input" style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
              Type <strong style={{ color: '#111827' }}>{requireMatchString}</strong> to confirm:
            </label>
            <input
              id="confirm-match-input"
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={requireMatchString}
              style={{
                minHeight: '44px',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                color: '#111827',
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <button
            onClick={onCancel}
            style={{
              minHeight: '44px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              backgroundColor: '#FFFFFF',
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              if (isMatchValid) onConfirm();
            }}
            disabled={!isMatchValid}
            style={{
              minHeight: '44px',
              padding: '8px 18px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 0,
              backgroundColor: isMatchValid ? '#991B1B' : '#FCA5A5',
              color: '#FFFFFF',
              cursor: isMatchValid ? 'pointer' : 'not-allowed',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
