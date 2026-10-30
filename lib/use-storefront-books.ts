'use client';

import { useState, useEffect } from 'react';
import { Book, getStorefrontBooks } from '@/data/books';

export function useStorefrontBooks(): Book[] {
  const [items, setItems] = useState<Book[]>(() => getStorefrontBooks());

  useEffect(() => {
    let cancelled = false;

    const fetchFromServer = async () => {
      try {
        const res = await fetch('/api/books');
        if (!res.ok) return;
        const data = await res.json();
        const backend = res.headers.get('x-data-backend');
        if (Array.isArray(data) && data.length > 0 && !cancelled) {
          if (backend?.startsWith('supabase')) {
            (window as unknown as { __DATA_BACKEND?: string }).__DATA_BACKEND = 'supabase';
            try { window.localStorage.setItem('ann_data_backend', 'supabase'); } catch (_) {}
            setItems(data);
          } else {
            (window as unknown as { __DATA_BACKEND?: string }).__DATA_BACKEND = 'demo';
            try { window.localStorage.removeItem('ann_data_backend'); } catch (_) {}
            const local = getStorefrontBooks();
            setItems(local.length > 0 ? local : data);
          }
        }
      } catch {
        // Fallback already provided by getStorefrontBooks()
      }
    };

    fetchFromServer();

    const sync = () => {
      setItems(getStorefrontBooks());
    };
    sync();
    window.addEventListener('ann_books_updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      cancelled = true;
      window.removeEventListener('ann_books_updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return items;
}
