import { money } from '@/src/config/site.config';

export type BookFormat = {
  id: string;
  name: string;
  price: number; // Integer cents in USD (e.g. 1800 = $18.00)
};

export type Book = {
  id: string;
  slug: string;
  title: string;
  author?: string;
  category: string;
  description: string;
  shortDescription: string;
  cover: string;
  coverAlt?: string;
  status?: 'draft' | 'scheduled' | 'published' | 'archived';
  formats: BookFormat[];
  featured?: boolean;
  note?: string;
};

/**
 * Ann's Book Catalog
 * All prices stored as integer cents in USD.
 * Sample prices are USD placeholders labelled as sample.
 */
export const books: Book[] = [
  {
    id: 'quiet-hours',
    slug: 'the-quiet-hours',
    title: 'The Quiet Hours',
    category: 'Novel',
    description:
      'A family, one long rainy season, and the small choices that change everything. A tender story about what we keep, what we lose, and the quiet courage it takes to return.',
    shortDescription:
      'A family, one long rainy season, and the small choices that change everything.',
    cover: 'quiet',
    featured: true,
    note: 'A novel by Ann',
    formats: [
      { id: 'quiet-paperback', name: 'Paperback', price: 1800 },
      { id: 'quiet-hardcover', name: 'Hardcover', price: 2800 },
      { id: 'quiet-ebook', name: 'E-book', price: 999 },
    ],
  },
  {
    id: 'monsoon-letters',
    slug: 'monsoon-letters',
    title: 'Monsoon Letters',
    category: 'Essays',
    description:
      'A collection of intimate letters and essays about memory, home, and the words we write when the rain will not stop.',
    shortDescription: 'Essays on memory, home, and the words we leave behind.',
    cover: 'letters',
    note: 'Epistolary essays',
    formats: [
      { id: 'letters-paperback', name: 'Paperback', price: 1950 },
      { id: 'letters-ebook', name: 'E-book', price: 1199 },
    ],
  },
  {
    id: 'small-things',
    slug: 'a-map-of-small-things',
    title: 'A Map of Small Things',
    category: 'E-book',
    description:
      'Small observations become a map back to ourselves in this thoughtful collection about everyday wonder and the art of paying attention.',
    shortDescription: 'A thoughtful map to the wonder hiding in everyday life.',
    cover: 'map',
    note: 'Reflective collection',
    formats: [{ id: 'map-ebook', name: 'E-book', price: 1200 }],
  },
  {
    id: 'room-for-rain',
    slug: 'a-room-for-rain',
    title: 'A Room for Rain',
    category: 'Novel',
    description:
      'In a coastal town shaped by the weather, one unexpected guest changes the way a family understands its past.',
    shortDescription: 'An intimate story of family, weather, and unexpected beginnings.',
    cover: 'rain',
    note: 'A coastal novel',
    formats: [
      { id: 'rain-paperback', name: 'Paperback', price: 1900 },
      { id: 'rain-hardcover', name: 'Hardcover', price: 2900 },
    ],
  },
];

export { money };
/**
 * Backward compatibility alias for components during US transition
 */
export const formatINR = money;

export interface RawVariant {
  id?: string;
  format: string;
  price: number;
}

export interface RawBookRecord {
  id: string;
  slug: string;
  title: string;
  author?: string;
  category?: string;
  description?: string;
  shortDescription?: string;
  cover?: string;
  coverAlt?: string;
  status?: 'draft' | 'scheduled' | 'published' | 'archived';
  featured?: boolean;
  subtitle?: string;
  variants?: RawVariant[];
}

export function convertRecordToBook(record: RawBookRecord): Book {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    author: record.author || 'Ann',
    category: record.category || 'Novel',
    description: record.description || '',
    shortDescription: record.shortDescription || '',
    cover: record.cover || 'quiet',
    coverAlt: record.coverAlt || `Cover artwork for ${record.title}`,
    status: record.status || 'published',
    featured: Boolean(record.featured),
    note: record.subtitle || (record.author ? `A story by ${record.author}` : undefined),
    formats: (record.variants && record.variants.length > 0)
      ? record.variants.map((v: RawVariant) => ({
          id: v.id || `var_${v.format}`,
          name: v.format,
          price: v.price,
        }))
      : [
          { id: `${record.id}-pb`, name: 'Paperback', price: 1800 },
        ],
  };
}

export function getStorefrontBooks(): Book[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem('ann_admin_v1_store');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.books) && parsed.books.length > 0) {
          return (parsed.books as RawBookRecord[])
            .filter((b: RawBookRecord) => b.status === 'published' || !b.status)
            .map(convertRecordToBook);
        }
      }
    } catch {
      // Fallback
    }
  }
  return books;
}

export function getStorefrontBookBySlug(slug: string): Book | undefined {
  return getStorefrontBooks().find((b) => b.slug === slug);
}
