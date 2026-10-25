'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { accountService } from '@/lib/account/service';
import { UserPreferences } from '@/lib/account/types';
import AccountLayout from '@/components/account/account-layout';
import { useToast } from '@/components/account/account-toast';
import { SUPPORTED_LANGUAGES } from '@/src/config/languages';
import {
  Globe,
  Bell,
  CheckCircle2,
} from 'lucide-react';

export default function PreferencesPage() {
  const { user, updateUserLanguage } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { showToast } = useToast();

  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'en',
    emailOrderUpdates: true,
    emailNewsletter: true,
    emailJournal: false,
  });

  useEffect(() => {
    if (!user) return;
    accountService.getPreferences(user.id).then((prefs) => {
      setPreferences(prefs);
    });
  }, [user]);

  const handleLanguageChange = async (newCode: string) => {
    if (!user) return;
    try {
      await setLanguage(newCode);
      if (updateUserLanguage) {
        updateUserLanguage(newCode);
      }
      const updated = await accountService.updatePreferences(user.id, { language: newCode });
      setPreferences(updated);
      showToast('Language preference updated', { type: 'success' });
    } catch {
      showToast('Failed to switch language', { type: 'error' });
    }
  };

  const handleToggleNotification = async (key: keyof Omit<UserPreferences, 'language'>) => {
    if (!user) return;
    const newVal = !preferences[key];
    const newPrefs = { ...preferences, [key]: newVal };
    setPreferences(newPrefs);
    try {
      await accountService.updatePreferences(user.id, { [key]: newVal });
      showToast('Notification settings saved', { type: 'info' });
    } catch {
      showToast('Failed to update notifications', { type: 'error' });
    }
  };

  return (
    <AccountLayout
      breadcrumbs={[{ label: 'Language & Preferences' }]}
      title="Language & Preferences"
      description="Configure your reading language, edition formatting, and newsletter dispatch subscriptions."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Language Selection Card */}
        <section
          style={{
            background: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '24px',
          }}
          aria-labelledby="language-card-title"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Globe size={20} color="var(--wine)" aria-hidden="true" />
            <h2 id="language-card-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0, color: 'var(--ink)' }}>
              Preferred Reading Language
            </h2>
          </div>
          <p style={{ margin: '0 0 20px', fontSize: '14px', color: 'var(--muted)', maxWidth: '600px' }}>
            Choose your preferred language for book catalog descriptions, navigational labels, and account notices.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '12px',
            }}
          >
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '6px',
                    border: isSelected ? '2px solid var(--wine)' : '1px solid var(--line)',
                    background: isSelected ? 'var(--paper)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: '52px',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '14px', color: 'var(--ink)', display: 'block' }}>
                      {lang.nativeName}
                    </strong>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{lang.name}</span>
                  </div>
                  {isSelected && <CheckCircle2 size={16} color="var(--wine)" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Email Notifications Card */}
        <section
          style={{
            background: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '24px',
          }}
          aria-labelledby="email-notifs-title"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Bell size={20} color="var(--wine)" aria-hidden="true" />
            <h2 id="email-notifs-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0, color: 'var(--ink)' }}>
              Email Notifications &amp; Subscriptions
            </h2>
          </div>
          <p style={{ margin: '0 0 20px', fontSize: '14px', color: 'var(--muted)', maxWidth: '600px' }}>
            Manage the editorial correspondences and parcel notifications sent to{' '}
            <strong style={{ color: 'var(--ink)' }}>{user?.email}</strong>.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Order Updates */}
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '6px',
                border: '1px solid var(--line)',
                background: 'var(--paper)',
                cursor: 'pointer',
                gap: '16px',
              }}
            >
              <div>
                <strong style={{ fontSize: '15px', color: 'var(--ink)', display: 'block' }}>
                  Order &amp; Shipment Tracking Updates
                </strong>
                <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>
                  Receive packing confirmations, USPS tracking dispatches, and delivery status notifications.
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailOrderUpdates}
                onChange={() => handleToggleNotification('emailOrderUpdates')}
                style={{ width: '20px', height: '20px', accentColor: 'var(--wine)', marginTop: '2px', cursor: 'pointer' }}
              />
            </label>

            {/* Newsletter */}
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '6px',
                border: '1px solid var(--line)',
                background: 'var(--paper)',
                cursor: 'pointer',
                gap: '16px',
              }}
            >
              <div>
                <strong style={{ fontSize: '15px', color: 'var(--ink)', display: 'block' }}>
                  Ann&apos;s Weekly Book Gazette
                </strong>
                <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>
                  Curated hand-picked selections, first-edition announcements, and rare literary acquisitions.
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailNewsletter}
                onChange={() => handleToggleNotification('emailNewsletter')}
                style={{ width: '20px', height: '20px', accentColor: 'var(--wine)', marginTop: '2px', cursor: 'pointer' }}
              />
            </label>

            {/* Journal & Essays */}
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '6px',
                border: '1px solid var(--line)',
                background: 'var(--paper)',
                cursor: 'pointer',
                gap: '16px',
              }}
            >
              <div>
                <strong style={{ fontSize: '15px', color: 'var(--ink)', display: 'block' }}>
                  Literary Journal &amp; Author Essays
                </strong>
                <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>
                  Monthly long-form critical essays, author interviews, and literary history notes from Ann.
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailJournal}
                onChange={() => handleToggleNotification('emailJournal')}
                style={{ width: '20px', height: '20px', accentColor: 'var(--wine)', marginTop: '2px', cursor: 'pointer' }}
              />
            </label>
          </div>
        </section>
      </div>
    </AccountLayout>
  );
}
