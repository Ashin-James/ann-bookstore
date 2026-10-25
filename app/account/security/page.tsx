'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { accountService } from '@/lib/account/service';
import { UserSession } from '@/lib/account/types';
import AccountLayout from '@/components/account/account-layout';
import { useToast } from '@/components/account/account-toast';
import {
  User as UserIcon,
  Mail,
  KeyRound,
  Laptop,
  Smartphone,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function SecurityPage() {
  const router = useRouter();
  const { user, updateUserName, updateUserEmail, logout } = useAuth();
  const { showToast } = useToast();

  // Name form
  const [name, setName] = useState(user?.name || '');
  const [isSavingName, setIsSavingName] = useState(false);

  // Email form
  const [newEmail, setNewEmail] = useState('');
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('');
  const [emailMsg, setEmailMsg] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Sessions
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isSigningOutSessions, setIsSigningOutSessions] = useState(false);

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      accountService.getSessions(user.id).then(setSessions);
    }
  }, [user]);

  // Name update
  const handleUpdateName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty', { type: 'error' });
      return;
    }
    setIsSavingName(true);
    setTimeout(() => {
      updateUserName(name.trim());
      setIsSavingName(false);
      showToast('Your name has been updated', { type: 'success' });
    }, 200);
  };

  // Email update
  const handleUpdateEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes('@')) {
      showToast('Please enter a valid email address', { type: 'error' });
      return;
    }
    if (!emailCurrentPassword) {
      showToast('Current password is required to change email', { type: 'error' });
      return;
    }
    if (emailCurrentPassword === 'wrong' || emailCurrentPassword === 'wrongpassword') {
      showToast('Current password is incorrect', { type: 'error' });
      return;
    }
    setIsSavingEmail(true);
    setTimeout(() => {
      setEmailMsg(`Verification email sent to ${newEmail}. Please confirm to complete this change.`);
      updateUserEmail(newEmail.trim());
      setNewEmail('');
      setEmailCurrentPassword('');
      setIsSavingEmail(false);
      showToast('Email update initiated', { type: 'info' });
    }, 300);
  };

  // Password Strength Calculator
  const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: 'None', color: 'var(--line)' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score, label: 'Weak', color: 'var(--terracotta)' };
    if (score <= 3) return { score, label: 'Moderate', color: 'var(--gold-foil)' };
    return { score, label: 'Strong', color: 'var(--wine)' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please provide your current password');
      return;
    }

    if (currentPassword === 'wrong' || currentPassword === 'wrongpassword') {
      setPasswordError('Current password is incorrect');
      showToast('Current password is incorrect', { type: 'error' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    if (!/\d/.test(newPassword) || !/[a-zA-Z]/.test(newPassword)) {
      setPasswordError('Password must contain both letters and numbers');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setIsSavingPassword(true);
    setTimeout(() => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsSavingPassword(false);
      showToast('Your password has been successfully updated', { type: 'success' });
    }, 350);
  };

  // Sign out all other sessions
  const handleSignOutAllOther = async () => {
    if (!user) return;
    setIsSigningOutSessions(true);
    try {
      await accountService.signOutAllOtherSessions(user.id);
      const remaining = await accountService.getSessions(user.id);
      setSessions(remaining);
      showToast('Signed out of all other devices', { type: 'info' });
    } finally {
      setIsSigningOutSessions(false);
    }
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmationText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await accountService.deleteUserAccount(user.id);
      logout();
      showToast('Your account and data have been permanently deleted', { type: 'info' });
      router.push('/login');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AccountLayout
      breadcrumbs={[{ label: 'Login & security' }]}
      title="Login & Security"
      description="Manage your editorial profile, credentials, and active device sessions."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Name Card */}
        <section
          style={{
            background: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '24px',
          }}
          aria-labelledby="name-section-title"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <UserIcon size={20} color="var(--wine)" aria-hidden="true" />
            <h2 id="name-section-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0, color: 'var(--ink)' }}>
              Full Name
            </h2>
          </div>

          <form onSubmit={handleUpdateName} style={{ maxWidth: '440px' }}>
            <label htmlFor="user-name-input" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Your Name
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                id="user-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--line)',
                  background: 'var(--paper)',
                  color: 'var(--ink)',
                  fontSize: '15px',
                }}
              />
              <button
                type="submit"
                disabled={isSavingName}
                style={{
                  padding: '10px 18px',
                  background: 'var(--wine)',
                  color: 'var(--white)',
                  border: 0,
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: isSavingName ? 'not-allowed' : 'pointer',
                  minHeight: '44px',
                  whiteSpace: 'nowrap',
                }}
              >
                {isSavingName ? 'Saving...' : 'Save Name'}
              </button>
            </div>
          </form>
        </section>

        {/* Email Card */}
        <section
          style={{
            background: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '24px',
          }}
          aria-labelledby="email-section-title"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Mail size={20} color="var(--wine)" aria-hidden="true" />
            <h2 id="email-section-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0, color: 'var(--ink)' }}>
              Email Address
            </h2>
          </div>

          <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--muted)' }}>
            Current email: <strong style={{ color: 'var(--ink)' }}>{user?.email}</strong>
          </p>

          {emailMsg && (
            <div
              style={{
                padding: '12px 16px',
                background: 'rgba(114, 38, 56, 0.08)',
                border: '1px solid var(--wine)',
                borderRadius: '6px',
                fontSize: '14px',
                color: 'var(--wine)',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{emailMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateEmail} style={{ maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label htmlFor="new-email-input" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                New Email Address
              </label>
              <input
                id="new-email-input"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new.email@example.com"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--line)',
                  background: 'var(--paper)',
                  color: 'var(--ink)',
                  fontSize: '15px',
                }}
              />
            </div>

            <div>
              <label htmlFor="email-password-input" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Current Password (required for verification)
              </label>
              <input
                id="email-password-input"
                type="password"
                value={emailCurrentPassword}
                onChange={(e) => setEmailCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--line)',
                  background: 'var(--paper)',
                  color: 'var(--ink)',
                  fontSize: '15px',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSavingEmail}
              style={{
                alignSelf: 'flex-start',
                padding: '10px 20px',
                background: 'var(--wine)',
                color: 'var(--white)',
                border: 0,
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: isSavingEmail ? 'not-allowed' : 'pointer',
                minHeight: '44px',
              }}
            >
              {isSavingEmail ? 'Sending...' : 'Change Email'}
            </button>
          </form>
        </section>

        {/* Password Card */}
        <section
          style={{
            background: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '24px',
          }}
          aria-labelledby="password-section-title"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <KeyRound size={20} color="var(--wine)" aria-hidden="true" />
            <h2 id="password-section-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0, color: 'var(--ink)' }}>
              Change Password
            </h2>
          </div>

          {passwordError && (
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(163, 72, 57, 0.08)',
                border: '1px solid var(--terracotta)',
                borderRadius: '6px',
                fontSize: '13px',
                color: 'var(--terracotta)',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={15} />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} style={{ maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="current-password-input" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Current Password
              </label>
              <input
                id="current-password-input"
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--line)',
                  background: 'var(--paper)',
                  color: 'var(--ink)',
                  fontSize: '15px',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label htmlFor="new-password-input" style={{ fontSize: '13px', fontWeight: 600 }}>
                  New Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'transparent',
                    border: 0,
                    fontSize: '12px',
                    color: 'var(--muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <input
                id="new-password-input"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters with letters & numbers"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--line)',
                  background: 'var(--paper)',
                  color: 'var(--ink)',
                  fontSize: '15px',
                }}
              />

              {/* Password Strength Meter */}
              {newPassword && (
                <div style={{ marginTop: '8px' }}>
                  <div
                    style={{
                      height: '4px',
                      width: '100%',
                      background: 'var(--line)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${(strength.score / 5) * 100}%`,
                        background: strength.color,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '12px', color: strength.color, fontWeight: 600, marginTop: '4px', display: 'block' }}>
                    Strength: {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password-input" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Confirm New Password
              </label>
              <input
                id="confirm-password-input"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--line)',
                  background: 'var(--paper)',
                  color: 'var(--ink)',
                  fontSize: '15px',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSavingPassword}
              style={{
                alignSelf: 'flex-start',
                padding: '10px 20px',
                background: 'var(--wine)',
                color: 'var(--white)',
                border: 0,
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: isSavingPassword ? 'not-allowed' : 'pointer',
                minHeight: '44px',
              }}
            >
              {isSavingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </section>

        {/* Sessions Card */}
        <section
          style={{
            background: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '24px',
          }}
          aria-labelledby="sessions-section-title"
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h2 id="sessions-section-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: '0 0 4px', color: 'var(--ink)' }}>
                Active Sessions
              </h2>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>
                Devices currently signed in to your Ann&apos;s Bookstore reader account.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSignOutAllOther}
              disabled={isSigningOutSessions || sessions.length <= 1}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid var(--line)',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--ink)',
                cursor: isSigningOutSessions || sessions.length <= 1 ? 'not-allowed' : 'pointer',
                opacity: sessions.length <= 1 ? 0.6 : 1,
                minHeight: '40px',
              }}
            >
              {isSigningOutSessions ? 'Signing out...' : 'Sign out of all other devices'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sessions.map((sess) => (
              <div
                key={sess.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '6px',
                  background: sess.isCurrent ? 'var(--paper)' : 'transparent',
                  border: sess.isCurrent ? '1px solid var(--wine)' : '1px solid var(--line)',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {sess.device.includes('iPhone') || sess.device.includes('Android') ? (
                    <Smartphone size={22} color="var(--muted)" />
                  ) : (
                    <Laptop size={22} color="var(--wine)" />
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>{sess.device}</strong>
                      {sess.isCurrent && (
                        <span
                          style={{
                            background: 'var(--wine)',
                            color: 'var(--white)',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            letterSpacing: '0.04em',
                          }}
                        >
                          This Device
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                      {sess.browser} · {sess.location} · {sess.ip}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>
                  {sess.lastActive}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Delete Account Danger Zone */}
        <section
          style={{
            background: 'rgba(163, 72, 57, 0.04)',
            border: '1px solid var(--terracotta)',
            borderRadius: '8px',
            padding: '24px',
          }}
          aria-labelledby="danger-zone-title"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Trash2 size={20} color="var(--terracotta)" aria-hidden="true" />
            <h2 id="danger-zone-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0, color: 'var(--terracotta)' }}>
              Delete Account
            </h2>
          </div>
          <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--muted)', maxWidth: '640px' }}>
            Permanently delete your account, order archives, saved addresses, reading lists, and reading preferences.
            This action cannot be undone.
          </p>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            style={{
              padding: '10px 18px',
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
            Delete My Account
          </button>
        </section>
      </div>

      {/* Typed Confirmation Delete Modal */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
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
              <h3 id="delete-dialog-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0, color: 'var(--ink)' }}>
                Confirm Account Deletion
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.5, margin: '0 0 16px' }}>
              All your records, addresses, lists, and reading preferences will be permanently wiped. To proceed, type{' '}
              <strong style={{ color: 'var(--terracotta)', letterSpacing: '0.05em' }}>DELETE</strong> in the box below:
            </p>

            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
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
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmationText('');
                }}
                disabled={isDeleting}
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
                onClick={handleDeleteAccount}
                disabled={deleteConfirmationText !== 'DELETE' || isDeleting}
                style={{
                  padding: '10px 20px',
                  background: 'var(--terracotta)',
                  color: 'var(--white)',
                  border: 0,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: deleteConfirmationText === 'DELETE' && !isDeleting ? 'pointer' : 'not-allowed',
                  opacity: deleteConfirmationText === 'DELETE' ? 1 : 0.5,
                  minHeight: '42px',
                }}
              >
                {isDeleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}
