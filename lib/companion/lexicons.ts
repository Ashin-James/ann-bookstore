import en from '@/data/companion/lexicon.en.json';
import es from '@/data/companion/lexicon.es.json';
import fr from '@/data/companion/lexicon.fr.json';
import de from '@/data/companion/lexicon.de.json';
import ptBR from '@/data/companion/lexicon.pt-BR.json';
import it from '@/data/companion/lexicon.it.json';
import hi from '@/data/companion/lexicon.hi.json';
import ml from '@/data/companion/lexicon.ml.json';
import ta from '@/data/companion/lexicon.ta.json';
import ar from '@/data/companion/lexicon.ar.json';
import zhHans from '@/data/companion/lexicon.zh-Hans.json';
import ja from '@/data/companion/lexicon.ja.json';
import ko from '@/data/companion/lexicon.ko.json';
import ru from '@/data/companion/lexicon.ru.json';

export interface LexiconData {
  code: string;
  negations: string[];
  moods: Record<string, string[]>;
  preferences: {
    length: Record<string, string[]>;
    format: Record<string, string[]>;
    genre: Record<string, string[]>;
  };
  books: Record<string, string[]>;
  intents: Record<string, string[]>;
  clarifying_question: string;
  chips: Record<string, string>;
  unsupported_notice?: string;
}

const lexicons: Record<string, LexiconData> = {
  en: en as unknown as LexiconData,
  es: es as unknown as LexiconData,
  fr: fr as unknown as LexiconData,
  de: de as unknown as LexiconData,
  'pt-BR': ptBR as unknown as LexiconData,
  it: it as unknown as LexiconData,
  hi: hi as unknown as LexiconData,
  ml: ml as unknown as LexiconData,
  ta: ta as unknown as LexiconData,
  ar: ar as unknown as LexiconData,
  'zh-Hans': zhHans as unknown as LexiconData,
  ja: ja as unknown as LexiconData,
  ko: ko as unknown as LexiconData,
  ru: ru as unknown as LexiconData,
};

export function getLexicon(langCode = 'en'): LexiconData {
  const norm = (langCode || 'en').trim();
  if (lexicons[norm]) return lexicons[norm];
  const prefix = norm.split('-')[0];
  if (lexicons[prefix]) return lexicons[prefix];
  return lexicons.en;
}
