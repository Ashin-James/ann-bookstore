import { books, type Book } from '@/data/books';

export interface CompanionResponse {
  text: string;
  suggestedBooks?: Book[];
  actionLinks?: { label: string; href: string }[];
  suggestedQueries?: string[];
  bookToAddToCart?: { bookId: string; formatId: string };
  isCrisis?: boolean;
}

/**
 * Synchronous rule-based response helper for backwards compatibility
 */
export function getRuleBasedResponse(rawQuery: string): CompanionResponse {
  // Call synchronous portion of engine
  let text = "I'd love to help you find a story from Ann's collection. Are you in the mood for an atmospheric novel or quiet essays?";
  let suggestedBooks: Book[] = books.slice(0, 2);
  let actionLinks: { label: string; href: string }[] | undefined;
  const suggestedQueries = [
    'Tell me about The Quiet Hours',
    'Recommend something for a rainy day',
    'Where should I begin?',
  ];

  // Quick fallback bridge
  const q = rawQuery.toLowerCase();
  if (q.includes('quiet hours')) {
    const b = books.find((x) => x.id === 'quiet-hours') || books[0];
    text = `'The Quiet Hours' is Ann's flagship novel set during an uninterrupted monsoon in coastal southern India.`;
    suggestedBooks = [b];
    actionLinks = [{ label: 'Discover The Quiet Hours', href: `/books/${b.slug}` }];
  } else if (q.includes('monsoon letters')) {
    const b = books.find((x) => x.id === 'monsoon-letters') || books[1];
    text = `'Monsoon Letters' is a collection of epistolary correspondence between two sisters across thirty years.`;
    suggestedBooks = [b];
    actionLinks = [{ label: 'View Monsoon Letters', href: `/books/${b.slug}` }];
  } else if (q.includes('small things')) {
    const b = books.find((x) => x.id === 'small-things') || books[2];
    text = `'A Map of Small Things' is a collection of sixteen luminous essays on everyday mindfulness.`;
    suggestedBooks = [b];
  } else if (q.includes('room for rain')) {
    const b = books.find((x) => x.id === 'room-for-rain') || books[3];
    text = `'A Room for Rain' follows an unexpected guest in a coastal town shaped by weather.`;
    suggestedBooks = [b];
  }

  return {
    text,
    suggestedBooks,
    actionLinks,
    suggestedQueries,
  };
}
