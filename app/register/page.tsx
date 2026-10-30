'use client';

import { useState, useEffect, Suspense, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import Container from '@/components/container';
import Section from '@/components/section';
import { ArrowRight, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';

const REGISTER_HEADINGS: Record<string, { title: string; subtitle: string; submit: string }> = {
  en: {
    title: 'Create Reader Account',
    subtitle: 'Join our community of thoughtful readers and track your orders.',
    submit: 'Create Account',
  },
  es: {
    title: 'Crear cuenta de lector',
    subtitle: 'Únete a nuestra comunidad de lectores y sigue tus pedidos.',
    submit: 'Crear cuenta',
  },
  fr: {
    title: 'Créer un compte lecteur',
    subtitle: 'Rejoignez notre communauté de lecteurs et suivez vos commandes.',
    submit: 'Créer un compte',
  },
  de: {
    title: 'Leserkonto erstellen',
    subtitle: 'Treten Sie unserer Lesegemeinschaft bei und verfolgen Sie Ihre Bestellungen.',
    submit: 'Konto erstellen',
  },
  'pt-BR': {
    title: 'Criar conta de leitor',
    subtitle: 'Junte-se à nossa comunidade de leitores e acompanhe seus pedidos.',
    submit: 'Criar conta',
  },
  it: {
    title: 'Crea account lettore',
    subtitle: 'Unisciti alla nostra comunità di lettori e segui i tuoi ordini.',
    submit: 'Crea account',
  },
  hi: {
    title: 'पाठक खाता बनाएं',
    subtitle: 'हमारे विचारशील पाठकों के समुदाय में शामिल हों और अपने ऑर्डर ट्रैक करें।',
    submit: 'खाता बनाएं',
  },
  ml: {
    title: 'വായനക്കാരന്റെ അക്കൗണ്ട് സൃഷ്ടിക്കുക',
    subtitle: 'വായനക്കാരുടെ കൂട്ടായ്മയിൽ ചേരൂ, ഓർഡറുകൾ ട്രാക്ക് ചെയ്യൂ.',
    submit: 'അക്കൗണ്ട് സൃഷ്ടിക്കുക',
  },
  ta: {
    title: 'வாசகர் கணக்கை உருவாக்கவும்',
    subtitle: 'வாசகர் சமூகத்தில் இணைந்து உங்கள் ஆர்டர்களைக் கண்காணிக்கவும்.',
    submit: 'கணக்கை உருவாக்கு',
  },
  ar: {
    title: 'إنشاء حساب قارئ',
    subtitle: 'انضم إلى مجتمع قرائنا وتابع طلباتك بكل سهولة.',
    submit: 'إنشاء الحساب',
  },
  'zh-Hans': {
    title: '创建读者账户',
    subtitle: '加入我们的读者社区，追踪您的图书订单。',
    submit: '创建账户',
  },
  ja: {
    title: '読者アカウントを作成',
    subtitle: '読者コミュニティに参加し、注文状況を確認できます。',
    submit: 'アカウント作成',
  },
  ko: {
    title: '독자 계정 생성',
    subtitle: '독자 커뮤니티에 참여하고 도서 주문을 확인하세요.',
    submit: '계정 생성',
  },
  ru: {
    title: 'Создать аккаунт читателя',
    subtitle: 'Присоединяйтесь к сообществу читателей и отслеживайте заказы.',
    submit: 'Создать аккаунт',
  },
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUserVerified } = useAuth();
  const { language } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [demoVerificationLink, setDemoVerificationLink] = useState('');
  const [isVerifiedNotice, setIsVerifiedNotice] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const verifyToken = searchParams.get('verifyToken');

  // If already logged in and not verifying, redirect to account
  useEffect(() => {
    if (user && !verifyToken) {
      router.replace('/account');
    }
  }, [user, verifyToken, router]);

  // Handle verifyToken on page load
  useEffect(() => {
    if (verifyToken) {
      fetch('/api/auth/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_email', token: verifyToken }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setIsVerifiedNotice(true);
            setUserVerified(true);
          } else {
            setError(data.error || 'Verification failed or token expired.');
          }
        })
        .catch(() => {
          setError('Unable to verify email at this time.');
        });
    }
  }, [verifyToken, setUserVerified]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setDemoVerificationLink('');

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 12) {
      setError('Password must be at least 12 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/auth/customer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'register',
            name,
            email,
            password,
            confirmPassword,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || 'Registration failed. Please try again.');
          return;
        }

        setSuccessMsg(
          'Account created successfully! Please verify your email before checking out or reviewing.'
        );
        if (data.data?.verificationLink) {
          setDemoVerificationLink(data.data.verificationLink);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An error occurred during registration.';
        setError(message);
      }
    });
  };

  const copy = REGISTER_HEADINGS[language] || REGISTER_HEADINGS.en;

  return (
    <Section className="register-page-section">
      <Container size="sm" style={{ maxWidth: '480px', margin: '40px auto' }}>
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '36px 32px',
            boxShadow: 'var(--shadow-ambient)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span className="eyebrow" style={{ color: 'var(--wine)', fontSize: '14px' }}>
              ANN&apos;S BOOKSTORE ATELIER
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '32px',
                margin: '8px 0',
                color: 'var(--ink)',
              }}
            >
              {copy.title}
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '15px', margin: 0 }}>
              {copy.subtitle}
            </p>
          </div>

          {isVerifiedNotice && (
            <div
              role="status"
              data-testid="verification-success-alert"
              style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                padding: '16px',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <CheckCircle size={20} aria-hidden="true" style={{ flexShrink: 0 }} />
              <div>
                <strong>Email verified successfully!</strong>
                <p style={{ margin: '4px 0 0' }}>
                  Your reader privileges are fully active.{' '}
                  <Link
                    href="/login"
                    data-testid="verified-signin-link"
                    style={{ color: '#065F46', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    Proceed to Sign in →
                  </Link>
                </p>
              </div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              data-testid="register-error"
              style={{
                background: 'rgba(114, 38, 56, 0.08)',
                border: '1px solid var(--wine)',
                color: 'var(--wine)',
                padding: '12px 16px',
                borderRadius: '4px',
                fontSize: '14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={18} aria-hidden="true" style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              data-testid="register-success"
              style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                padding: '14px 16px',
                borderRadius: '4px',
                fontSize: '14px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <CheckCircle size={18} aria-hidden="true" />
                <strong>{successMsg}</strong>
              </div>

              {demoVerificationLink && (
                <div
                  data-testid="demo-verification-banner"
                  style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: '#fff',
                    borderRadius: '4px',
                    border: '1px dashed #059669',
                  }}
                >
                  <span style={{ fontSize: '13px', color: '#047857', display: 'block', marginBottom: '6px' }}>
                    Demo Mode: Simulated Email Verification Link
                  </span>
                  <Link
                    href={demoVerificationLink}
                    data-testid="demo-verification-link"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'var(--wine)',
                      fontWeight: 600,
                      fontSize: '14px',
                      textDecoration: 'underline',
                      minHeight: '44px',
                    }}
                  >
                    Verify Email Address Now →
                  </Link>
                </div>
              )}
            </div>
          )}

          {!isVerifiedNotice && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label
                  htmlFor="register-name"
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    marginBottom: '6px',
                    color: 'var(--ink)',
                  }}
                >
                  Full Name
                </label>
                <input
                  id="register-name"
                  type="text"
                  required
                  disabled={!mounted || isPending}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Eleanor Vance"
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '10px 14px',
                    borderRadius: '4px',
                    border: '1px solid var(--line)',
                    fontSize: '14px',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="register-email"
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    marginBottom: '6px',
                    color: 'var(--ink)',
                  }}
                >
                  Email Address
                </label>
                <input
                  id="register-email"
                  type="email"
                  required
                  disabled={!mounted || isPending}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="reader@example.com"
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '10px 14px',
                    borderRadius: '4px',
                    border: '1px solid var(--line)',
                    fontSize: '14px',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="register-password"
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    marginBottom: '6px',
                    color: 'var(--ink)',
                  }}
                >
                  Password (minimum 12 characters)
                </label>
                <input
                  id="register-password"
                  type="password"
                  required
                  disabled={!mounted || isPending}
                  minLength={12}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '10px 14px',
                    borderRadius: '4px',
                    border: '1px solid var(--line)',
                    fontSize: '14px',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="register-confirm-password"
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    marginBottom: '6px',
                    color: 'var(--ink)',
                  }}
                >
                  Confirm Password
                </label>
                <input
                  id="register-confirm-password"
                  type="password"
                  required
                  disabled={!mounted || isPending}
                  minLength={12}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '10px 14px',
                    borderRadius: '4px',
                    border: '1px solid var(--line)',
                    fontSize: '14px',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={!mounted || isPending}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  background: 'var(--wine)',
                  color: '#fff',
                  padding: '14px 20px',
                  borderRadius: '4px',
                  fontSize: '15px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  border: '0',
                  cursor: 'pointer',
                  marginTop: '8px',
                }}
              >
                <span>{isPending ? 'Processing...' : copy.submit}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </form>
          )}

          {/* Links */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link
              href="/login"
              style={{
                color: 'var(--wine)',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                minHeight: '44px',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px',
              }}
            >
              Already have an account? Sign in →
            </Link>
          </div>

          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--muted)',
              fontSize: '14px',
            }}
          >
            <ShieldCheck size={16} aria-hidden="true" />
            <span>Encrypted passwords. Customer data is isolated from administration.</span>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

