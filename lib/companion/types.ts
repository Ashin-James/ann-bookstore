import type { Book } from '@/data/books';

export type CompanionIntent =
  | 'greeting'
  | 'thanks'
  | 'goodbye'
  | 'how_are_you'
  | 'who_are_you'
  | 'about_ann'
  | 'mood_recommendation'
  | 'genre'
  | 'length'
  | 'format'
  | 'price_delivery'
  | 'summary_request'
  | 'compare_books'
  | 'excerpt_request'
  | 'add_to_cart'
  | 'returns_faq'
  | 'small_talk'
  | 'complaint'
  | 'off_topic'
  | 'crisis'
  | 'injection'
  | 'follow_up'
  | 'clarification';

export type MoodType = 'lonely' | 'sad' | 'reflective' | 'nostalgic' | 'rainy' | 'hopeful' | 'calm' | 'cozy';
export type LengthPreference = 'short' | 'long' | 'medium';
export type FormatPreference = 'paperback' | 'hardcover' | 'ebook';
export type GenrePreference = 'novel' | 'essays';

export interface UserPreferences {
  mood?: MoodType;
  length?: LengthPreference;
  format?: FormatPreference;
  genre?: GenrePreference;
}

export interface ConversationState {
  detectedMood?: MoodType;
  preferences: UserPreferences;
  booksShown: string[];
  booksDeclined: string[];
  lastIntent?: CompanionIntent;
  lastSuggestedBooks: string[];
  lastVariants: Record<string, number>;
  turnCount: number;
  memoryHighlights: string[];
}

export interface QuickReplyChip {
  label: string;
  query: string;
}

export interface ActionLink {
  label: string;
  href: string;
}

export interface CompanionReply {
  text: string;
  intent: CompanionIntent;
  confidence: number;
  suggestedBooks?: Book[];
  actionLinks?: ActionLink[];
  chips?: QuickReplyChip[];
  bookToAddToCart?: { bookId: string; formatId: string };
  isCrisis?: boolean;
}

export interface IntentMatchResult {
  intent: CompanionIntent;
  confidence: number;
  entities: {
    bookId?: string;
    secondBookId?: string;
    format?: FormatPreference;
    genre?: GenrePreference;
    length?: LengthPreference;
    mood?: MoodType;
    followUpType?: 'another' | 'shorter' | 'more' | 'yes' | 'no' | 'first' | 'add';
  };
  matchedTokens: string[];
  isNegated?: boolean;
}
