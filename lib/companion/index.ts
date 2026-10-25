import { classifyIntent } from './nlu';
import { generateReply } from './intents';
import { matchSemantic } from './semantic';
import type { CompanionReply, ConversationState, IntentMatchResult } from './types';
import { createInitialState } from './state';

export * from './types';
export * from './state';
export * from './nlu';
export * from './intents';
export * from './semantic';
export * from './lexicons';

export interface ProcessResult {
  reply: CompanionReply;
  nextState: ConversationState;
  latencyMs: number;
  engineUsed: 'rules' | 'semantic';
}

/**
 * Computes a random typing delay between 400ms and 900ms for natural conversational feel
 */
export function getNaturalTypingDelay(): number {
  return Math.floor(Math.random() * (900 - 400 + 1)) + 400;
}

/**
 * Core companion engine entry point.
 * 1. Checks crisis and injection safety first.
 * 2. If semantic mode is enabled and eligible, queries precomputed semantic index with 300ms budget.
 * 3. Falls back to fast client-side rule/NLU engine.
 * 4. Tracks conversation state, resolves follow-ups, and prevents repeating response variants.
 */
export async function processCompanionMessage(
  query: string,
  state: ConversationState = createInitialState(),
  langCode = 'en',
  useSemantic = false
): Promise<ProcessResult> {
  const startTime = performance.now();
  let engineUsed: 'rules' | 'semantic' = 'rules';

  // Step 1: Run NLU Intent Classifier
  let match: IntentMatchResult = classifyIntent(query, state, langCode);

  // Step 2: If semantic mode is requested and query wasn't high-confidence safety/followup, check semantic index
  if (
    useSemantic &&
    match.intent !== 'crisis' &&
    match.intent !== 'injection' &&
    match.intent !== 'follow_up' &&
    (match.intent === 'clarification' || match.confidence < 0.75)
  ) {
    try {
      const semanticResult = await matchSemantic(query, 300);
      if (semanticResult && semanticResult.confidence > match.confidence) {
        match = {
          intent: semanticResult.intent,
          confidence: semanticResult.confidence,
          entities: {
            bookId: semanticResult.bookId || match.entities.bookId,
            ...match.entities,
          },
          matchedTokens: ['semantic_match'],
        };
        engineUsed = 'semantic';
      }
    } catch {
      // Fallback silently to rule engine
      engineUsed = 'rules';
    }
  }

  // Step 3: Generate reply and compute next state
  const { reply, nextState } = generateReply(match, state, langCode);
  const latencyMs = Math.round(performance.now() - startTime);

  return {
    reply,
    nextState,
    latencyMs,
    engineUsed,
  };
}
