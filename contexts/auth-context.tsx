'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

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
  addresses: UserAddress[];
  orders: UserOrder[];
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, name?: string) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: 'usr_demo_01',
  name: 'Eleanor Vance',
  email: 'reader.eleanor@example.com',
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
      const stored = localStorage.getItem('ann-bookstore-user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Default demo logged-in user for quick demonstration
        setUser(DEMO_USER);
        localStorage.setItem('ann-bookstore-user', JSON.stringify(DEMO_USER));
      }
    } catch {
      setUser(DEMO_USER);
    }
  }, []);

  const login = (email: string, name = 'Reader') => {
    const newUser: User = {
      ...DEMO_USER,
      email,
      name,
    };
    setUser(newUser);
    try {
      localStorage.setItem('ann-bookstore-user', JSON.stringify(newUser));
    } catch {
      // Ignore
    }
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('ann-bookstore-user');
    } catch {
      // Ignore
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: !!user,
      login,
      logout,
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
