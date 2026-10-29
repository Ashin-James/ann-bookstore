'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { setSessionCookie, clearSessionCookie, getSessionUserId } from '@/lib/account/session';

export interface UserAddress {
  id: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserOrder {
  id: string;
  orderNumber: string;
  date: string;
  items: { title: string; format: string; price: number; quantity: number }[];
  total: number;
  status: 'Confirmed' | 'Dispatched' | 'Delivered';
  estimatedDelivery: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  language?: string;
  isVerified?: boolean;
  addresses: UserAddress[];
  orders: UserOrder[];
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, name?: string, isVerified?: boolean, id?: string) => void;
  logout: () => void;
  updateUserName: (name: string) => void;
  updateUserEmail: (email: string) => void;
  updateUserLanguage: (lang: string) => void;
  setUserVerified: (verified: boolean) => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: 'usr_demo_01',
  name: 'Eleanor Vance',
  email: 'reader.eleanor@example.com',
  isVerified: true,
  addresses: [
    {
      id: 'addr_1',
      fullName: 'Eleanor Vance',
      street: '14 Elmwood Terrace, Apt 2B',
      city: 'Portland',
      state: 'OR',
      postalCode: '97201',
      country: 'United States',
      isDefault: true,
    },
  ],
  orders: [
    {
      id: 'ord_101',
      orderNumber: 'ANN-2026-00412',
      date: 'October 16, 2026',
      items: [
        { title: 'The Quiet Hours', format: 'Hardcover', price: 2800, quantity: 1 },
        { title: 'Monsoon Letters', format: 'Paperback', price: 1950, quantity: 1 },
      ],
      total: 4750,
      status: 'Dispatched',
      estimatedDelivery: 'Tomorrow by 6:00 PM via USPS',
    },
  ],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    try {
      const isSignedOut = localStorage.getItem('ann-bookstore-signed-out');
      if (isSignedOut === 'true') {
        setUser(null);
        clearSessionCookie();
        return;
      }

      const stored = localStorage.getItem('ann-bookstore-user');
      const sessionCookie = getSessionUserId();
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setSessionCookie(parsed.id);
      } else if (sessionCookie) {
        setUser(DEMO_USER);
        localStorage.setItem('ann-bookstore-user', JSON.stringify(DEMO_USER));
      } else {
        const isLoginPage =
          typeof window !== 'undefined' &&
          (window.location.pathname === '/login' || window.location.pathname === '/register');
        if (isLoginPage && !sessionCookie) {
          setUser(null);
          clearSessionCookie();
          return;
        }

        // If neither exists and not signed out, default demo user is signed in for seamless exploration
        setUser(DEMO_USER);
        localStorage.setItem('ann-bookstore-user', JSON.stringify(DEMO_USER));
        setSessionCookie(DEMO_USER.id);
      }
    } catch {
      setUser(DEMO_USER);
      setSessionCookie(DEMO_USER.id);
    }
  }, []);

  const login = (email: string, name = 'Reader', isVerified = true, id?: string) => {
    try {
      localStorage.removeItem('ann-bookstore-signed-out');
    } catch {}

    const newUser: User = {
      ...DEMO_USER,
      id: id || `cust_${Date.now()}`,
      email,
      name,
      isVerified,
    };
    setUser(newUser);
    setSessionCookie(newUser.id);
    try {
      localStorage.setItem('ann-bookstore-user', JSON.stringify(newUser));
    } catch {}
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    clearSessionCookie();
    try {
      localStorage.removeItem('ann-bookstore-user');
      localStorage.setItem('ann-bookstore-signed-out', 'true');
    } catch {}
    fetch('/api/auth/customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    }).catch(() => {});
  };

  const setUserVerified = (verified: boolean) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, isVerified: verified };
      try {
        localStorage.setItem('ann-bookstore-user', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updateUserName = (name: string) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, name };
      try {
        localStorage.setItem('ann-bookstore-user', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updateUserEmail = (email: string) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, email };
      try {
        localStorage.setItem('ann-bookstore-user', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updateUserLanguage = (lang: string) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, language: lang };
      try {
        localStorage.setItem('ann-bookstore-user', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: !!user,
      login,
      logout,
      updateUserName,
      updateUserEmail,
      updateUserLanguage,
      setUserVerified,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
    }),
    [user, isAuthModalOpen]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
