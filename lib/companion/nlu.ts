import { getLexicon, type LexiconData } from './lexicons';
import type {
  CompanionIntent,
  IntentMatchResult,
  MoodType,
  LengthPreference,
  FormatPreference,
  GenrePreference,
  ConversationState,
} from './types';
import { resolveFollowUp } from './state';

const CONTRACTIONS: Record<string, string> = {
  "i'm": "i am",
  "im": "i am",
  "you're": "you are",
  "youre": "you are",
  "he's": "he is",
  "she's": "she is",
  "it's": "it is",
  "we're": "we are",
  "they're": "they are",
  "can't": "cannot",
  "cant": "cannot",
  "won't": "will not",
  "wont": "will not",
  "don't": "do not",
  "dont": "do not",
  "doesn't": "does not",
  "doesnt": "does not",
  "didn't": "did not",
  "didnt": "did not",
  "haven't": "have not",
  "havent": "have not",
  "hasn't": "has not",
  "hasnt": "has not",
  "hadn't": "had not",
  "isn't": "is not",
  "isnt": "is not",
  "aren't": "are not",
  "arent": "are not",
  "wasn't": "was not",
  "weren't": "were not",
  "i've": "i have",
  "ive": "i have",
  "you've": "you have",
  "we've": "we have",
  "they've": "they have",
  "i'd": "i would",
  "you'd": "you would",
  "i'll": "i will",
  "you'll": "you will",
  "let's": "let us",
  "lets": "let us",
  "that's": "that is",
  "thats": "that is",
  "what's": "what is",
  "whats": "what is",
  "there's": "there is",
  "who's": "who is",
  "how's": "how is",
  "where's": "where is",
  "del": "de el",
  "al": "a el",
  "d'": "de ",
  "l'": "le ",
};

export function normalizeText(text: string): string {
  if (!text) return '';
  let str = text.toLowerCase().trim();
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const words = str.split(/\s+/);
  const expanded = words.map((w) => {
    const clean = w.replace(/[.,!?;:()"]/g, '');
    return CONTRACTIONS[clean] || w;
  });
  return expanded.join(' ');
}

export function tokenize(normalizedText: string): string[] {
  return normalizedText
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'«»]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function lightStem(word: string, lang = 'en'): string {
  if (word.length <= 3) return word;
  const w = word.toLowerCase();

  if (lang === 'es') {
    if (w.endsWith('mente') && w.length > 7) return w.slice(0, -5);
    if ((w.endsWith('ando') || w.endsWith('iendo')) && w.length > 6) return w.slice(0, -4);
    if ((w.endsWith('ado') || w.endsWith('ido')) && w.length > 5) return w.slice(0, -3);
    if (w.endsWith('es') && w.length > 4) return w.slice(0, -2);
    if (w.endsWith('s') && w.length > 3) return w.slice(0, -1);
    return w;
  }

  if (w.endsWith('ingly') && w.length > 6) return w.slice(0, -5);
  if (w.endsWith('iness') && w.length > 6) return w.slice(0, -5) + 'y';
  if (w.endsWith('ment') && w.length > 6) return w.slice(0, -4);
  if (w.endsWith('ness') && w.length > 6) return w.slice(0, -4);
  if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
  if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('ly') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('es') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return w.slice(0, -1);
  return w;
}

/**
 * Computes Damerau-Levenshtein distance (handling adjacent character transpositions like "lonley" -> "lonely")
 */
export function damerauLevenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const d: number[][] = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) d[i][0] = i;
  for (let j = 0; j <= b.length; j++) d[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); // transposition
      }
    }
  }

  return d[a.length][b.length];
}

export function isTypoMatch(word: string, target: string): boolean {
  if (word === target) return true;
  if ((word === 'book' || word === 'books') && (target === 'ebook' || target === 'ebooks')) return false;
  const dist = damerauLevenshtein(word, target);
  if (target.length >= 5 && dist <= 1) return true;
  if (target.length >= 8 && dist <= 2) return true;
  return false;
}

