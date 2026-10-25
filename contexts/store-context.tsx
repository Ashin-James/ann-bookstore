'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from 'react';
import { books } from '@/data/books';

export type CartLine = { variantId: string; bookId: string; quantity: number };

type Store = {
  cart: CartLine[];
  wishlist: string[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (bookId: string, variantId: string, openDrawer?: boolean) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  clearCart: () => void;
  lastRemovedItem: CartLine | null;
  undoRemove: () => void;
  toggleWishlist: (bookId: string) => void;
  cartCount: number;
  ready: boolean;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const c = localStorage.getItem('ann-demo-cart');
      if (c) {
        const parsed = JSON.parse(c);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (x) =>
              books.some((b) => b.id === x.bookId) &&
              typeof x.variantId === 'string' &&
              Number.isInteger(x.quantity) &&
              x.quantity > 0
          );
        }
      }
    } catch {
      // Ignore
    }
    return [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const w = localStorage.getItem('ann-demo-wishlist');
      if (w) {
        const parsed = JSON.parse(w);
        if (Array.isArray(parsed)) {
          return parsed.filter((id) => books.some((b) => b.id === id));
        }
      }
    } catch {
      // Ignore
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastRemovedItem, setLastRemovedItem] = useState<CartLine | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem('ann-demo-cart', JSON.stringify(cart));
  }, [cart, ready]);

  useEffect(() => {
    if (ready) localStorage.setItem('ann-demo-wishlist', JSON.stringify(wishlist));
  }, [wishlist, ready]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (bookId: string, variantId: string, openDrawer = true) => {
    setCart((old) => {
      const found = old.find((x) => x.variantId === variantId);
      if (found) {
        return old.map((x) =>
          x.variantId === variantId ? { ...x, quantity: Math.min(20, x.quantity + 1) } : x
        );
      }
      return [...old, { bookId, variantId, quantity: 1 }];
    });
    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    setCart((old) =>
      quantity < 1
        ? old.filter((x) => x.variantId !== variantId)
        : old.map((x) => (x.variantId === variantId ? { ...x, quantity: Math.min(20, quantity) } : x))
    );
  };

  const removeFromCart = (variantId: string) => {
    setCart((old) => {
      const item = old.find((x) => x.variantId === variantId);
      if (item) setLastRemovedItem(item);
      return old.filter((x) => x.variantId !== variantId);
    });
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem('ann-demo-cart');
    } catch {}
  };

  const undoRemove = useCallback(() => {
    if (lastRemovedItem) {
      setCart((old) => [...old, lastRemovedItem]);
      setLastRemovedItem(null);
    }
  }, [lastRemovedItem]);

  const toggleWishlist = (bookId: string) => {
    setWishlist((old) => (old.includes(bookId) ? old.filter((x) => x !== bookId) : [...old, bookId]));
  };

  const cartCount = cart.reduce((sum, x) => sum + x.quantity, 0);

  const value = useMemo<Store>(
    () => ({
      cart,
      wishlist,
      isCartOpen,
      openCart,
      closeCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      lastRemovedItem,
      undoRemove,
      toggleWishlist,
      cartCount,
      ready,
    }),
    [cart, wishlist, isCartOpen, lastRemovedItem, undoRemove, cartCount, ready]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore must be used inside StoreProvider');
  return value;
}
