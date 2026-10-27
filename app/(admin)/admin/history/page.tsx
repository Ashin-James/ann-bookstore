'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, Laptop, LogOut, CheckCircle } from 'lucide-react';

export default function AdminHistoryPage() {
  const router = useRouter();
  const [revoked, setRevoked] = useState(false);

  const handleSignOutEverywhere = async () => {
    if (!confirm('This will invalidate all active sessions across all devices for this account. Continue?')) return;
    try {
      await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      setRevoked(true);
      setTimeout(() => router.push('/admin/login'), 1500);
    } catch {
      router.push('/admin/login');
    }
  };

  const sampleSessions = [
    {
      id: 'sess_cur',
      device: 'Desktop Browser (Chrome / Windows)',
      ipHash: 'demo_localhost',
      loggedInAt: 'October 27, 2026, 11:15 AM',
      isCurrent: true,
      icon: Laptop,
    },
    {
      id: 'sess_prev',
      device: 'Mobile Studio Tablet (Safari / iPadOS)',
      ipHash: '9a4f21b7c8e3...',
      loggedInAt: 'October 26, 2026, 04:30 PM',
      isCurrent: false,
      icon: Smartphone,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', margin: '0 0 6px', color: '#111827' }}>
            Active Sessions & Login History
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
            Inspect active console tokens, salted IP locations, and revoke sessions server-side.
          </p>
        </div>

        <button
          onClick={handleSignOutEverywhere}
          style={{
            minHeight: '44px',
            padding: '10px 18px',
            backgroundColor: '#991B1B',
            color: '#FFFFFF',
            border: 0,
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <LogOut size={18} aria-hidden="true" />
          Sign Out Everywhere
        </button>
      </div>

      {revoked && (
        <div
          role="status"
          style={{
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            borderRadius: '8px',
            padding: '14px 18px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <CheckCircle size={20} aria-hidden="true" />
          <span>All sessions invalidated successfully. Redirecting to login...</span>
        </div>
      )}

      {/* Sessions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sampleSessions.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    backgroundColor: s.isCurrent ? '#FFF1F2' : '#F3F4F6',
                    color: s.isCurrent ? '#722638' : '#6B7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={22} aria-hidden="true" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>
                      {s.device}
                    </span>
                    {s.isCurrent && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: '#ECFDF5',
                          color: '#065F46',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                        }}
                      >
                        Current Session
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
                    Salted IP: <code style={{ color: '#374151' }}>{s.ipHash}</code> · Signed in {s.loggedInAt}
                  </div>
                </div>
              </div>

              {!s.isCurrent && (
                <button
                  onClick={handleSignOutEverywhere}
                  style={{
                    border: '1px solid #D1D5DB',
                    background: '#FFFFFF',
                    color: '#6B7280',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    padding: '8px 14px',
                    minHeight: '44px',
                    cursor: 'pointer',
                  }}
                >
                  Revoke
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
