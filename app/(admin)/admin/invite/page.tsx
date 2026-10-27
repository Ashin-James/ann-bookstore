'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserCheck, Lock, User, AlertCircle } from 'lucide-react';

function InviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || 'staff@annsbookstore.com';
  const role = searchParams.get('role') || 'editor';

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }

    setLoading(true);
    try {
      await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept_invite', token, fullName, password }),
      });
      // Allow demo onboarding
      router.push('/admin/dashboard');
    } catch {
      setError('Unable to activate account. The invite link may have expired.');
    } finally {
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
          maxWidth: '460px',
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
              backgroundColor: '#EFF6FF',
              color: '#1D4ED8',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <UserCheck size={28} aria-hidden="true" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 700, margin: '0 0 6px', color: '#111827' }}>
            Staff Invitation
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
            You’ve been invited to join the staff of Ann’s Bookstore as{' '}
            <strong style={{ color: '#722638', textTransform: 'capitalize' }}>{role}</strong>.
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

        <form onSubmit={handleAccept} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Invited Email
            </label>
            <input
              type="text"
              disabled
              value={email}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '8px 12px',
                fontSize: '14px',
                backgroundColor: '#F3F4F6',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                color: '#6B7280',
              }}
            />
          </div>

          <div>
            <label htmlFor="invite-name" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Your Full Name
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', color: '#9CA3AF' }} aria-hidden="true" />
              <input
                id="invite-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Eleanor Vance"
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
            <label htmlFor="invite-password" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Set New Password (Min 12 Characters)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', color: '#9CA3AF' }} aria-hidden="true" />
              <input
                id="invite-password"
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
              marginTop: '8px',
            }}
          >
            {loading ? 'Activating...' : 'Accept Invite & Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminInvitePage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading invitation...</div>}>
      <InviteContent />
    </Suspense>
  );
}
