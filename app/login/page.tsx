'use client';

import { useState, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import Container from '@/components/container';
import Section from '@/components/section';
import { ArrowRight, UserCheck, Shield, CheckCircle } from 'lucide-react';

function LoginForm() {
  const { user, login } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get('next') || '/account';
  const nextUrl = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/account';

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('reader.eleanor@example.com');
  const [password, setPassword] = useState('Monsoon@2026!');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isPending, startTransition] = useTransition();

  // If already logged in, redirect
  if (user) {
    router.replace(nextUrl);
    return null;
  }

  const handleDemoSignIn = () => {
    startTransition(() => {
      login('reader.eleanor@example.com', 'Eleanor Vance');
      window.location.href = nextUrl;
    });
  };

  const handleCustomAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !email.includes('@')) {
      setError(t('errorInvalidEmail') || 'Please enter a valid email address');
      return;
    }

    if (mode === 'forgot') {
      setSuccessMsg(`A password reset link has been dispatched to ${email}. (Demo link simulated)`);
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const displayName = mode === 'signup' && name ? name : email.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

    startTransition(() => {
      login(email, formattedName);
      window.location.href = nextUrl;
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
              {mode === 'signup' ? 'Create Reader Account' : mode === 'forgot' ? 'Reset Password' : 'Sign In'}
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '15px', margin: 0 }}>
              {mode === 'signup'
                ? 'Join our community of readers and track your orders.'
                : mode === 'forgot'
                ? 'Enter your email to receive an instant recovery link.'
                : 'Access your reader orders, addresses, and saved folios.'}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                background: 'rgba(114, 38, 56, 0.08)',
                border: '1px solid var(--wine)',
                color: 'var(--wine)',
                padding: '12px 16px',
                borderRadius: '4px',
                fontSize: '14px',
                marginBottom: '20px',
              }}
            >
              {error}
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                padding: '12px 16px',
                borderRadius: '4px',
                fontSize: '14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle size={18} aria-hidden="true" />
              <span>{successMsg}</span>
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
                  gap: '10px',
                  border: '1px solid transparent',
                  cursor: 'pointer',
                  marginBottom: '24px',
                  boxShadow: 'var(--shadow-contact)',
                }}
              >
                <UserCheck size={18} aria-hidden="true" />
                <span>Sign in as Eleanor Vance (Demo)</span>
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'var(--muted)',
                  fontSize: '14px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
                <span>or continue with email</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleCustomAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'signup' && (
              <div>
                <label
                  htmlFor="signup-name"
                  style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}
                >
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Eleanor Vance"
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '12px 14px',
                    borderRadius: '4px',
                    border: '1px solid var(--line)',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    fontSize: '14px',
                  }}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="login-email"
                style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reader@example.com"
                style={{
                  width: '100%',
                  minHeight: '44px',
                  padding: '12px 14px',
                  borderRadius: '4px',
                  border: '1px solid var(--line)',
                  background: 'var(--paper)',
                  color: 'var(--ink)',
                  fontSize: '14px',
                }}
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label
                    htmlFor="login-password"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      style={{
                        border: 0,
                        background: 'transparent',
                        color: 'var(--wine)',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '12px 14px',
                    borderRadius: '4px',
                    border: '1px solid var(--line)',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    fontSize: '14px',
                  }}
                />
              </div>
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
                  : mode === 'signup'
                  ? 'Create Account'
                  : mode === 'forgot'
                  ? 'Send Reset Link'
                  : 'Sign In'}
              </span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </form>

          {/* Mode switch links */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            {mode === 'login' ? (
              <button
                type="button"
                onClick={() => setMode('signup')}
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
                New reader? Create an account →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode('login')}
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
