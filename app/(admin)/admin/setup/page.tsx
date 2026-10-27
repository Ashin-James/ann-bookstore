'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Key, Lock, Mail, User, AlertCircle, Copy, Check } from 'lucide-react';

export default function AdminSetupPage() {
  const router = useRouter();

  const [setupSecret, setSetupSecret] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'recovery'>('form');

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setup',
          setupSecret,
          email,
          fullName,
          password,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error?.message || 'Setup verification failed.');
        setLoading(false);
        return;
      }

      setRecoveryCodes(data.data.recoveryCodes || []);
      setTotpSecret(data.data.totpSecret || null);
      setStep('recovery');
    } catch {
      setError('An error occurred during system setup.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 3000);
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
          maxWidth: '520px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          padding: '36px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: '#FFF1F2',
              color: '#722638',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <ShieldCheck size={28} aria-hidden="true" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 700, margin: '0 0 6px', color: '#111827' }}>
            Initialize Store Owner
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
            One-time secure onboarding to create the initial root owner of Ann’s Bookstore.
          </p>
        </div>

        {error && (
          <div
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

        {step === 'form' ? (
          <form onSubmit={handleSetup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="setup-secret" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Setup Secret Key
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Key size={18} style={{ position: 'absolute', left: '12px', color: '#9CA3AF' }} aria-hidden="true" />
                <input
                  id="setup-secret"
                  type="password"
                  required
                  value={setupSecret}
                  onChange={(e) => setSetupSecret(e.target.value)}
                  placeholder="Paste SETUP_SECRET from environment"
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
              <label htmlFor="owner-name" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', color: '#9CA3AF' }} aria-hidden="true" />
                <input
                  id="owner-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ann"
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
              <label htmlFor="owner-email" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', color: '#9CA3AF' }} aria-hidden="true" />
                <input
                  id="owner-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@annsbookstore.com"
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
              <label htmlFor="owner-password" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Root Password (Min 12 Characters)
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', color: '#9CA3AF' }} aria-hidden="true" />
                <input
                  id="owner-password"
                  type="password"
                  required
                  minLength={12}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 12 characters"
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

            <button
              type="submit"
              disabled={loading}
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
                marginTop: '10px',
              }}
            >
              {loading ? 'Initializing...' : 'Create Owner Account'}
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#FEF3C7', padding: '14px', borderRadius: '8px', border: '1px solid #FCD34D' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#92400E', display: 'block', marginBottom: '4px' }}>
                Save Your 10 Backup Recovery Codes & Authenticator Secret:
              </span>
              <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#B45309' }}>
                Each code can be used once if you lose access to your authenticator app. Store them securely.
              </p>
              {totpSecret && (
                <div style={{ fontSize: '13px', color: '#78350F' }}>
                  Authenticator Secret: <code style={{ fontWeight: 700, backgroundColor: '#FDE68A', padding: '2px 6px', borderRadius: '4px' }}>{totpSecret}</code>
                </div>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                backgroundColor: '#F9FAFB',
                padding: '16px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '14px',
                border: '1px solid #E5E7EB',
              }}
            >
              {recoveryCodes.map((code, idx) => (
                <div key={idx} style={{ padding: '4px 8px', color: '#111827' }}>
                  {idx + 1}. <strong>{code}</strong>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  flex: 1,
                  minHeight: '44px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {copiedCodes ? <Check size={18} color="#059669" /> : <Copy size={18} />}
                {copiedCodes ? 'Copied Codes!' : 'Copy All Codes'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                style={{
                  flex: 1,
                  minHeight: '44px',
                  backgroundColor: '#722638',
                  color: '#FFFFFF',
                  border: 0,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Enter Console →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
