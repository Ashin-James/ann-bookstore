'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import Container from '@/components/container';
import Section from '@/components/section';
import AccountSidebar from './account-sidebar';
import { ToastProvider } from './account-toast';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AccountLayoutProps {
  children: ReactNode;
  breadcrumbs: BreadcrumbItem[];
  title?: string;
  description?: string;
  action?: ReactNode;
}

export default function AccountLayout({
  children,
  breadcrumbs,
  title,
  description,
  action,
}: AccountLayoutProps) {
  return (
    <ToastProvider>
      <Section className="account-subpage-section" style={{ minHeight: '80vh', padding: '36px 0 80px' }}>
        <Container>
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumbs" style={{ marginBottom: '24px' }}>
            <ol
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                listStyle: 'none',
                padding: 0,
                margin: 0,
                fontSize: '14px',
                flexWrap: 'wrap',
              }}
            >
              <li>
                <Link
                  href="/account"
                  style={{
                    color: 'var(--muted)',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Your Account
                </Link>
              </li>
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ChevronRight size={14} color="var(--taupe)" aria-hidden="true" />
                    {crumb.href && !isLast ? (
                      <Link
                        href={crumb.href}
                        style={{
                          color: 'var(--muted)',
                          textDecoration: 'none',
                          fontWeight: 500,
                        }}
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        aria-current={isLast ? 'page' : undefined}
                        style={{
                          color: 'var(--ink)',
                          fontWeight: isLast ? 700 : 500,
                        }}
                      >
                        {crumb.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          {/* Account Body: Sidebar + Main Content */}
          <div className="account-grid-layout" style={{ display: 'flex', gap: '36px', alignItems: 'flex-start' }}>
            <AccountSidebar />

            {/* Main Content Area */}
            <motion.main
              className="account-main-content"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ flex: 1, minWidth: 0, width: '100%' }}
            >
              {title && (
                <header
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '16px',
                    marginBottom: '28px',
                    borderBottom: '1px solid var(--line)',
                    paddingBottom: '20px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <h1
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(28px, 3.5vw, 38px)',
                        margin: 0,
                        color: 'var(--ink)',
                        lineHeight: 1.1,
                      }}
                    >
                      {title}
                    </h1>
                    {description && (
                      <p style={{ color: 'var(--muted)', fontSize: '15px', margin: '8px 0 0', maxWidth: '640px' }}>
                        {description}
                      </p>
                    )}
                  </div>
                  {action && <div style={{ flexShrink: 0 }}>{action}</div>}
                </header>
              )}

              {children}
            </motion.main>
          </div>
        </Container>
      </Section>
    </ToastProvider>
  );
}
