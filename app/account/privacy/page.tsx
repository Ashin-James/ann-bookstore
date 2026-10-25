'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { accountService } from '@/lib/account/service';
import AccountLayout from '@/components/account/account-layout';
import { useToast } from '@/components/account/account-toast';
import {
  Download,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export default function PrivacyPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [downloading, setDownloading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDownloadData = async () => {
    if (!user) return;
    setDownloading(true);
    try {
      const data = await accountService.exportUserData(user.id);
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(
          {
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
            },
            accountArchive: data,
            exportedAt: new Date().toISOString(),
            platform: "Ann's Bookstore Literary Concierge",
          },
          null,
          2
        )
      )}`;

      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `anns-bookstore-data-${user.id}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast('Account data archive downloaded as JSON', { type: 'success' });
    } catch {
      showToast('Failed to generate export file', { type: 'error' });
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteDataAndAccount = async () => {
    if (!user || deleteInput !== 'DELETE') return;
    setDeleting(true);
    try {
      await accountService.deleteUserAccount(user.id);
      logout();
      showToast('Your account and personal data have been completely expunged', { type: 'info' });
      router.push('/login');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AccountLayout
      breadcrumbs={[{ label: 'Privacy & Data' }]}
      title="Privacy & Data"
      description="Manage your data rights, export reading archives, and review our reader privacy pledge."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Privacy Pledge Card */}
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <ShieldCheck size={22} color="var(--wine)" aria-hidden="true" />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0, color: 'var(--ink)' }}>
              Our Reader Privacy Pledge
            </h2>
          </div>
          <p style={{ margin: '0 0 16px', fontSize: '14px', lineHeight: 1.6, color: 'var(--ink-secondary)' }}>
            We believe what you read is intensely private. Ann&apos;s Bookstore never sells customer browsing histories,
            reading lists, or search records to advertising networks or third-party brokers.
          </p>
          <Link
            href="/privacy"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--wine)',
              textDecoration: 'none',
            }}
          >
            <span>Read our complete Privacy Policy</span>
            <ExternalLink size={14} aria-hidden="true" />
          </Link>
        </div>

        {/* Download Data Section */}
        <section
          style={{
            background: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '24px',
          }}
          aria-labelledby="download-data-title"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Download size={20} color="var(--wine)" aria-hidden="true" />
            <h2 id="download-data-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0, color: 'var(--ink)' }}>
              Download My Data
            </h2>
          </div>
          <p style={{ margin: '0 0 20px', fontSize: '14px', color: 'var(--muted)', maxWidth: '640px', lineHeight: 1.5 }}>
            Export a comprehensive machine-readable archive containing your order histories, saved addresses, demo
            payment tokens, reading lists, book reviews, and notification preferences.
          </p>

          <button
            type="button"
            onClick={handleDownloadData}
            disabled={downloading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 22px',
              background: 'var(--ink)',
              color: 'var(--paper)',
              border: 0,
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: downloading ? 'not-allowed' : 'pointer',
              minHeight: '44px',
            }}
          >
            <FileText size={16} />
            <span>{downloading ? 'Preparing JSON Archive...' : 'Download My Data (JSON)'}</span>
          </button>
        </section>

        {/* Delete Data and Account */}
        <section
          style={{
            background: 'rgba(163, 72, 57, 0.04)',
            border: '1px solid var(--terracotta)',
            borderRadius: '8px',
            padding: '24px',
          }}
          aria-labelledby="delete-data-title"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Trash2 size={20} color="var(--terracotta)" aria-hidden="true" />
            <h2 id="delete-data-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0, color: 'var(--terracotta)' }}>
              Delete My Data &amp; Account
            </h2>
          </div>
          <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--muted)', maxWidth: '640px', lineHeight: 1.5 }}>
            Exercising your right to erasure. Selecting this will permanently delete your reader profile, stored shipping
            addresses, reading lists, active sessions, and personal order records.
          </p>

          <button
            type="button"
            onClick={() => {
              setDeleteInput('');
              setShowDeleteModal(true);
            }}
            style={{
              padding: '10px 20px',
              background: 'var(--terracotta)',
              color: 'var(--white)',
              border: 0,
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            Delete My Data and Account
          </button>
        </section>
      </div>

      {/* Typed Confirmation Modal */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-privacy-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 18, 17, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--white)',
              borderRadius: '8px',
              maxWidth: '480px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-monumental)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <AlertTriangle size={24} color="var(--terracotta)" />
              <h3 id="delete-privacy-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0, color: 'var(--ink)' }}>
                Irreversible Data Erasure
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.5, margin: '0 0 16px' }}>
              This will immediately purge all data associated with{' '}
              <strong style={{ color: 'var(--ink)' }}>{user?.email}</strong>. Type{' '}
              <strong style={{ color: 'var(--terracotta)' }}>DELETE</strong> to confirm:
            </p>

            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="DELETE"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '6px',
                border: '2px solid var(--terracotta)',
                background: 'var(--paper)',
                color: 'var(--ink)',
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                marginBottom: '20px',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                style={{
                  padding: '10px 18px',
                  background: 'transparent',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '42px',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDataAndAccount}
                disabled={deleteInput !== 'DELETE' || deleting}
                style={{
                  padding: '10px 20px',
                  background: 'var(--terracotta)',
                  color: 'var(--white)',
                  border: 0,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: deleteInput === 'DELETE' && !deleting ? 'pointer' : 'not-allowed',
                  opacity: deleteInput === 'DELETE' ? 1 : 0.5,
                  minHeight: '42px',
                }}
              >
                {deleting ? 'Erasing...' : 'Confirm Erasure'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}
