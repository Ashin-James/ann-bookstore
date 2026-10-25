'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  action?: ToastAction;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, options?: { type?: 'success' | 'error' | 'info'; action?: ToastAction; duration?: number }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, options?: { type?: 'success' | 'error' | 'info'; action?: ToastAction; duration?: number }) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const duration = options?.duration ?? 5000;
      const newToast: Toast = {
        id,
        message,
        type: options?.type ?? 'success',
        action: options?.action,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Render Container */}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 'var(--z-toast, 60)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '420px',
          width: 'calc(100% - 48px)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            style={{
              background: 'var(--ink, #141211)',
              color: 'var(--paper, #FAF7F2)',
              padding: '14px 18px',
              borderRadius: '6px',
              boxShadow: '0 12px 28px -4px rgba(20, 18, 17, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              pointerEvents: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              animation: 'toastSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
              {toast.type === 'error' ? (
                <AlertCircle size={18} color="#E06C75" aria-hidden="true" style={{ flexShrink: 0 }} />
              ) : toast.type === 'info' ? (
                <Info size={18} color="var(--gold-foil, #C29B62)" aria-hidden="true" style={{ flexShrink: 0 }} />
              ) : (
                <CheckCircle2 size={18} color="#98C379" aria-hidden="true" style={{ flexShrink: 0 }} />
              )}
              <span style={{ fontSize: '14px', lineHeight: 1.4, wordBreak: 'break-word' }}>
                {toast.message}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.onClick();
                    removeToast(toast.id);
                  }}
                  style={{
                    background: 'var(--gold-foil, #C29B62)',
                    color: 'var(--ink, #141211)',
                    border: 0,
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {toast.action.label}
                </button>
              )}
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
                style={{
                  background: 'transparent',
                  border: 0,
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (msg: string) => console.log('[Toast]', msg),
    };
  }
  return context;
}
