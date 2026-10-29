'use client';

import { useState, useEffect } from 'react';
import { Book, getStorefrontBooks } from '@/data/books';

export function useStorefrontBooks(): Book[] {
  const [items, setItems] = useState<Book[]>(() => getStorefrontBooks());

  useEffect(() => {
    const sync = () => {
      setItems(getStorefrontBooks());
    };
    sync();
    window.addEventListener('ann_books_updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('ann_books_updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return items;
}
