'use client';

import { useState, useTransition, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Container from '@/components/container';
import Section from '@/components/section';
import { ArrowRight, UserCheck, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import StaffLink from '@/components/staff-link';

function LoginForm() {
  const { user, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get('next') || '/account';
  const nextUrl = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/account';

  const initialMode = (searchParams.get('mode') as 'login' | 'forgot' | 'reset') || 'login';
  const resetTokenParam = searchParams.get('token') || '';

  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>(
    resetTokenParam ? 'reset' : initialMode
  );
  const [email, setEmail] = useState('reader.eleanor@example.com');
  const [password, setPassword] = useState('Monsoon@2026!');
  const [resetToken, setResetToken] = useState(resetTokenParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [demoResetLink, setDemoResetLink] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (resetTokenParam) {
      setMode('reset');
      setResetToken(resetTokenParam);
    }
  }, [resetTokenParam]);

  // If already logged in, redirect
  if (user && mode !== 'reset') {
    router.replace(nextUrl);
    return null;
  }

  const handleDemoSignIn = () => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/auth/customer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            email: 'reader.eleanor@example.com',
            password: 'Monsoon@2026!',
          }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          login(data.data.email, data.data.name, data.data.isVerified, data.data.id);
        } else {
          login('reader.eleanor@example.com', 'Eleanor Vance', true, 'usr_demo_01');
        }
        window.location.href = nextUrl;
      } catch {
        login('reader.eleanor@example.com', 'Eleanor Vance', true, 'usr_demo_01');
        window.location.href = nextUrl;
      }
    });
  };

  const handleCustomAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setDemoResetLink('');

    if (mode === 'forgot') {
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
      startTransition(async () => {
        try {
          const res = await fetch('/api/auth/customer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'forgot_password', email }),
          });
          const data = await res.json();
          if (data.success) {
            setSuccessMsg(data.message || 'Password reset link dispatched.');
            if (data.resetLink) {
              setDemoResetLink(data.resetLink);
            }
          } else {
            setError(data.error || 'Failed to dispatch reset link.');
          }
        } catch {
          setError('An error occurred. Please try again.');
        }
      });
      return;
    }

    if (mode === 'reset') {
      if (newPassword.length < 12) {
        setError('Password must be at least 12 characters');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError('Passwords do not match');
        return;
      }
      startTransition(async () => {
        try {
          const res = await fetch('/api/auth/customer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'reset_password',
              token: resetToken,
              password: newPassword,
              confirmPassword: confirmNewPassword,
            }),
          });
          const data = await res.json();
          if (data.success) {
            setSuccessMsg('Your password has been reset successfully! Please sign in.');
            setMode('login');
          } else {
            setError(data.error || 'Password reset link is invalid or expired.');
          }
        } catch {
          setError('Failed to reset password. Please try again.');
        }
      });
      return;
    }

    // Standard Login
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/auth/customer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', email, password }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || 'Invalid email or password');
          return;
        }

        login(data.data.email, data.data.name, data.data.isVerified, data.data.id);
        window.location.href = nextUrl;
      } catch {
        setError('Unable to sign in at this time. Please check your credentials.');
      }
    });
  };

  return (
    <Section className="login-page-section">
      <Container size="sm" style={{ maxWidth: '480px', margin: '40px auto' }}>
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '36px 32px',
            boxShadow: 'var(--shadow-ambient)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span className="eyebrow" style={{ color: 'var(--wine)', fontSize: '14px' }}>
              ANN&apos;S BOOKSTORE ATELIER
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '32px',
                margin: '8px 0',
                color: 'var(--ink)',
              }}
            >
              {mode === 'forgot'
                ? 'Reset Password'
                : mode === 'reset'
                ? 'Set New Password'
                : 'Sign In'}
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '15px', margin: 0 }}>
              {mode === 'forgot'
                ? 'Enter your email to receive an instant recovery link.'
                : mode === 'reset'
                ? 'Enter your new secure password (minimum 12 characters).'
                : 'Access your reader orders, addresses, and saved folios.'}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              data-testid="customer-login-error"
              style={{
                background: 'rgba(114, 38, 56, 0.08)',
                border: '1px solid var(--wine)',
                color: 'var(--wine)',
                padding: '12px 16px',
                borderRadius: '4px',
                fontSize: '14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={18} aria-hidden="true" style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              data-testid="customer-login-success"
              style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                padding: '14px 16px',
                borderRadius: '4px',
                fontSize: '14px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <CheckCircle size={18} aria-hidden="true" />
                <span>{successMsg}</span>
              </div>
              {demoResetLink && (
                <div
                  data-testid="demo-reset-link-banner"
                  style={{
                    marginTop: '10px',
                    padding: '10px',
                    background: '#fff',
                    borderRadius: '4px',
                    border: '1px dashed #059669',
                  }}
                >
                  <span style={{ fontSize: '12px', color: '#047857', display: 'block', marginBottom: '4px' }}>
                    Demo Mode: Single-use password reset link (expires in 1 hour)
                  </span>
                  <Link
                    href={demoResetLink}
                    data-testid="demo-reset-link"
                    style={{
                      color: 'var(--wine)',
                      fontWeight: 600,
                      fontSize: '14px',
                      textDecoration: 'underline',
                      minHeight: '44px',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    Click to Reset Password Now →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Quick Demo Sign In Button */}
          {mode === 'login' && (
            <>
              <button
                type="button"
                onClick={handleDemoSignIn}
                disabled={isPending}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  background: 'var(--ink)',
                  color: 'var(--paper)',
                  padding: '14px 20px',
                  borderRadius: '4px',
                  fontSize: '15px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  border: '0',
                  cursor: 'pointer',
                  marginBottom: '20px',
                  transition: 'background 0.2s ease',
                }}
              >
                <UserCheck size={18} aria-hidden="true" />
                <span>Sign in as Eleanor Vance (Demo)</span>
              </button>

              <div
                style={{
                  position: 'relative',
                  textAlign: 'center',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'var(--line)',
                  }}
                />
                <span
                  style={{
                    position: 'relative',
                    background: 'var(--white)',
                    padding: '0 12px',
                    fontSize: '13px',
                    color: 'var(--muted)',
                  }}
                >
                  or sign in with email
                </span>
              </div>
            </>
          )}

          <form onSubmit={handleCustomAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'reset' ? (
              <>
                <div>
                  <label
                    htmlFor="customer-new-password"
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '6px',
                      color: 'var(--ink)',
                    }}
                  >
                    New Password (minimum 12 characters)
                  </label>
                  <input
                    id="customer-new-password"
                    type="password"
                    required
                    minLength={12}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      padding: '10px 14px',
                      borderRadius: '4px',
                      border: '1px solid var(--line)',
                      fontSize: '14px',
                      background: 'var(--paper)',
                      color: 'var(--ink)',
                    }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="customer-confirm-password"
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '6px',
                      color: 'var(--ink)',
                    }}
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="customer-confirm-password"
                    type="password"
                    required
                    minLength={12}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      padding: '10px 14px',
                      borderRadius: '4px',
                      border: '1px solid var(--line)',
                      fontSize: '14px',
                      background: 'var(--paper)',
                      color: 'var(--ink)',
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label
                    htmlFor="customer-login-email"
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '6px',
                      color: 'var(--ink)',
                    }}
                  >
                    Email Address
                  </label>
                  <input
                    id="customer-login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="reader.eleanor@example.com"
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      padding: '10px 14px',
                      borderRadius: '4px',
                      border: '1px solid var(--line)',
                      fontSize: '14px',
                      background: 'var(--paper)',
                      color: 'var(--ink)',
                    }}
                  />
                </div>

                {mode === 'login' && (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px',
                      }}
                    >
                      <label
                        htmlFor="customer-login-password"
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--ink)',
                        }}
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setError('');
                          setSuccessMsg('');
                        }}
                        style={{
                          background: 'none',
                          border: 0,
                          padding: 0,
                          fontSize: '13px',
                          color: 'var(--wine)',
                          cursor: 'pointer',
                        }}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      id="customer-login-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      style={{
                        width: '100%',
                        minHeight: '44px',
                        padding: '10px 14px',
                        borderRadius: '4px',
                        border: '1px solid var(--line)',
                        fontSize: '14px',
                        background: 'var(--paper)',
                        color: 'var(--ink)',
                      }}
                    />
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={isPending}
              style={{
                width: '100%',
                minHeight: '44px',
                background: 'var(--wine)',
                color: '#fff',
                padding: '14px 20px',
                borderRadius: '4px',
                fontSize: '15px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: '0',
                cursor: 'pointer',
                marginTop: '8px',
              }}
            >
              <span>
                {isPending
                  ? 'Processing...'
                  : mode === 'forgot'
                  ? 'Send Reset Link'
                  : mode === 'reset'
                  ? 'Update Password'
                  : 'Sign In'}
              </span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </form>

          {/* Mode switch links */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            {mode === 'login' ? (
              <Link
                href="/register"
                style={{
                  color: 'var(--wine)',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  minHeight: '44px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '8px',
                }}
              >
                New reader? Create an account →
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccessMsg('');
                }}
                style={{
                  border: 0,
                  background: 'transparent',
                  color: 'var(--wine)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '44px',
                  padding: '8px',
                }}
              >
                ← Back to Sign In
              </button>
            )}
          </div>

          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--muted)',
              fontSize: '14px',
            }}
          >
            <Shield size={16} aria-hidden="true" />
            <span>Customer reader accounts are isolated from administration.</span>
          </div>

          <div
            style={{
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px dashed var(--line)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <StaffLink
              dataTestId="login-staff-link"
              className="login-staff-link"
              style={{ color: 'var(--muted)' }}
              hoverColor="var(--wine)"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
