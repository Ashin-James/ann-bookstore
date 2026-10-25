import { books, type Book } from '@/data/books';
import type { ConversationState, CompanionIntent, LengthPreference, FormatPreference, GenrePreference, MoodType } from './types';

export function createInitialState(): ConversationState {
  return {
    detectedMood: undefined,
    preferences: {},
    booksShown: [],
    booksDeclined: [],
    lastIntent: undefined,
    lastSuggestedBooks: [],
    lastVariants: {},
    turnCount: 0,
    memoryHighlights: [],
  };
}

/**
 * Ensures variant rotation so the same intent variant is never repeated consecutively in a session.
 */
export function selectNextVariantIndex(state: ConversationState, key: string, totalVariants: number): number {
  if (totalVariants <= 1) return 0;
  const lastIndex = state.lastVariants[key];
  let next = Math.floor(Math.random() * totalVariants);
  if (lastIndex !== undefined && next === lastIndex) {
    next = (next + 1) % totalVariants;
  }
  return next;
}

export function updateStateOnResponse(
  state: ConversationState,
  intent: CompanionIntent,
  suggestedBooks: Book[] = [],
  variantKey?: string,
  variantIndex?: number,
  preferences?: { mood?: MoodType; length?: LengthPreference; format?: FormatPreference; genre?: GenrePreference }
): ConversationState {
  const nextShown = [...state.booksShown];
  const nextSuggested = suggestedBooks.map((b) => b.id);

  for (const b of suggestedBooks) {
    if (!nextShown.includes(b.id)) {
      nextShown.push(b.id);
    }
  }

  const nextLastVariants = { ...state.lastVariants };
  if (variantKey && variantIndex !== undefined) {
    nextLastVariants[variantKey] = variantIndex;
  }

  const nextPrefs = { ...state.preferences, ...preferences };
  const nextMemories = [...state.memoryHighlights];

  if (preferences?.mood && !nextMemories.some((m) => m.includes(preferences.mood!))) {
    nextMemories.push(`mood: ${preferences.mood}`);
  }
  if (preferences?.length && !nextMemories.some((m) => m.includes(preferences.length!))) {
    nextMemories.push(`length: ${preferences.length}`);
  }
  if (preferences?.genre && !nextMemories.some((m) => m.includes(preferences.genre!))) {
    nextMemories.push(`genre: ${preferences.genre}`);
  }

  return {
    ...state,
    detectedMood: preferences?.mood || state.detectedMood,
    preferences: nextPrefs,
    booksShown: nextShown,
    lastIntent: intent,
    lastSuggestedBooks: nextSuggested.length > 0 ? nextSuggested : state.lastSuggestedBooks,
    lastVariants: nextLastVariants,
    turnCount: state.turnCount + 1,
    memoryHighlights: nextMemories,
  };
}

export interface FollowUpResolution {
  type: 'another' | 'shorter' | 'more' | 'yes' | 'no' | 'first' | 'add';
  resolvedBookId?: string;
  targetFormatId?: string;
  explanation?: string;
}

/**
 * Checks if query is a follow-up ("another one", "something shorter", "tell me more", "yes", "no thanks", "what about the first one", "add it")
 */
export function resolveFollowUp(query: string, state: ConversationState): FollowUpResolution | null {
  const q = query.toLowerCase().trim().replace(/[.,!?;:]/g, '');

  // 1. "add it" / "add to cart" / "buy it" / "add this"
  if (
    q === 'add it' ||
    q === 'add it to cart' ||
    q === 'add it to bag' ||
    q === 'add this' ||
    q === 'add to bag' ||
    q === 'add to cart' ||
    q === 'buy it' ||
    q === 'i want to buy it' ||
    q === 'take this one'
  ) {
    const bookId = state.lastSuggestedBooks[0] || state.booksShown[state.booksShown.length - 1] || 'quiet-hours';
    const book = books.find((b) => b.id === bookId) || books[0];
    const preferredFormat = state.preferences.format;
    const format = book.formats.find((f) => f.name.toLowerCase().includes(preferredFormat || '')) || book.formats[0];

    return {
      type: 'add',
      resolvedBookId: book.id,
      targetFormatId: format.id,
    };
  }

  // 2. "what about the first one" / "the first one" / "tell me about the first one"
  if (
    q.includes('first one') ||
    q === 'what about the first one' ||
    q === 'the first one' ||
    q === 'the first book' ||
    q.includes('first recommendation')
  ) {
    const bookId = state.booksShown[0] || state.lastSuggestedBooks[0] || 'quiet-hours';
    return {
      type: 'first',
      resolvedBookId: bookId,
    };
  }

  // 3. "tell me more" / "tell me more about it" / "more details"
  if (
    q === 'tell me more' ||
    q === 'tell me more about it' ||
    q === 'more details' ||
    q === 'more please' ||
    q === 'elaborate' ||
    q.includes('tell me more')
  ) {
    const bookId = state.lastSuggestedBooks[0] || state.booksShown[state.booksShown.length - 1] || 'quiet-hours';
    return {
      type: 'more',
      resolvedBookId: bookId,
    };
  }

  // 4. "something shorter" / "shorter read" / "too long"
  if (
    q.includes('shorter') ||
    q.includes('less pages') ||
    q === 'too long' ||
    q === 'something shorter' ||
    q === 'shorter please'
  ) {
    // "small-things" (short essays) or "monsoon-letters"
    const declinedId = state.lastSuggestedBooks[0];
    const shorterBook = books.find((b) => b.id === 'small-things') || books[2];
    return {
      type: 'shorter',
      resolvedBookId: shorterBook.id,
      explanation: declinedId ? `Declining ${declinedId} for a shorter read` : 'Looking for a shorter read',
    };
  }

  // 5. "another one" / "show me another" / "something else" / "what else"
  if (
    q === 'another one' ||
    q === 'show me another' ||
    q === 'something else' ||
    q === 'what else' ||
    q === 'next' ||
    q === 'next book' ||
    q === 'next one' ||
    q.includes('another recommendation')
  ) {
    const currentId = state.lastSuggestedBooks[0];
    const available = books.filter((b) => b.id !== currentId && !state.booksDeclined.includes(b.id));
    const nextBook = available.find((b) => !state.booksShown.includes(b.id)) || available[0] || books[0];
    return {
      type: 'another',
      resolvedBookId: nextBook.id,
    };
  }

  // 6. "no thanks" / "not that one" / "i do not like that" / "no"
  if (
    q === 'no thanks' ||
    q === 'no thank you' ||
    q === 'not that one' ||
    q === 'not really' ||
    q === 'no' ||
    q === 'nah' ||
    q === 'none of these'
  ) {
    const currentId = state.lastSuggestedBooks[0];
    return {
      type: 'no',
      resolvedBookId: currentId,
    };
  }

  // 7. "yes" / "sure" / "sounds good" / "yes please"
  if (
    q === 'yes' ||
    q === 'sure' ||
    q === 'yes please' ||
    q === 'sounds good' ||
    q === 'i would like that' ||
    q === 'ok' ||
    q === 'okay'
  ) {
    const bookId = state.lastSuggestedBooks[0] || state.booksShown[state.booksShown.length - 1] || 'quiet-hours';
    return {
      type: 'yes',
      resolvedBookId: bookId,
    };
  }

  return null;
}
