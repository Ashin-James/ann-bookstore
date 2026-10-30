'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Mail, Shield, KeyRound, AlertCircle, Sparkles } from 'lucide-react';

export default function AdminLoginPage() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [step, setStep] = useState<'credentials' | 'totp'>('credentials');
  const [tempToken, setTempToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDemoUnsetNote, setShowDemoUnsetNote] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {    setMounted(true);    async function checkConfig() {
      try {
        const res = await fetch('/api/admin/auth?action=config');
        const json = await res.json();
        if (json.success && json.data?.isDemoMode && !json.data?.demoConfigured) {
          setShowDemoUnsetNote(true);
        }
      } catch {
        // Silently ignore network probe errors
      }
    }
    checkConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (step === 'credentials') {
        const res = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', email, password }),
        });
        const data = await res.json();

        if (!data.success) {
          setError(data.error?.message || 'Invalid email or password.');
          setLoading(false);
          return;
        }

        if (data.data.requireTotp) {
          setTempToken(data.data.tempToken || '');
          setStep('totp');
          setLoading(false);
          return;
        }

        // Successfully authenticated!
        window.location.href = '/admin/dashboard';
      } else {
        // Step TOTP or Recovery Code
        const payload = useRecoveryCode
          ? { action: 'verify_recovery_code', tempToken, recoveryCode }
          : { action: 'verify_totp', tempToken, totpCode };

        const res = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (!data.success) {
          setError(data.error?.message || 'Invalid verification code.');
          setLoading(false);
          return;
        }

        window.location.href = '/admin/dashboard';
      }
    } catch {
      setError('An error occurred during authentication. Please retry.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: '#FDFBF7',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#FFF1F2',
              color: '#722638',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <Shield size={24} aria-hidden="true" />
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '26px',
              fontWeight: 700,
              color: '#111827',
              margin: '0 0 6px',
            }}
          >
            Staff Console
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
            {step === 'credentials'
              ? 'Enter your credentials to manage Ann’s Bookstore.'
              : 'Two-Factor Authentication is active.'}
          </p>
        </div>

        {/* Note shown only if env vars are unset in demo mode */}
        {showDemoUnsetNote && (
          <div
            style={{
              backgroundColor: '#FDF4FF',
              border: '1px solid #F5D0FE',
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#701A75',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            <Sparkles size={16} color="#86198F" aria-hidden="true" />
            <span>Demo admin</span>
          </div>
        )}

        {error && (
          <div
            id="admin-login-error"
            data-testid="admin-login-error"
            role="alert"
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#991B1B',
              fontSize: '14px',
            }}
          >
            <AlertCircle size={18} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {step === 'credentials' ? (
            <>
              <div>
                <label
                  htmlFor="admin-email"
                  style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}
                >
                  Email Address
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', color: '#9CA3AF' }} aria-hidden="true" />
                  <input
                    id="admin-email"
                    type="email"
                    required
                    disabled={!mounted}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@annsbookstore.com"
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      padding: '8px 12px 8px 40px',
                      fontSize: '14px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      color: '#111827',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}
                >
                  Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', color: '#9CA3AF' }} aria-hidden="true" />
                  <input
                    id="admin-password"
                    type="password"
                    required
                    disabled={!mounted}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      padding: '8px 12px 8px 40px',
                      fontSize: '14px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      color: '#111827',
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {!useRecoveryCode ? (
                <div>
                  <label
                    htmlFor="totp-code"
                    style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}
                  >
                    6-Digit Authenticator Code
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <KeyRound size={18} style={{ position: 'absolute', left: '12px', color: '#9CA3AF' }} aria-hidden="true" />
                    <input
                      id="totp-code"
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      style={{
                        width: '100%',
                        minHeight: '44px',
                        padding: '8px 12px 8px 40px',
                        fontSize: '16px',
                        letterSpacing: '0.2em',
                        textAlign: 'center',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        color: '#111827',
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="recovery-code"
                    style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}
                  >
                    Backup Recovery Code (8 Chars)
                  </label>
                  <input
                    id="recovery-code"
                    type="text"
                    required
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                    placeholder="A1B2C3D4"
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      padding: '8px 12px',
                      fontSize: '16px',
                      letterSpacing: '0.15em',
                      textAlign: 'center',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      color: '#111827',
                    }}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => setUseRecoveryCode((prev) => !prev)}
                style={{
                  border: 0,
                  background: 'transparent',
                  color: '#722638',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: 0,
                  minHeight: '44px',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                {useRecoveryCode ? 'Use 6-digit TOTP code instead' : 'Lost device? Use a backup recovery code'}
              </button>
            </>
          )}

          <button
            type="submit"
            disabled={!mounted || loading}
            style={{
              minHeight: '44px',
              padding: '12px',
              backgroundColor: '#722638',
              color: '#FFFFFF',
              border: 0,
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.8 : 1,
              marginTop: '6px',
            }}
          >
            {loading ? 'Authenticating...' : step === 'credentials' ? 'Sign In to Console' : 'Verify Code'}
          </button>
        </form>
      </div>
    </div>
  );
}
