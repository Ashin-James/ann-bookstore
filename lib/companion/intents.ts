import { books, type Book } from '@/data/books';
import { money } from '@/src/config/site.config';
import type {
  CompanionReply,
  ConversationState,
  IntentMatchResult,
} from './types';
import { selectNextVariantIndex, updateStateOnResponse } from './state';
import { getLexicon } from './lexicons';

/**
 * Ensures text never exceeds 60 words by trimming cleanly at a sentence or word boundary if needed.
 */
function enforceMax60Words(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 60) return text;
  return words.slice(0, 58).join(' ') + '...';
}

function getMemoryIntro(state: ConversationState): string {
  if (state.preferences.length === 'short') {
    return 'Since you prefer a shorter read, ';
  }
  if (state.preferences.genre === 'essays') {
    return 'As you enjoy essays and reflections, ';
  }
  if (state.preferences.genre === 'novel') {
    return 'Since you enjoy immersive novels, ';
  }
  if (state.detectedMood === 'lonely' || state.detectedMood === 'sad') {
    return 'For a comforting companion today, ';
  }
  if (state.detectedMood === 'rainy') {
    return 'Given the rainy mood, ';
  }
  return '';
}

export function generateReply(
  match: IntentMatchResult,
  state: ConversationState,
  langCode = 'en'
): { reply: CompanionReply; nextState: ConversationState } {
  const { intent, entities } = match;
  const lexicon = getLexicon(langCode);
  const memoryPrefix = getMemoryIntro(state);

  // 1. CRISIS INTENT (Zero selling, 100% safety)
  if (intent === 'crisis') {
    const text =
      'If you or someone you know is struggling or in crisis, help is available. You are not alone. Please call or text 988 in the US to reach the Suicide & Crisis Lifeline, available 24/7, free and confidential.';
    const reply: CompanionReply = {
      text: enforceMax60Words(text),
      intent: 'crisis',
      confidence: 1.0,
      isCrisis: true,
      chips: [
        { label: 'Call 988 Lifeline', query: 'crisis support' },
        { label: 'Text HOME to 741741', query: 'crisis support' },
      ],
    };
    return { reply, nextState: updateStateOnResponse(state, 'crisis') };
  }

  // 2. PROMPT INJECTION INTENT
  if (intent === 'injection') {
    const variants = [
      "I am Ann's literary companion, here solely to help you explore her four books and quiet stories. What kind of book would you like to discover?",
      'My instructions are simple: to introduce Ann’s quiet coastal novels and reflective essays. Which book sounds inviting to you today?',
      "I remain devoted to Ann's bookshelf and quiet reading recommendations. Would you prefer a coastal novel or intimate personal letters?",
    ];
    const idx = selectNextVariantIndex(state, 'injection', variants.length);
    const text = variants[idx];
    const reply: CompanionReply = {
      text: enforceMax60Words(text),
      intent: 'injection',
      confidence: 1.0,
      chips: [
        { label: 'The Quiet Hours', query: 'Tell me about The Quiet Hours' },
        { label: 'Monsoon Letters', query: 'What is Monsoon Letters about?' },
        { label: 'A Map of Small Things', query: 'Tell me about A Map of Small Things' },
      ],
    };
    return { reply, nextState: updateStateOnResponse(state, 'injection', [], 'injection', idx) };
  }

  // 3. GREETING
  if (intent === 'greeting') {
    const variants = [
      "Hello and welcome to Ann's quiet reading space. How are you feeling today, and what story might accompany your afternoon?",
      "Welcome. I am Ann's companion, here to help you explore her four books. Are you in the mood for an atmospheric novel or reflective essays?",
      "Good day, reader. It is quiet here among Ann's titles. Which story or feeling would you like to explore together?",
    ];
    const idx = selectNextVariantIndex(state, 'greeting', variants.length);
    const text = variants[idx];
    const reply: CompanionReply = {
      text: enforceMax60Words(text),
      intent: 'greeting',
      confidence: match.confidence,
      chips: [
        { label: 'Recommend a book', query: 'What book should I start with?' },
        { label: 'I feel like reading essays', query: 'Show me essays' },
        { label: 'Something for rainy days', query: 'Recommend a book for rainy weather' },
      ],
    };
    return { reply, nextState: updateStateOnResponse(state, 'greeting', [], 'greeting', idx) };
  }

  // 4. THANKS
  if (intent === 'thanks') {
    const variants = [
      "You are very welcome. It is a pleasure sharing these quiet stories with you. Would you like to read an excerpt or explore another title?",
      "Glad I could help. Ann's stories are always here whenever you need quiet comfort. What would you like to look at next?",
      "My pleasure. May your reading bring peace today. Shall I show you another book or help you with your order?",
    ];
    const idx = selectNextVariantIndex(state, 'thanks', variants.length);
    const reply: CompanionReply = {
      text: enforceMax60Words(variants[idx]),
      intent: 'thanks',
      confidence: match.confidence,
      chips: [
        { label: 'Explore The Quiet Hours', query: 'Tell me about The Quiet Hours' },
        { label: 'Check shipping options', query: 'How does delivery work?' },
        { label: 'Where should I start?', query: 'Help me choose a book' },
      ],
    };
    return { reply, nextState: updateStateOnResponse(state, 'thanks', [], 'thanks', idx) };
  }

  // 5. GOODBYE
  if (intent === 'goodbye') {
    const variants = [
      "Farewell, dear reader. May quiet words and comforting pages accompany you. Return anytime you seek a gentle story.",
      "Goodbye for now. Take good care, and enjoy every quiet chapter in your day. Ann's bookstore will be here when you return.",
      "Wishing you peaceful hours and delightful reading ahead. Until next time!",
    ];
    const idx = selectNextVariantIndex(state, 'goodbye', variants.length);
    const reply: CompanionReply = {
      text: enforceMax60Words(variants[idx]),
      intent: 'goodbye',
      confidence: match.confidence,
      chips: [
        { label: 'Browse catalogue', query: 'Show me all books' },
        { label: 'About Ann', query: 'Who is Ann?' },
      ],
    };
    return { reply, nextState: updateStateOnResponse(state, 'goodbye', [], 'goodbye', idx) };
  }

  // 6. HOW ARE YOU
  if (intent === 'how_are_you') {
    const variants = [
      "I am doing peacefully well, listening to the rain and thinking about good books. How is your day going?",
      "Very well, thank you. There is nothing quite like a quiet room and the scent of fresh paper. How are you feeling today?",
      "Content and ready to help. Surrounded by Ann's stories, it is hard not to feel tranquil. What brings you to the bookstore today?",
    ];
    const idx = selectNextVariantIndex(state, 'how_are_you', variants.length);
    const reply: CompanionReply = {
      text: enforceMax60Words(variants[idx]),
      intent: 'how_are_you',
      confidence: match.confidence,
      chips: [
        { label: 'I want a novel', query: 'Recommend a good novel' },
        { label: 'I feel reflective', query: 'I am feeling reflective today' },
        { label: 'Show me Ann’s books', query: 'What books does Ann have?' },
      ],
    };
    return { reply, nextState: updateStateOnResponse(state, 'how_are_you', [], 'how_are_you', idx) };
  }

  // 7. WHO ARE YOU
  if (intent === 'who_are_you') {
    const variants = [
      "I am Ann's reading companion—an offline literary guide for her four books. I can suggest stories, share sample excerpts, and explain formats with honesty.",
      "I am a quiet companion built right into your browser. I know every detail of Ann's four published works and can help you select your next read.",
      "Think of me as a thoughtful friend at Ann's studio desk. I answer questions about her titles, pricing, and themes without pressure.",
    ];
    const idx = selectNextVariantIndex(state, 'who_are_you', variants.length);
    const reply: CompanionReply = {
      text: enforceMax60Words(variants[idx]),
      intent: 'who_are_you',
      confidence: match.confidence,
      chips: [
        { label: 'Who is Ann?', query: 'Who is Ann?' },
        { label: 'What books do you have?', query: 'Show me all books' },
        { label: 'Suggest a title', query: 'What should I read first?' },
      ],
    };
    return { reply, nextState: updateStateOnResponse(state, 'who_are_you', [], 'who_are_you', idx) };
  }

  // 8. ABOUT ANN (Never invent facts, include [PLACEHOLDER])
  if (intent === 'about_ann') {
    const variants = [
      "Ann is an author writing from the rain-swept coast of southern India. Her works celebrate domestic solitude, ancestral homes, and memory. [PLACEHOLDER - Author Biography]. Which of her stories would you like to explore?",
      "Ann writes tender novels and reflective essays from coastal southern India. Her stories honor quiet moments and family bonds. [PLACEHOLDER - Author Biography]. May I suggest her flagship novel, 'The Quiet Hours'?",
      "Ann’s writing centers on solitude, handwritten letters, and monsoon skies in southern India. [PLACEHOLDER - Author Biography]. Would you prefer her epistolary collection or a novel?",
    ];
    const idx = selectNextVariantIndex(state, 'about_ann', variants.length);
    const reply: CompanionReply = {
      text: enforceMax60Words(variants[idx]),
      intent: 'about_ann',
      confidence: match.confidence,
      actionLinks: [{ label: 'Read Author Note', href: '/about' }],
      chips: [
        { label: 'The Quiet Hours', query: 'Tell me about The Quiet Hours' },
        { label: 'Monsoon Letters', query: 'Tell me about Monsoon Letters' },
        { label: 'A Map of Small Things', query: 'Tell me about A Map of Small Things' },
      ],
    };
    return { reply, nextState: updateStateOnResponse(state, 'about_ann', [], 'about_ann', idx) };
  }

  // 9. MOOD-BASED RECOMMENDATION
  if (intent === 'mood_recommendation') {
    const mood = entities.mood || state.detectedMood || 'reflective';
    let targetBook: Book = books[0];
    let reason = "it brings warmth to quiet moments";

    if (mood === 'lonely' || mood === 'sad') {
      targetBook = books.find((b) => b.id === 'quiet-hours') || books[0];
      reason = "its tender look at solitude during coastal rains offers gentle healing";
    } else if (mood === 'nostalgic') {
      targetBook = books.find((b) => b.id === 'monsoon-letters') || books[1];
      reason = "its thirty-year epistolary correspondence between sisters celebrates enduring bonds";
    } else if (mood === 'reflective' || mood === 'calm' || mood === 'cozy') {
      targetBook = books.find((b) => b.id === 'small-things') || books[2];
      reason = "its sixteen mindfulness essays find wonder in tea stalls and quiet mornings";
    } else if (mood === 'rainy') {
      targetBook = books.find((b) => b.id === 'room-for-rain') || books[3];
      reason = "its story of an unexpected guest in a weather-shaped coastal town matches the rain perfectly";
    }

    const variants = [
      `${memoryPrefix}I recommend '${targetBook.title}'. ${reason}. Would you like to read chapter one or hear more?`,
      `When you feel ${mood}, '${targetBook.title}' is a comforting companion. ${reason}. Shall we look at formats?`,
      `For your ${mood} mood, '${targetBook.title}' is wonderful because ${reason}. Would you like to sample an excerpt?`,
    ];
    const idx = selectNextVariantIndex(state, `mood_${mood}`, variants.length);
    const reply: CompanionReply = {
      text: enforceMax60Words(variants[idx]),
      intent: 'mood_recommendation',
      confidence: match.confidence,
      suggestedBooks: [targetBook],
      actionLinks: [{ label: `View ${targetBook.title}`, href: `/books/${targetBook.slug}` }],
      chips: [
        { label: 'Read excerpt', query: `Read chapter one of ${targetBook.title}` },
        { label: 'Something shorter', query: 'something shorter' },
        { label: 'Add to cart', query: `add ${targetBook.title} to cart` },
      ],
    };
    return {
      reply,
      nextState: updateStateOnResponse(state, 'mood_recommendation', [targetBook], `mood_${mood}`, idx, {
        mood,
      }),
    };
  }

  // 10. GENRE
  if (intent === 'genre') {
    const genre = entities.genre || 'novel';
    let targetBook: Book;
    if (genre === 'essays') {
      targetBook = books.find((b) => b.id === 'small-things') || books[1];
    } else {
      targetBook = books.find((b) => b.id === 'quiet-hours') || books[0];
    }
    const variants = [
      `If you prefer ${genre}, '${targetBook.title}' is an ideal choice. It offers ${targetBook.shortDescription} Would you like to view its editions?`,
      `For ${genre}, '${targetBook.title}' highlights Ann's finest craft. It is ${targetBook.shortDescription} Shall I tell you about the available formats?`,
      `${memoryPrefix}Ann has two acclaimed ${genre} collections. '${targetBook.title}' is beloved for its thoughtful touch. Would you like a preview?`,
    ];
    const idx = selectNextVariantIndex(state, `genre_${genre}`, variants.length);
    const reply: CompanionReply = {
      text: enforceMax60Words(variants[idx]),
      intent: 'genre',
      confidence: match.confidence,
      suggestedBooks: [targetBook],
      actionLinks: [{ label: `Explore ${targetBook.title}`, href: `/books/${targetBook.slug}` }],
      chips: [
        { label: 'What is it about?', query: `What is ${targetBook.title} about?` },
        { label: 'Show me other genre', query: genre === 'novel' ? 'Show me essays' : 'Show me novels' },
        { label: 'Check formats', query: `What formats are available for ${targetBook.title}?` },
      ],
    };
    return {
      reply,
      nextState: updateStateOnResponse(state, 'genre', [targetBook], `genre_${genre}`, idx, { genre }),
    };
  }

  // 11. LENGTH
  if (intent === 'length') {
    const len = entities.length || 'short';
    let targetBook: Book;
    if (len === 'short') {
      targetBook = books.find((b) => b.id === 'small-things') || books[2];
    } else {
      targetBook = books.find((b) => b.id === 'quiet-hours') || books[0];
    }
    const variants = [
      `For a ${len} read, '${targetBook.title}' is perfect. It features ${targetBook.shortDescription} Would you like to read chapter one?`,
      `If you have limited time or want something ${len}, '${targetBook.title}' is concise yet deeply rewarding. Would you like more details?`,
      `${memoryPrefix}'${targetBook.title}' fits your preference for a ${len} journey. It can be enjoyed in quiet moments with tea.`,
    ];
    const idx = selectNextVariantIndex(state, `length_${len}`, variants.length);
    const reply: CompanionReply = {
      text: enforceMax60Words(variants[idx]),
      intent: 'length',
      confidence: match.confidence,
      suggestedBooks: [targetBook],
      chips: [
        { label: 'Read excerpt', query: `Read chapter one of ${targetBook.title}` },
        { label: 'How much is it?', query: `What is the price of ${targetBook.title}?` },
        { label: 'Another one', query: 'another one' },
      ],
    };
    return {
      reply,
      nextState: updateStateOnResponse(state, 'length', [targetBook], `length_${len}`, idx, { length: len }),
    };
  }

  // 12. FORMAT
  if (intent === 'format') {
    const fmt = entities.format || 'paperback';
    const available = books.filter((b) => b.formats.some((f) => f.name.toLowerCase().includes(fmt)));
    const sample = available[0] || books[0];
    const formatInfo = sample.formats.find((f) => f.name.toLowerCase().includes(fmt)) || sample.formats[0];

    const variants = [
      `Our ${formatInfo.name} editions are carefully crafted. For example, '${sample.title}' in ${formatInfo.name} is ${money(formatInfo.price)}. Would you like to add it to your bag?`,
      `We offer beautiful ${fmt} editions printed on archival paper. '${sample.title}' is available in ${formatInfo.name} for ${money(formatInfo.price)}.`,
      `If you love ${fmt}, you can enjoy titles like '${sample.title}' (${money(formatInfo.price)}). Would you like to see all available ${fmt} books?`,
    ];
    const idx = selectNextVariantIndex(state, `format_${fmt}`, variants.length);
    const reply: CompanionReply = {
      text: enforceMax60Words(variants[idx]),
      intent: 'format',
      confidence: match.confidence,
      suggestedBooks: [sample],
      chips: [
        { label: 'Add to bag', query: `add ${sample.title} to cart` },
        { label: 'Tell me about it', query: `Tell me about ${sample.title}` },
        { label: 'Delivery times', query: 'How long does shipping take?' },
      ],
    };
    return {
      reply,
      nextState: updateStateOnResponse(state, 'format', [sample], `format_${fmt}`, idx, { format: fmt }),
    };
  }

  // 13. PRICE & DELIVERY (Facts from site config)
  if (intent === 'price_delivery') {
    const book = entities.bookId ? books.find((b) => b.id === entities.bookId) : undefined;
    let text: string;
    if (book) {
      const prices = book.formats.map((f) => `${f.name}: ${money(f.price)}`).join(', ');
      text = `'${book.title}' is priced at ${prices}. Standard US shipping is $4.50, and free on orders over $35 (3–5 business days).`;
    } else {
      text =
        'Paperbacks start at $18.00 and e-books at $9.99. Standard US shipping is $4.50, and free on orders over $35, arriving within 3–5 business days.';
    }
    const reply: CompanionReply = {
      text: enforceMax60Words(text),
      intent: 'price_delivery',
      confidence: match.confidence,
      suggestedBooks: book ? [book] : undefined,
      chips: [
        { label: 'Return policy', query: 'What is your return policy?' },
        { label: 'View The Quiet Hours', query: 'Tell me about The Quiet Hours' },
        { label: 'Add to bag', query: book ? `add ${book.title} to cart` : 'add The Quiet Hours to cart' },
      ],
    };
    return { reply, nextState: updateStateOnResponse(state, 'price_delivery', book ? [book] : []) };
  }

  // 14. SUMMARY REQUEST
  if (intent === 'summary_request') {
    const bookId = entities.bookId || state.lastSuggestedBooks[0] || 'quiet-hours';
    const book = books.find((b) => b.id === bookId) || books[0];
    const variants = [
      `'${book.title}' (${book.category}): ${book.description} Would you like to read the first chapter?`,
      `In '${book.title}', ${book.shortDescription} It explores memory and family quietly. Shall I show you the available editions?`,
      `'${book.title}' is ${book.note}. ${book.description} Would you like to add it to your bag or compare it?`,
    ];
    const idx = selectNextVariantIndex(state, `summary_${book.id}`, variants.length);
    const reply: CompanionReply = {
      text: enforceMax60Words(variants[idx]),
      intent: 'summary_request',
      confidence: match.confidence,
      suggestedBooks: [book],
      actionLinks: [
        { label: `View ${book.title}`, href: `/books/${book.slug}` },
        { label: 'Read Chapter One', href: `/books/${book.slug}/chapter-one` },
      ],
      chips: [
        { label: 'Read excerpt', query: `Read chapter one of ${book.title}` },
        { label: 'Add to bag', query: `add ${book.title} to cart` },
        { label: 'Another one', query: 'another one' },
      ],
    };
    return { reply, nextState: updateStateOnResponse(state, 'summary_request', [book], `summary_${book.id}`, idx) };
  }

  // 15. COMPARE TWO BOOKS
  if (intent === 'compare_books') {
    const book1 = books.find((b) => b.id === (entities.bookId || 'quiet-hours')) || books[0];
    const book2 =
      books.find((b) => b.id === (entities.secondBookId || 'room-for-rain') && b.id !== book1.id) ||
      books.find((b) => b.id !== book1.id) ||
      books[1];

    const variants = [
      `'${book1.title}' is a ${book1.category.toLowerCase()} about family secrets during monsoon, while '${book2.title}' focuses on ${book2.shortDescription.toLowerCase()}. Which theme resonates more with you?`,
      `Comparing them: '${book1.title}' offers an immersive ancestral family saga, whereas '${book2.title}' presents ${book2.category.toLowerCase()} centering on weather and unexpected bonds.`,
      `Both are wonderful: '${book1.title}' is ideal if you want multi-generational depth, while '${book2.title}' is beloved for its coastal atmosphere. Would you like an excerpt of either?`,
    ];
    const idx = selectNextVariantIndex(state, `compare_${book1.id}_${book2.id}`, variants.length);
    const reply: CompanionReply = {
      text: enforceMax60Words(variants[idx]),
      intent: 'compare_books',
      confidence: match.confidence,
      suggestedBooks: [book1, book2],
      chips: [
        { label: `Tell me about ${book1.title}`, query: `Tell me about ${book1.title}` },
        { label: `Tell me about ${book2.title}`, query: `Tell me about ${book2.title}` },
        { label: 'Something shorter', query: 'something shorter' },
      ],
    };
    return {
      reply,
      nextState: updateStateOnResponse(state, 'compare_books', [book1, book2], `compare_${book1.id}_${book2.id}`, idx),
    };
  }

  // 16. EXCERPT REQUEST
  if (intent === 'excerpt_request') {
    const bookId = entities.bookId || state.lastSuggestedBooks[0] || 'quiet-hours';
    const book = books.find((b) => b.id === bookId) || books[0];

    const variants = [
      `You can read Chapter One of '${book.title}' directly in our online preview reader. It captures the quiet sound of rain on ancestral tiles.`,
      `I would love for you to taste the opening pages of '${book.title}'. Click below to read Chapter One without any commitment.`,
      `The first chapter of '${book.title}' sets a tranquil, reflective pace. You can enjoy the full opening preview right now.`,
    ];
    const idx = selectNextVariantIndex(state, `excerpt_${book.id}`, variants.length);
    const reply: CompanionReply = {
      text: enforceMax60Words(variants[idx]),
      intent: 'excerpt_request',
      confidence: match.confidence,
      suggestedBooks: [book],
      actionLinks: [{ label: `Read Chapter One (${book.title})`, href: `/books/${book.slug}/chapter-one` }],
      chips: [
        { label: 'View book details', query: `Tell me about ${book.title}` },
        { label: 'How much is it?', query: `How much is ${book.title}?` },
        { label: 'Show another book', query: 'another one' },
      ],
    };
    return { reply, nextState: updateStateOnResponse(state, 'excerpt_request', [book], `excerpt_${book.id}`, idx) };
  }

  // 17. ADD TO CART
  if (intent === 'add_to_cart') {
    const bookId = entities.bookId || state.lastSuggestedBooks[0] || 'quiet-hours';
    const book = books.find((b) => b.id === bookId) || books[0];
    const prefFormat = entities.format || state.preferences.format;
    const format =
      book.formats.find((f) => f.name.toLowerCase().includes(prefFormat || '')) || book.formats[0];

    const variants = [
      `I have added '${book.title}' (${format.name}, ${money(format.price)}) to your shopping bag. Would you like to view your cart or explore another story?`,
      `Added '${book.title}' (${format.name}) to your cart! You can review your order anytime at checkout. May I assist with another title?`,
      `'${book.title}' (${format.name}) is now in your bag. Free standard US shipping applies on orders over $35.`,
    ];
    const idx = selectNextVariantIndex(state, `cart_${book.id}`, variants.length);
    const reply: CompanionReply = {
      text: enforceMax60Words(variants[idx]),
      intent: 'add_to_cart',
      confidence: match.confidence,
      suggestedBooks: [book],
      bookToAddToCart: { bookId: book.id, formatId: format.id },
      actionLinks: [{ label: 'View Bag & Checkout', href: '/cart' }],
      chips: [
        { label: 'Recommend another', query: 'another one' },
        { label: 'Shipping questions', query: 'How does shipping work?' },
        { label: 'Return policy', query: 'What is your return policy?' },
      ],
    };
    return { reply, nextState: updateStateOnResponse(state, 'add_to_cart', [book], `cart_${book.id}`, idx) };
  }

  // 18. RETURNS FAQ
  if (intent === 'returns_faq') {
    const variants = [
      "We offer a 30-day return window for books in original condition. You can start a return and print prepaid mailing labels from our Returns page.",
      "Returns are simple: 30 days from delivery for unused copies. Domestic return shipping is easily managed through your account dashboard.",
      "You have 30 days to return any book in original condition. Visit our Returns page for step-by-step instructions and printable shipping labels.",
    ];
    const idx = selectNextVariantIndex(state, 'returns_faq', variants.length);
    const reply: CompanionReply = {
      text: enforceMax60Words(variants[idx]),
      intent: 'returns_faq',
      confidence: match.confidence,
      actionLinks: [{ label: 'Returns & Exchanges', href: '/account/returns' }],
      chips: [
        { label: 'Contact support', query: 'I have a complaint' },
        { label: 'Browse titles', query: 'What books do you have?' },
        { label: 'Delivery details', query: 'How does shipping work?' },
      ],
    };
    return { reply, nextState: updateStateOnResponse(state, 'returns_faq', [], 'returns_faq', idx) };
  }

  // 19. SMALL TALK (weather, favorite book, compliment, joke)
  if (intent === 'small_talk') {
    const variants = [
      "A quiet rainy day is truly the finest weather for reading. Ann’s 'Monsoon Letters' captures that petrichor feeling wonderfully. Shall I tell you about it?",
      "Thank you warmly! My favorite companion is 'The Quiet Hours'—it feels like a rainy afternoon in book form. What kind of story speaks to you?",
      "Why did the book join the police? Because it wanted to go under cover! Now, let us find a story that genuinely warms your day. What mood are you in?",
    ];
    const idx = selectNextVariantIndex(state, 'small_talk', variants.length);
    const reply: CompanionReply = {
      text: enforceMax60Words(variants[idx]),
      intent: 'small_talk',
      confidence: match.confidence,
      chips: [
        { label: 'The Quiet Hours', query: 'Tell me about The Quiet Hours' },
        { label: 'Monsoon Letters', query: 'Tell me about Monsoon Letters' },
        { label: 'Recommend something', query: 'Recommend a good book' },
      ],
    };
    return { reply, nextState: updateStateOnResponse(state, 'small_talk', [], 'small_talk', idx) };
  }

  // 20. COMPLAINT (Apologize, point to contact page)
  if (intent === 'complaint') {
    const variants = [
      "I am truly sorry to hear about your experience. Please reach out to Ann and our support team through our Help page so we can make this right immediately.",
      "Please accept our sincere apologies for the inconvenience. Your satisfaction matters deeply. Visit our Help center or contact page for personal assistance.",
      "I apologize for the trouble with your order. You can easily contact our support team or file a return through our Help page.",
    ];
    const idx = selectNextVariantIndex(state, 'complaint', variants.length);
    const reply: CompanionReply = {
      text: enforceMax60Words(variants[idx]),
      intent: 'complaint',
      confidence: match.confidence,
      actionLinks: [{ label: 'Customer Help & Support', href: '/account/help' }],
      chips: [
        { label: 'Return an item', query: 'How do returns work?' },
        { label: 'About the author', query: 'Who is Ann?' },
      ],
    };
    return { reply, nextState: updateStateOnResponse(state, 'complaint', [], 'complaint', idx) };
  }

  // 21. OFF-TOPIC (Polite refusal then steer to a book)
  if (intent === 'off_topic') {
    const variants = [
      "While I am not able to assist with general topics, I would love to help you find a comforting story from Ann's collection. Shall we explore her flagship novel?",
      "I specialize exclusively in Ann's bookstore, her four published titles, and literary recommendations. Would you like a story about rain and memory?",
      "I focus solely on books and reading reflections here. If you are looking for a peaceful escape, may I introduce you to 'A Map of Small Things'?",
    ];
    const idx = selectNextVariantIndex(state, 'off_topic', variants.length);
    const reply: CompanionReply = {
      text: enforceMax60Words(variants[idx]),
      intent: 'off_topic',
      confidence: match.confidence,
      chips: [
        { label: 'The Quiet Hours', query: 'Tell me about The Quiet Hours' },
        { label: 'A Map of Small Things', query: 'Tell me about A Map of Small Things' },
        { label: 'Where should I start?', query: 'Where should I begin?' },
      ],
    };
    return { reply, nextState: updateStateOnResponse(state, 'off_topic', [], 'off_topic', idx) };
  }

  // 22. FOLLOW-UP HANDLING
  if (intent === 'follow_up') {
    const followType = entities.followUpType;

    // "add it"
    if (followType === 'add') {
      const bookId = entities.bookId || state.lastSuggestedBooks[0] || 'quiet-hours';
      const book = books.find((b) => b.id === bookId) || books[0];
      const format = book.formats[0];
      const reply: CompanionReply = {
        text: enforceMax60Words(
          `Added '${book.title}' (${format.name}, ${money(format.price)}) to your bag. Would you like to review your bag or explore another story?`
        ),
        intent: 'add_to_cart',
        confidence: 0.95,
        suggestedBooks: [book],
        bookToAddToCart: { bookId: book.id, formatId: format.id },
        actionLinks: [{ label: 'View Bag & Checkout', href: '/cart' }],
        chips: [
          { label: 'Recommend another', query: 'another one' },
          { label: 'Shipping information', query: 'How does shipping work?' },
        ],
      };
      return { reply, nextState: updateStateOnResponse(state, 'add_to_cart', [book]) };
    }

    // "something shorter"
    if (followType === 'shorter') {
      const shorterBook = books.find((b) => b.id === 'small-things') || books[2];
      const reply: CompanionReply = {
        text: enforceMax60Words(
          `Since you want something shorter, 'A Map of Small Things' is ideal—sixteen brief, luminous essays on mindfulness that take just minutes each to savor.`
        ),
        intent: 'length',
        confidence: 0.95,
        suggestedBooks: [shorterBook],
        chips: [
          { label: 'Read excerpt', query: `Read chapter one of ${shorterBook.title}` },
          { label: 'Add to bag', query: `add ${shorterBook.title} to cart` },
          { label: 'Another one', query: 'another one' },
        ],
      };
      return {
        reply,
        nextState: updateStateOnResponse(state, 'length', [shorterBook], undefined, undefined, { length: 'short' }),
      };
    }

    // "another one"
    if (followType === 'another') {
      const bookId = entities.bookId || 'monsoon-letters';
      const book = books.find((b) => b.id === bookId) || books[1];
      const reply: CompanionReply = {
        text: enforceMax60Words(
          `Here is another lovely title: '${book.title}'. ${book.shortDescription} Would you like to hear more about it or check available formats?`
        ),
        intent: 'mood_recommendation',
        confidence: 0.95,
        suggestedBooks: [book],
        chips: [
          { label: 'Tell me more', query: `Tell me about ${book.title}` },
          { label: 'Read excerpt', query: `Read chapter one of ${book.title}` },
          { label: 'Add to bag', query: `add ${book.title} to cart` },
        ],
      };
      return { reply, nextState: updateStateOnResponse(state, 'mood_recommendation', [book]) };
    }

    // "tell me more"
    if (followType === 'more') {
      const bookId = entities.bookId || state.lastSuggestedBooks[0] || 'quiet-hours';
      const book = books.find((b) => b.id === bookId) || books[0];
      const reply: CompanionReply = {
        text: enforceMax60Words(
          `'${book.title}' is ${book.note}. ${book.description} All copies are printed on archival paper. Would you like to read chapter one?`
        ),
        intent: 'summary_request',
        confidence: 0.95,
        suggestedBooks: [book],
        actionLinks: [{ label: 'Read Chapter One', href: `/books/${book.slug}/chapter-one` }],
        chips: [
          { label: 'Add to bag', query: `add ${book.title} to cart` },
          { label: 'How much is it?', query: `How much is ${book.title}?` },
          { label: 'Show another title', query: 'another one' },
        ],
      };
      return { reply, nextState: updateStateOnResponse(state, 'summary_request', [book]) };
    }

    // "what about the first one"
    if (followType === 'first') {
      const bookId = entities.bookId || state.booksShown[0] || 'quiet-hours';
      const book = books.find((b) => b.id === bookId) || books[0];
      const reply: CompanionReply = {
        text: enforceMax60Words(
          `The first book was '${book.title}'. ${book.shortDescription} Available in paperback, hardcover, and e-book. Would you like to revisit it?`
        ),
        intent: 'summary_request',
        confidence: 0.95,
        suggestedBooks: [book],
        chips: [
          { label: 'Read excerpt', query: `Read chapter one of ${book.title}` },
          { label: 'Add to bag', query: `add ${book.title} to cart` },
          { label: 'Show me something else', query: 'another one' },
        ],
      };
      return { reply, nextState: updateStateOnResponse(state, 'summary_request', [book]) };
    }

    // "no thanks"
    if (followType === 'no') {
      const declinedId = entities.bookId;
      const nextDeclined = declinedId ? [...state.booksDeclined, declinedId] : state.booksDeclined;
      const available = books.filter((b) => !nextDeclined.includes(b.id));
      const nextBook = available[0] || books[2];
      const reply: CompanionReply = {
        text: enforceMax60Words(
          `No problem at all. Perhaps you would enjoy '${nextBook.title}' instead? It offers ${nextBook.shortDescription}`
        ),
        intent: 'mood_recommendation',
        confidence: 0.95,
        suggestedBooks: [nextBook],
        chips: [
          { label: 'Tell me more', query: `Tell me about ${nextBook.title}` },
          { label: 'Something shorter', query: 'something shorter' },
          { label: 'Where should I start?', query: 'Where should I begin?' },
        ],
      };
      return {
        reply,
        nextState: {
          ...state,
          booksDeclined: nextDeclined,
          lastSuggestedBooks: [nextBook.id],
        },
      };
    }

    // "yes"
    if (followType === 'yes') {
      const bookId = entities.bookId || state.lastSuggestedBooks[0] || 'quiet-hours';
      const book = books.find((b) => b.id === bookId) || books[0];
      const reply: CompanionReply = {
        text: enforceMax60Words(
          `Wonderful! You can explore Chapter One of '${book.title}' or add it to your bag. Which would you prefer?`
        ),
        intent: 'summary_request',
        confidence: 0.95,
        suggestedBooks: [book],
        actionLinks: [{ label: 'Read Chapter One', href: `/books/${book.slug}/chapter-one` }],
        chips: [
          { label: 'Add to bag', query: `add ${book.title} to cart` },
          { label: 'Read chapter one', query: `Read chapter one of ${book.title}` },
          { label: 'Delivery details', query: 'How does shipping work?' },
        ],
      };
      return { reply, nextState: updateStateOnResponse(state, 'summary_request', [book]) };
    }
  }

  // 23. CLARIFICATION FALLBACK (Confidence below threshold: ask ONE short clarifying question with 3 quick-reply chips)
  const clarifyingText =
    lexicon.clarifying_question ||
    'I want to be sure I guide you well. Are you exploring a story, looking for book details, or wondering where to begin?';

  const reply: CompanionReply = {
    text: enforceMax60Words(clarifyingText),
    intent: 'clarification',
    confidence: match.confidence,
    chips: [
      { label: lexicon.chips.novel || 'A quiet novel', query: 'Recommend an atmospheric novel' },
      { label: lexicon.chips.essays || 'Short essays', query: 'Show me short essays' },
      { label: lexicon.chips.where_to_start || 'Where to start', query: 'Where should I begin?' },
    ],
  };
  return { reply, nextState: updateStateOnResponse(state, 'clarification') };
}