export function isWordNegated(tokens: string[], index: number, negations: string[]): boolean {
  const start = Math.max(0, index - 3);
  for (let i = start; i < index; i++) {
    const token = tokens[i];
    if (negations.includes(token)) return true;
  }
  return false;
}

function matchesTrigger(norm: string, tokens: string[], trigger: string): boolean {
  const clean = normalizeText(trigger);
  if (clean.includes(' ')) {
    return norm.includes(clean);
  }
  return tokens.includes(clean);
}

export function extractEntities(
  rawText: string,
  tokens: string[],
  lexicon: LexiconData
): {
  booksFound: string[];
  mood?: MoodType;
  moodNegated?: boolean;
  length?: LengthPreference;
  format?: FormatPreference;
  genre?: GenrePreference;
} {
  const norm = normalizeText(rawText);
  const booksFound: string[] = [];

  for (const [bookId, aliases] of Object.entries(lexicon.books)) {
    for (const alias of aliases) {
      if (norm.includes(alias.toLowerCase())) {
        if (!booksFound.includes(bookId)) {
          booksFound.push(bookId);
        }
        break;
      }
    }
  }

  let detectedMood: MoodType | undefined;
  let moodNegated = false;

  for (const [moodKey, synonyms] of Object.entries(lexicon.moods)) {
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      const stem = lightStem(t, lexicon.code);
      const matches = synonyms.some((syn) => syn === t || syn === stem || isTypoMatch(t, syn));
      if (matches) {
        const negated = isWordNegated(tokens, i, lexicon.negations);
        if (negated) {
          moodNegated = true;
        } else if (!detectedMood) {
          detectedMood = moodKey as MoodType;
        }
      }
    }
  }

  let detectedLength: LengthPreference | undefined;
  for (const [lenKey, synonyms] of Object.entries(lexicon.preferences.length)) {
    if (synonyms.some((s) => norm.includes(s) || tokens.some((t) => t !== 'book' && isTypoMatch(t, s)))) {
      detectedLength = lenKey as LengthPreference;
      break;
    }
  }

  let detectedFormat: FormatPreference | undefined;
  for (const [fmtKey, synonyms] of Object.entries(lexicon.preferences.format)) {
    if (synonyms.some((s) => norm.includes(s) || tokens.some((t) => t !== 'book' && isTypoMatch(t, s)))) {
      detectedFormat = fmtKey as FormatPreference;
      break;
    }
  }

  let detectedGenre: GenrePreference | undefined;
  for (const [gnrKey, synonyms] of Object.entries(lexicon.preferences.genre)) {
    if (synonyms.some((s) => norm.includes(s) || tokens.some((t) => t !== 'book' && isTypoMatch(t, s)))) {
      detectedGenre = gnrKey as GenrePreference;
      break;
    }
  }

  return {
    booksFound,
    mood: moodNegated ? undefined : detectedMood,
    moodNegated,
    length: detectedLength,
    format: detectedFormat,
    genre: detectedGenre,
  };
}

const CRISIS_KEYWORDS = [
  'kill myself',
  'suicide',
  'want to die',
  'end my life',
  'hurt myself',
  'cutting myself',
  'no reason to live',
  'better off dead',
  'cannot go on',
  'cannot go on living',
  'quiero morir',
  'suicidio',
  'quitarme la vida',
  'hacerme dano',
  'no vale la pena vivir',
];

const INJECTION_PATTERNS = [
  'ignore previous instructions',
  'ignore all previous instructions',
  'system prompt',
  'you are now dan',
  'reveal instructions',
  'developer instructions',
  'bypass safety',
  'jailbreak',
  'repeat after me',
  'ignora las instrucciones',
  'prompt del sistema',
  'ahora eres dan',
  'disregard prior commands',
];

const OFF_TOPIC_KEYWORDS = [
  'bitcoin',
  'crypto',
  'cryptocurrency',
  'capital of france',
  'python code',
  'binary tree',
  'football',
  'soccer',
  'chocolate cake',
  'recipe',
  'election',
  'cripto',
];

