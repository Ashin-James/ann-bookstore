'use client';

import React, { useState, useEffect } from 'react';
import { getAdminService } from '@/lib/admin/demo-admin-service';
import { AdminRole, AdminUser } from '@/lib/admin/types';
import { DataTable, Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { UserPlus, Copy, Check, AlertCircle, X } from 'lucide-react';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<AdminUser[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'support'>('editor');
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStaff = async () => {
    const service = getAdminService();
    const res = await service.listStaff();
    if (res.success) {
      setStaff(res.data);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleRoleChange = async (targetUser: AdminUser, newRole: AdminRole) => {
    setError(null);
    const service = getAdminService();
    const res = await service.updateStaffRole({
      actorId: 'usr_owner_demo',
      targetUserId: targetUser.id,
      newRole,
    });
    if (!res.success) {
      setError(res.error.message);
    } else {
      loadStaff();
    }
  };

  const handleToggleDisable = async (targetUser: AdminUser) => {
    setError(null);
    const service = getAdminService();
    const res = await service.toggleDisableStaff({
      actorId: 'usr_owner_demo',
      targetUserId: targetUser.id,
      disabled: !targetUser.disabled,
    });
    if (!res.success) {
      setError(res.error.message);
    } else {
      loadStaff();
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const service = getAdminService();
    const res = await service.inviteStaff({
      inviterId: 'usr_owner_demo',
      email: inviteEmail,
      role: inviteRole,
    });

    if (res.success) {
      const fullUrl = `${window.location.origin}${res.data.inviteLink}`;
      setGeneratedInviteLink(fullUrl);
    }
  };

  const columns: Column<AdminUser>[] = [
    {
      key: 'fullName',
      header: 'Staff Member',
      sortable: true,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#111827' }}>{row.fullName}</div>
          <div style={{ fontSize: '13px', color: '#6B7280' }}>{row.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Assigned Role',
      render: (row) => (
        <select
          value={row.role}
          onChange={(e) => handleRoleChange(row, e.target.value as AdminRole)}
          style={{
            minHeight: '44px',
            padding: '6px 12px',
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: '6px',
            border: '1px solid #D1D5DB',
            backgroundColor: '#FFFFFF',
            textTransform: 'capitalize',
          }}
          aria-label={`Change role for ${row.fullName}`}
        >
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="support">Support</option>
        </select>
      ),
    },
    {
      key: 'status',
      header: 'Account Status',
      render: (row) => (
        <StatusBadge status={row.disabled ? 'Deactivated' : 'Active'} />
      ),
    },
    {
      key: 'lastLoginAt',
      header: 'Last Login',
      render: (row) => (
        <span style={{ fontSize: '13px', color: '#6B7280' }}>
          {row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleDateString() : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Security Controls',
      render: (row) => (
        <button
          onClick={() => handleToggleDisable(row)}
          style={{
            minHeight: '44px',
            padding: '6px 14px',
            border: '1px solid #D1D5DB',
            backgroundColor: '#FFFFFF',
            color: row.disabled ? '#065F46' : '#991B1B',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {row.disabled ? 'Re-activate' : 'Deactivate'}
        </button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', margin: '0 0 6px', color: '#111827' }}>
            Staff Access & RBAC Roles
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
            Invite team members, assign resource roles, and manage permissions. Root owner protected against removal.
          </p>
        </div>

        <button
          onClick={() => {
            setShowInviteModal(true);
            setGeneratedInviteLink(null);
          }}
          style={{
            minHeight: '44px',
            padding: '10px 18px',
            backgroundColor: '#722638',
            color: '#FFFFFF',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            border: 0,
          }}
        >
          <UserPlus size={18} aria-hidden="true" />
          Invite Staff Member
        </button>
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

      <DataTable
        data={staff}
        columns={columns}
        keyExtractor={(row) => row.id}
        searchPlaceholder="Search staff by name or email..."
        exportFilename="staff-export"
      />

      {/* Invite Modal */}
      {showInviteModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              padding: '28px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Invite Colleague
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
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
                aria-label="Close invite modal"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {!generatedInviteLink ? (
              <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Role & Access Level
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'admin' | 'editor' | 'support')}
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                    }}
                  >
                    <option value="admin">Admin (Commerce, Content & Staff)</option>
                    <option value="editor">Editor (Journal, Pages & Media only)</option>
                    <option value="support">Support (Orders, Reviews & Inbox)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    style={{
                      minHeight: '44px',
                      padding: '8px 16px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      minHeight: '44px',
                      padding: '8px 18px',
                      backgroundColor: '#722638',
                      color: '#FFFFFF',
                      border: 0,
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Generate Invite Link
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#4B5563', lineHeight: 1.5 }}>
                  In demo mode (or free tier without email API configured), single-use invite links are generated directly on screen:
                </p>

                <div
                  style={{
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    wordBreak: 'break-all',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: '#722638',
                  }}
                >
                  {generatedInviteLink}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedInviteLink);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 3000);
                    }}
                    style={{
                      flex: 1,
                      minHeight: '44px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {copiedLink ? <Check size={18} color="#059669" /> : <Copy size={18} />}
                    {copiedLink ? 'Copied Link!' : 'Copy Link'}
                  </button>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    style={{
                      minHeight: '44px',
                      padding: '8px 18px',
                      backgroundColor: '#722638',
                      color: '#FFFFFF',
                      border: 0,
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
