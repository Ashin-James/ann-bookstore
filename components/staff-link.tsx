'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';
import { checkAdminSession } from '@/actions/admin-session';

export const STAFF_SIGN_IN_TRANSLATIONS: Record<string, string> = {
  en: 'Staff sign in',
  es: 'Acceso de personal',
  fr: 'Connexion équipe',
  de: 'Mitarbeiter-Login',
  'pt-BR': 'Acesso da equipe',
  it: 'Accesso del personale',
  hi: 'स्टाफ़ साइन इन',
  ml: 'സ്റ്റാഫ് സൈൻ ഇൻ',
  ta: 'பணியாளர் உள்நுழைவு',
  ar: 'تسجيل دخول الموظفين',
  'zh-Hans': '员工登录',
  ja: 'スタッフログイン',
  ko: '직원 로그인',
  ru: 'Вход для сотрудников',
};

export const ADMIN_DASHBOARD_TRANSLATIONS: Record<string, string> = {
  en: 'Admin dashboard',
  es: 'Panel de administración',
  fr: 'Tableau de bord admin',
  de: 'Admin-Dashboard',
  'pt-BR': 'Painel do administrador',
  it: 'Dashboard amministratore',
  hi: 'व्यवस्थापक डैशबोर्ड',
  ml: 'അഡ്മിൻ ഡാഷ്‌ബോർഡ്',
  ta: 'நிர்வாக டாஷ்போர்டு',
  ar: 'لوحة تحكم المسؤول',
  'zh-Hans': '管理仪表板',
  ja: '管理者ダッシュボード',
  ko: '관리자 대시보드',
  ru: 'Панель администратора',
};

interface StaffLinkProps {
  dataTestId?: string;
  className?: string;
  style?: React.CSSProperties;
  hoverColor?: string;
}

export default function StaffLink({ dataTestId, className, style, hoverColor }: StaffLinkProps) {
  const { language } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let mounted = true;
    checkAdminSession()
      .then((valid) => {
        if (mounted) setIsAdmin(valid);
      })
      .catch(() => {
        if (mounted) setIsAdmin(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const text = isAdmin
    ? ADMIN_DASHBOARD_TRANSLATIONS[language] || ADMIN_DASHBOARD_TRANSLATIONS.en
    : STAFF_SIGN_IN_TRANSLATIONS[language] || STAFF_SIGN_IN_TRANSLATIONS.en;

  const href = isAdmin ? '/admin/dashboard' : '/admin/login';

  const defaultColor = style?.color || 'var(--muted)';
  const activeHoverColor = hoverColor || 'var(--wine)';

  return (
    <Link
      href={href}
      data-testid={dataTestId}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        fontSize: '14px',
        lineHeight: '20px',
        minHeight: '44px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        transition: 'color 0.2s ease, opacity 0.2s ease',
        color: isHovered ? activeHoverColor : defaultColor,
        ...style,
      }}
    >
      {text}
    </Link>
  );
}
