'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  BookOpen,
  Tag,
  Users,
  MessageSquare,
  Mail,
  ShieldCheck,
  History,
  Menu,
  X,
  Search,
  LogOut,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { AdminRole, AdminUser } from '@/lib/admin/types';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  roles: AdminRole[];
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, roles: ['owner', 'admin', 'editor', 'support'] },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag, roles: ['owner', 'admin', 'support'] },
  { name: 'Books & Variants', href: '/admin/books', icon: BookOpen, roles: ['owner', 'admin', 'editor', 'support'] },
  { name: 'Coupons', href: '/admin/coupons', icon: Tag, roles: ['owner', 'admin'] },
  { name: 'Customers', href: '/admin/customers', icon: Users, roles: ['owner', 'admin', 'support'] },
  { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare, roles: ['owner', 'admin', 'editor', 'support'] },
  { name: 'Subscribers', href: '/admin/subscribers', icon: Mail, roles: ['owner', 'admin'] },
  { name: 'Audit Log', href: '/admin/audit', icon: ShieldCheck, roles: ['owner', 'admin'] },
  { name: 'Staff Management', href: '/admin/staff', icon: Users, roles: ['owner', 'admin'] },
  { name: 'Session History', href: '/admin/history', icon: History, roles: ['owner', 'admin', 'editor', 'support'] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser] = useState<AdminUser | null>({
    id: 'usr_owner_demo',
    email: 'demo@annsbookstore.com',
    fullName: 'Ann (Demo Owner)',
    role: 'owner',
    totpEnabled: false,
    disabled: false,
    lastLoginAt: new Date().toISOString(),
    createdAt: '2026-01-01',
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // If path is login, setup, or invite, render standalone view without admin chrome
  const isAuthPage =
    pathname === '/admin/login' ||
    pathname === '/admin/setup' ||
    pathname?.startsWith('/admin/invite');

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen]);

  // Reset Demo Data
  const handleResetDemo = async () => {
    if (!confirm('Reset all demo data to default baseline?')) return;
    setIsResetting(true);
    try {
      await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_demo' }),
      });
      window.location.reload();
    } catch {
      setIsResetting(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
    } finally {
      window.location.href = '/admin/login';
    }
  };

  if (isAuthPage) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FDFBF7', color: '#1F2937' }}>
        <meta name="robots" content="noindex, nofollow" />
        {children}
      </div>
    );
  }

  const role = currentUser?.role || 'owner';
  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9FAFB', color: '#1F2937' }}>
      <meta name="robots" content="noindex, nofollow" />

      {/* Demo Banner */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '36px',
          backgroundColor: '#722638',
          color: '#FAF7F2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          fontSize: '13px',
          fontWeight: 600,
          zIndex: 1000,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={14} aria-hidden="true" />
          <span>Demo admin: changes are saved only in this browser.</span>
        </div>
        <button
          onClick={handleResetDemo}
          disabled={isResetting}
          style={{
            border: '1px solid rgba(255, 255, 255, 0.4)',
            background: 'transparent',
            color: '#FFFFFF',
            borderRadius: '4px',
            padding: '2px 10px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <RotateCcw size={12} aria-hidden="true" />
          {isResetting ? 'Resetting...' : 'Reset demo data'}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E5E7EB',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: '36px',
          bottom: 0,
          left: 0,
          zIndex: 900,
          transition: 'transform 0.2s ease',
        }}
        className={sidebarOpen ? 'sidebar-open' : ''}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            href="/admin/dashboard"
            style={{
              textDecoration: 'none',
              color: 'var(--wine, #722638)',
              fontFamily: 'var(--font-serif)',
              fontSize: '20px',
              fontWeight: 700,
            }}
          >
            Ann’s Console
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              display: 'none', // Shown on mobile media query
              border: 0,
              background: 'transparent',
              cursor: 'pointer',
              minHeight: '44px',
              minWidth: '44px',
            }}
            aria-label="Close sidebar"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {visibleNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? '#FFF1F2' : 'transparent',
                  color: isActive ? '#722638' : '#4B5563',
                  minHeight: '44px',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile in Sidebar */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
              {currentUser?.fullName}
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#722638',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Role: {currentUser?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            data-testid="admin-logout-button"
            style={{
              border: 0,
              background: 'transparent',
              color: '#6B7280',
              cursor: 'pointer',
              minHeight: '44px',
              minWidth: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Log out"
            aria-label="Log out"
          >
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          marginLeft: '260px',
          marginTop: '36px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 36px)',
        }}
      >
        {/* Top Header */}
        <header
          style={{
            height: '64px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            position: 'sticky',
            top: '36px',
            zIndex: 800,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                display: 'none', // Handled on mobile
                border: 0,
                background: 'transparent',
                cursor: 'pointer',
                minHeight: '44px',
                minWidth: '44px',
              }}
              aria-label="Open sidebar menu"
            >
              <Menu size={20} aria-hidden="true" />
            </button>

            <button
              onClick={() => setCommandPaletteOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minHeight: '40px',
                padding: '6px 14px',
                borderRadius: '6px',
                backgroundColor: '#F3F4F6',
                border: '1px solid #E5E7EB',
                color: '#6B7280',
                fontSize: '14px',
                cursor: 'pointer',
              }}
              aria-label="Search or jump to page with Ctrl+K"
            >
              <Search size={16} aria-hidden="true" />
              <span>Search console...</span>
              <kbd
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: '#FFFFFF',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: '1px solid #D1D5DB',
                  color: '#374151',
                }}
              >
                Ctrl K
              </kbd>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/"
              target="_blank"
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#722638',
                textDecoration: 'none',
                minHeight: '44px',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 12px',
              }}
            >
              View Storefront ↗
            </Link>
          </div>
        </header>

        {/* Page Content with 250ms subtle 8px fade rise */}
        <main
          style={{
            flex: 1,
            padding: '32px 36px',
            animation: 'adminPageFadeIn 250ms ease-out',
          }}
        >
          {children}
        </main>
      </div>

      {/* Ctrl+K Command Palette Modal */}
      {commandPaletteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '100px',
          }}
          onClick={() => setCommandPaletteOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '540px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 18px',
                borderBottom: '1px solid #E5E7EB',
                gap: '12px',
              }}
            >
              <Search size={20} color="#9CA3AF" aria-hidden="true" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, books, or jump to section..."
                style={{
                  width: '100%',
                  border: 0,
                  outline: 0,
                  fontSize: '15px',
                  color: '#111827',
                }}
              />
              <button
                onClick={() => setCommandPaletteOpen(false)}
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
                aria-label="Close command palette"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '8px' }}>
              <div style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>
                Navigation Shortcuts
              </div>
              {visibleNav
                .filter((n) => !searchQuery || n.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((n) => {
                  const Icon = n.icon;
                  return (
                    <button
                      key={n.href}
                      onClick={() => {
                        router.push(n.href);
                        setCommandPaletteOpen(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        border: 0,
                        backgroundColor: 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: '#374151',
                        minHeight: '44px',
                      }}
                    >
                      <Icon size={18} aria-hidden="true" />
                      <span>{n.name}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes adminPageFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          main {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
