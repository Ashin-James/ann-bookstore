'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { books } from '@/data/books';
import { useStore } from '@/contexts/store-context';
import { BookGrid } from '@/components/book-card';
import Container from '@/components/container';
import Section from '@/components/section';

export default function WishlistPage() {
  const { wishlist } = useStore();
  const saved = books.filter((b) => wishlist.includes(b.id));

  return (
    <Section className="wishlist-page-section">
      <Container>
        <div className="page-intro">
          <span className="eyebrow">YOUR SAVED STORIES</span>
          <h1>A shelf of <em>maybes.</em></h1>
          <p>Keep the stories you want to come back to.</p>
        </div>

        {saved.length ? (
          <BookGrid items={saved} />
        ) : (
          <div className="empty-state">
            <Heart size={32} color="var(--wine)" aria-hidden="true" />
            <h2>Save a story for later.</h2>
            <p>Tap the heart on any book that catches your eye.</p>
            <Link className="button button-dark" href="/books">
              Browse books
            </Link>
          </div>
        )}
      </Container>
    </Section>
  );
}
