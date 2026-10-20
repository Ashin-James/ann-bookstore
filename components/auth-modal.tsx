'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Lock, UserCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login } = useAuth();
  const [email, setEmail] = useState('reader.eleanor@example.com');
  const [name, setName] = useState('Eleanor Vance');
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isAuthModalOpen) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      // Focus first input
      const timer = setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeAuthModal();
        }

        // Trap focus
        if (e.key === 'Tab' && modalRef.current) {
          const focusables = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      triggerRef.current?.focus();
    }
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, name);
  };

  return (
    <div
      onClick={closeAuthModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)',
        backgroundColor: 'rgba(20, 18, 15, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--paper)',
          borderRadius: '12px',
          border: '1px solid var(--line)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.24)',
          padding: '28px',
          position: 'relative',
        }}
      >
        <button
          onClick={closeAuthModal}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            border: 0,
            background: 'transparent',
            minWidth: '44px',
            minHeight: '44px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--muted)',
          }}
          aria-label="Close login modal"
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(126, 51, 70, 0.1)',
              color: 'var(--wine)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <Lock size={22} aria-hidden="true" />
          </div>
          <h2
            id="auth-modal-title"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '26px',
              margin: '0 0 8px',
              color: 'var(--ink)',
            }}
          >
            Reader Account
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
            Sign in to access your order receipts and saved addresses.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              htmlFor="auth-fullname"
              style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: 'var(--ink)' }}
            >
              Full name
            </label>
            <input
              id="auth-fullname"
              ref={firstInputRef}
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '6px',
                border: '1px solid var(--line)',
                background: 'var(--white)',
                fontSize: '16px',
                color: 'var(--ink)',
                outline: 'none',
                minHeight: '44px',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="auth-email"
              style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: 'var(--ink)' }}
            >
              Email address
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '6px',
                border: '1px solid var(--line)',
                background: 'var(--white)',
                fontSize: '16px',
                color: 'var(--ink)',
                outline: 'none',
                minHeight: '44px',
              }}
            />
          </div>

          <button
            type="submit"
            className="button button-dark"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              minHeight: '48px',
              marginTop: '8px',
              fontSize: '14px',
              width: '100%',
            }}
          >
            <span>Sign In to Bookstore</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--line)', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => login('reader.eleanor@example.com', 'Eleanor Vance')}
            style={{
              background: 'transparent',
              border: '1px dashed var(--wine)',
              color: 'var(--wine)',
              padding: '10px 16px',
              minHeight: '44px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <UserCheck size={16} aria-hidden="true" /> Quick Demo Login as Eleanor
          </button>
        </div>
      </div>
    </div>
  );
}
