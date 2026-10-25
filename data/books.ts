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
  category: string;
  description: string;
  shortDescription: string;
  cover: string;
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
