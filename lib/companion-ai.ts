import {
  processCompanionMessage,
  createInitialState,
  getNaturalTypingDelay,
  isSemanticModeEligible,
  loadSemanticIndex,
  type ConversationState,
  type ProcessResult,
} from './companion';
import type { Book } from '@/data/books';

export type AIStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface AIProgress {
  status: AIStatus;
  progress: number;
  message: string;
}

export interface CompanionResponse {
  text: string;
  suggestedBooks?: Book[];
  actionLinks?: { label: string; href: string }[];
  suggestedQueries?: string[];
  bookToAddToCart?: { bookId: string; formatId: string };
  isCrisis?: boolean;
  intent?: string;
}

class CompanionAIService {
  private isModelReady = false;
  private isLoading = false;
  private progressListeners: ((progress: AIProgress) => void)[] = [];
  private sessionState: ConversationState = createInitialState();
  private hasFirstMessageSent = false;

  public onProgress(callback: (progress: AIProgress) => void) {
    this.progressListeners.push(callback);
    return () => {
      this.progressListeners = this.progressListeners.filter((cb) => cb !== callback);
    };
  }

  private notifyProgress(progress: AIProgress) {
    this.progressListeners.forEach((cb) => cb(progress));
  }

  public resetSession() {
    this.sessionState = createInitialState();
    this.hasFirstMessageSent = false;
  }

  public getState(): ConversationState {
    return this.sessionState;
  }

  /**
   * Lazily loads semantic embeddings index after first message if device is eligible
   */
  public async maybeLazyLoadSemanticMode(): Promise<boolean> {
    if (this.isModelReady || this.isLoading) return this.isModelReady;
    if (!isSemanticModeEligible()) return false;

    this.isLoading = true;
    this.notifyProgress({
      status: 'loading',
      progress: 30,
      message: 'Loading quantized literary embeddings...',
    });

    try {
      const index = await loadSemanticIndex();
      if (index) {
        this.isModelReady = true;
        this.isLoading = false;
        this.notifyProgress({
          status: 'ready',
          progress: 100,
          message: 'Offline semantic mode active.',
        });
        return true;
      }
      throw new Error('Index could not be loaded');
    } catch {
      this.isLoading = false;
      this.notifyProgress({
        status: 'error',
        progress: 0,
        message: 'Using fast client-side rules engine.',
      });
      return false;
    }
  }

  /**
   * Generates response using NLU engine, respecting natural typing delay and language
   */
  public async generateReply(
    query: string,
    useSemantic = false,
    langCode = 'en'
  ): Promise<CompanionResponse> {
    // If first message, trigger lazy-load in background for subsequent turns if eligible
    if (!this.hasFirstMessageSent) {
      this.hasFirstMessageSent = true;
      if (useSemantic || isSemanticModeEligible()) {
        this.maybeLazyLoadSemanticMode().catch(() => {});
      }
    }

    const result: ProcessResult = await processCompanionMessage(
      query,
      this.sessionState,
      langCode,
      useSemantic && this.isModelReady
    );

    // Update conversation state in session
    this.sessionState = result.nextState;

    return {
      text: result.reply.text,
      suggestedBooks: result.reply.suggestedBooks,
      actionLinks: result.reply.actionLinks,
      suggestedQueries: result.reply.chips?.map((c) => c.query || c.label),
      bookToAddToCart: result.reply.bookToAddToCart,
      isCrisis: result.reply.isCrisis,
      intent: result.reply.intent,
    };
  }

  public getNaturalDelay(): number {
    return getNaturalTypingDelay();
  }

  public getReadyStatus(): boolean {
    return this.isModelReady;
  }
}

export const companionAI = new CompanionAIService();
