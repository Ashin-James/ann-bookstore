'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal } from 'lucide-react';
import { books } from '@/data/books';
import { BookGrid } from '@/components/book-card';
import Container from '@/components/container';
import Section from '@/components/section';

function BooksContent() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [category, setCategory] = useState('All books');
  const [sort, setSort] = useState('Featured');

  const filtered = useMemo(() => {
    let result = books.filter(
      (b) =>
        (category === 'All books' || b.category === category) &&
        `${b.title} ${b.category} ${b.description}`.toLowerCase().includes(q.toLowerCase())
    );
    if (sort === 'Price: low to high') {
      result = [...result].sort((a, b) => a.formats[0].price - b.formats[0].price);
    }
    if (sort === 'Price: high to low') {
      result = [...result].sort((a, b) => b.formats[0].price - a.formats[0].price);
    }
    if (sort === 'Title A–Z') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    }
    return result;
  }, [q, category, sort]);

  return (
    <Section>
      <Container>
        <div className="page-intro">
          <span className="eyebrow">THE BOOKSHELF</span>
          <h1>A world in <em>every book.</em></h1>
          <p>Stories, essays, and little pieces of life to take with you.</p>
        </div>

        <div className="catalogue-tools">
          <label className="catalogue-search">
            <Search size={18} aria-hidden="true" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search titles and stories"
              aria-label="Search books"
            />
          </label>

          <label className="filter-select">
            <SlidersHorizontal size={18} aria-hidden="true" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter category"
            >
              {['All books', 'Novel', 'Essays', 'E-book'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>

          <select
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort books"
          >
            {['Featured', 'Price: low to high', 'Price: high to low', 'Title A–Z'].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>

        <div className="results-line">
          {filtered.length} {filtered.length === 1 ? 'book' : 'books'} to discover
        </div>

        {filtered.length ? (
          <BookGrid items={filtered} />
        ) : (
          <div className="empty-state">
            <h2>No stories found just yet.</h2>
            <p>Try a different title or clear your filters.</p>
            <button
              type="button"
              className="button button-dark"
              onClick={() => {
                setQ('');
                setCategory('All books');
              }}
            >
              Clear search
            </button>
          </div>
        )}
      </Container>
    </Section>
  );
}

export default function BooksPage() {
  return (
    <Suspense
      fallback={
        <Section>
          <Container style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
            Loading the bookshelf...
          </Container>
        </Section>
      }
    >
      <BooksContent />
    </Suspense>
  );
}