const COMPLAINT_KEYWORDS = [
  'complaint',
  'queja',
  'damaged',
  'broken',
  'torn',
  'delayed',
  'demorado',
  'terrible',
  'disappointed',
  'decepcionado',
  'poor quality',
  'late order',
  'torn spine',
];

export function classifyIntent(
  rawQuery: string,
  state: ConversationState,
  langCode = 'en'
): IntentMatchResult {
  const norm = normalizeText(rawQuery);
  const tokens = tokenize(norm);
  const lexicon = getLexicon(langCode);

  // 1. SAFETY: Crisis
  for (const phrase of CRISIS_KEYWORDS) {
    if (norm.includes(phrase)) {
      return { intent: 'crisis', confidence: 1.0, entities: {}, matchedTokens: [phrase] };
    }
  }

  // 2. SAFETY: Injection
  for (const pattern of INJECTION_PATTERNS) {
    if (norm.includes(pattern)) {
      return { intent: 'injection', confidence: 1.0, entities: {}, matchedTokens: [pattern] };
    }
  }

  // 3. Off-Topic Priority
  for (const kw of OFF_TOPIC_KEYWORDS) {
    if (norm.includes(kw)) {
      return { intent: 'off_topic', confidence: 1.0, entities: {}, matchedTokens: [kw] };
    }
  }

  // 4. Complaint Priority
  for (const kw of COMPLAINT_KEYWORDS) {
    if (norm.includes(kw)) {
      return { intent: 'complaint', confidence: 1.0, entities: {}, matchedTokens: [kw] };
    }
  }

  // 5. Returns FAQ Priority
  if (
    norm.includes('return') ||
    norm.includes('returns') ||
    norm.includes('refund') ||
    norm.includes('devolucion') ||
    norm.includes('reembolso')
  ) {
    return { intent: 'returns_faq', confidence: 0.95, entities: {}, matchedTokens: ['return'] };
  }

  // 6. Follow-up
  const followUp = resolveFollowUp(rawQuery, state);
  if (followUp) {
    return {
      intent: 'follow_up',
      confidence: 0.95,
      entities: {
        bookId: followUp.resolvedBookId,
        format: followUp.targetFormatId ? (state.preferences.format || 'paperback') : undefined,
        followUpType: followUp.type,
      },
      matchedTokens: [followUp.type],
    };
  }

  const entities = extractEntities(rawQuery, tokens, lexicon);

  // 7. Add to cart Priority
  if (
    ((norm.includes('cart') || norm.includes('bag') || norm.includes('carrito') || norm.includes('cesta')) &&
      (norm.includes('add') || norm.includes('put') || norm.includes('anadir') || norm.includes('agregar'))) ||
    norm.includes('want to buy') ||
    norm.includes('buy the') ||
    norm.includes('purchase this') ||
    (norm.startsWith('buy ') && !norm.includes('why')) ||
    (norm.startsWith('purchase ')) ||
    (norm.startsWith('comprar '))
  ) {
    return {
      intent: 'add_to_cart',
      confidence: 1.0,
      entities: { bookId: entities.booksFound[0], format: entities.format },
      matchedTokens: ['cart_action'],
    };
  }

  // 8. Price & Delivery Priority
  if (
    norm.includes('price') ||
    norm.includes('cost') ||
    norm.includes('how much') ||
    norm.includes('shipping') ||
    norm.includes('delivery') ||
    norm.includes('postage') ||
    norm.includes('cuanto cuesta')
  ) {
    return {
      intent: 'price_delivery',
      confidence: 0.95,
      entities: { bookId: entities.booksFound[0] },
      matchedTokens: ['price_delivery'],
    };
  }

  const scores: Partial<Record<CompanionIntent, number>> = {};
  const matchedTokensMap: Partial<Record<CompanionIntent, string[]>> = {};

  const addScore = (intent: CompanionIntent, delta: number, token?: string) => {
    scores[intent] = (scores[intent] || 0) + delta;
    if (token) {
      if (!matchedTokensMap[intent]) matchedTokensMap[intent] = [];
      matchedTokensMap[intent]!.push(token);
    }
  };

  // Check Lexicon Intents with word-boundary awareness
  for (const [intentKey, triggerList] of Object.entries(lexicon.intents)) {
    if (['crisis', 'injection', 'off_topic', 'complaint', 'returns_faq', 'price_delivery', 'add_to_cart'].includes(intentKey)) continue;
    const intent = intentKey as CompanionIntent;

    for (const trigger of triggerList) {
      if (matchesTrigger(norm, tokens, trigger)) {
        addScore(intent, 0.95, trigger);
        continue;
      }

      const triggerWords = tokenize(trigger);
      for (const tw of triggerWords) {
        if (tw.length < 4 || ['tell', 'about', 'book', 'read', 'want', 'have', 'looking'].includes(tw)) continue;
        for (const t of tokens) {
          if (t === tw || lightStem(t, lexicon.code) === lightStem(tw, lexicon.code) || isTypoMatch(t, tw)) {
            addScore(intent, 0.35, t);
          }
        }
      }
    }
  }

  // Summary request check
  if (
    entities.booksFound.length >= 1 &&
    (norm.includes('about') ||
      norm.includes('what is') ||
      norm.includes('summary') ||
      norm.includes('synopsis') ||
      norm.includes('storyline') ||
      norm.includes('de que trata'))
  ) {
    addScore('summary_request', 1.0, 'summary');
  }

  // Excerpt check
  if (
    norm.includes('chapter one') ||
    norm.includes('excerpt') ||
    norm.includes('sample') ||
    norm.includes('preview') ||
    norm.includes('capitulo uno') ||
    norm.includes('extracto') ||
    norm.includes('fragmento')
  ) {
    addScore('excerpt_request', 0.95, 'excerpt');
  }

  // Compare check
  if (entities.booksFound.length >= 2 || (norm.includes('compare') && entities.booksFound.length >= 1) || norm.includes('comparar')) {
    addScore('compare_books', 1.0, 'compare');
  }

  // About Ann
  if (
    (norm.includes('who is ann') || norm.includes('about ann') || norm.includes('the author') || norm.includes('quien es ann') || norm.includes('sobre ann')) &&
    entities.booksFound.length === 0
  ) {
    addScore('about_ann', 0.95, 'ann');
  }

  // Mood recommendation
  if (entities.mood) {
    addScore('mood_recommendation', 0.95, entities.mood);
  }

  // Length vs Genre
  if (entities.length && !scores.summary_request && !scores.excerpt_request) {
    addScore('length', 0.95, entities.length);
  }
  if (entities.genre && !scores.summary_request && !scores.excerpt_request && !entities.length) {
    addScore('genre', 0.9, entities.genre);
  }
  if (entities.format) {
    addScore('format', 0.9, entities.format);
  }

  // Where to start -> who_are_you
  if (norm.includes('where should i start') || norm.includes('where to start') || norm.includes('por donde empezar')) {
    addScore('who_are_you', 0.95, 'start');
  }

  let bestIntent: CompanionIntent | null = null;
  let highestScore = 0;

  for (const [intentStr, score] of Object.entries(scores)) {
    const s = Math.min(1.0, score);
    if (s > highestScore) {
      highestScore = s;
      bestIntent = intentStr as CompanionIntent;
    }
  }

  if (!bestIntent || highestScore < 0.45) {
    return {
      intent: 'clarification',
      confidence: highestScore,
      entities: {
        bookId: entities.booksFound[0],
        mood: entities.mood,
        length: entities.length,
        format: entities.format,
        genre: entities.genre,
      },
      matchedTokens: [],
    };
  }

  return {
    intent: bestIntent,
    confidence: highestScore,
    entities: {
      bookId: entities.booksFound[0],
      secondBookId: entities.booksFound[1],
      mood: entities.mood,
      length: entities.length,
      format: entities.format,
      genre: entities.genre,
    },
    matchedTokens: matchedTokensMap[bestIntent] || [],
    isNegated: entities.moodNegated,
  };
}
