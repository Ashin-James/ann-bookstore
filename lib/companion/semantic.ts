import type { CompanionIntent } from './types';

export interface SemanticMatchResult {
  intent: CompanionIntent;
  bookId?: string;
  confidence: number;
  source: 'semantic';
}

interface IndexData {
  dimension: number;
  vocab: string[];
  books: { id: string; title: string; vector: number[] }[];
  intents: { intent: CompanionIntent; text: string; vector: number[] }[];
}

let cachedIndex: IndexData | null = null;
let loadPromise: Promise<IndexData | null> | null = null;

/**
 * Checks system eligibility per prompt:
 * Load only when navigator.connection.saveData is false and the device has enough memory
 */
export function isSemanticModeEligible(): boolean {
  if (typeof window === 'undefined') return false;

  const nav = navigator as unknown as {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };

  if (nav.connection?.saveData === true) {
    return false;
  }

  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) {
    return false;
  }

  return true;
}

/**
 * Lazy loads the precomputed index and model manifest from self-hosted /models/companion/index.json
 */
export async function loadSemanticIndex(): Promise<IndexData | null> {
  if (cachedIndex) return cachedIndex;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const res = await fetch('/models/companion/index.json');
      if (!res.ok) {
        return null;
      }
      const data: IndexData = await res.json();
      cachedIndex = data;
      return data;
    } catch {
      return null;
    }
  })();

  return loadPromise;
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dot = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
  }
  return dot;
}

function embedQuery(query: string, vocab: string[]): number[] {
  const words = query.toLowerCase().match(/[a-z0-9]{2,}/g) || [];
  const vec = new Float32Array(vocab.length);
  const vocabMap = new Map<string, number>();
  for (let i = 0; i < vocab.length; i++) {
    vocabMap.set(vocab[i], i);
  }

  for (const w of words) {
    const idx = vocabMap.get(w);
    if (idx !== undefined) {
      vec[idx] += 1.0;
    }
  }

  let norm = 0;
  for (let i = 0; i < vec.length; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < vec.length; i++) vec[i] = vec[i] / norm;
  }

  return Array.from(vec);
}

/**
 * Performs fast cosine similarity retrieval against precomputed intent examples and book descriptions.
 * Enforces a strict 300ms budget; returns null on timeout or error to fall back to the rule engine.
 */
export async function matchSemantic(
  query: string,
  timeoutMs = 300
): Promise<SemanticMatchResult | null> {
  const matchExecution = async (): Promise<SemanticMatchResult | null> => {
    const index = await loadSemanticIndex();
    if (!index || !index.vocab || !index.intents) {
      return null;
    }

    const queryVec = embedQuery(query, index.vocab);
    let bestIntent: CompanionIntent | null = null;
    let highestIntentScore = 0;

    for (const item of index.intents) {
      const score = cosineSimilarity(queryVec, item.vector);
      if (score > highestIntentScore) {
        highestIntentScore = score;
        bestIntent = item.intent;
      }
    }

    let bestBookId: string | undefined;
    let highestBookScore = 0;
    for (const b of index.books) {
      const score = cosineSimilarity(queryVec, b.vector);
      if (score > highestBookScore) {
        highestBookScore = score;
        bestBookId = b.id;
      }
    }

    if (highestIntentScore > 0.45 && bestIntent) {
      return {
        intent: bestIntent,
        bookId: highestBookScore > 0.5 ? bestBookId : undefined,
        confidence: Math.min(1.0, highestIntentScore),
        source: 'semantic',
      };
    }

    return null;
  };

  const timeoutPromise = new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), timeoutMs)
  );

  return Promise.race([matchExecution(), timeoutPromise]);
}
