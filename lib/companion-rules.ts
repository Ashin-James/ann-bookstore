import { books, type Book } from '@/data/books';

export interface CompanionResponse {
  text: string;
  suggestedBooks?: Book[];
  actionLinks?: { label: string; href: string }[];
  suggestedQueries?: string[];
}

export function getRuleBasedResponse(rawQuery: string): CompanionResponse {
  const q = rawQuery.toLowerCase().trim();

  // 1. Empathy & Mood: Lonely / Solitude
  if (q.includes('lonely') || q.includes('alone') || q.includes('sad') || q.includes('solitude') || q.includes('grief')) {
    const book = books.find((b) => b.id === 'quiet-hours') || books[0];
    return {
      text: "I'm sorry you're feeling that way. Sometimes a quiet, tender story can make us feel accompanied without demanding anything in return. Ann's 'The Quiet Hours' explores how solitude during the monsoon can quietly heal us. Would you like to read the opening excerpt?",
      suggestedBooks: [book],
      actionLinks: [
        { label: 'Read Chapter One', href: `/books/${book.slug}/chapter-one` },
        { label: 'View The Quiet Hours', href: `/books/${book.slug}` },
      ],
      suggestedQueries: [
        'Tell me more about The Quiet Hours',
        'Do you have something lighter?',
        'Give me essays instead of a novel',
      ],
    };
  }

  // 2. Weather & Monsoon
  if (q.includes('rain') || q.includes('monsoon') || q.includes('weather') || q.includes('storm')) {
    const letters = books.find((b) => b.id === 'monsoon-letters');
    const quiet = books.find((b) => b.id === 'quiet-hours');
    const list = [letters, quiet].filter(Boolean) as Book[];
    return {
      text: "Monsoon is the heartbeat of Ann's writing—where the sound of rain unlocks memories and quiet truths. Both 'Monsoon Letters' and 'The Quiet Hours' are deeply immersed in coastal rains and family nostalgia.",
      suggestedBooks: list,
      actionLinks: [
        { label: 'Explore Monsoon Letters', href: `/books/${letters?.slug || 'monsoon-letters'}` },
      ],
      suggestedQueries: [
        'What is Monsoon Letters about?',
        'Can I listen or read chapter one?',
      ],
    };
  }

  // 3. Spoilers & Plot Endings
  if (q.includes('spoiler') || q.includes('ending') || q.includes('what happens') || q.includes('how does it end') || q.includes('kill') || q.includes('die')) {
    return {
      text: "I can give you a little taste without spoiling the journey! The magic of Ann's work lies in the quiet unfolding of relationships and unspoken loyalties. Would you like a non-spoilery summary of the central themes or a preview of Chapter One?",
      suggestedQueries: [
        'Give me a spoiler-free summary',
        'Read chapter one preview',
        'What are the core themes?',
      ],
    };
  }

  // 4. Inquiries on "The Quiet Hours"
  if (q.includes('quiet hours') || q.includes('sita') || (q.includes('novel') && !q.includes('essays'))) {
    const book = books.find((b) => b.id === 'quiet-hours') || books[0];
    return {
      text: "'The Quiet Hours' is Ann's flagship novel. It is set during an uninterrupted monsoon in coastal southern India, following three generations inside an ancestral home. When an unaddressed parcel arrives, long-held secrets gently rise to the surface. It is peaceful, atmospheric, and deeply moving.",
      suggestedBooks: [book],
      actionLinks: [
        { label: 'Discover The Quiet Hours', href: `/books/${book.slug}` },
        { label: 'Read Chapter One', href: `/books/${book.slug}/chapter-one` },
      ],
      suggestedQueries: [
        'What formats are available?',
        'Who is Sita in the book?',
        'What should I read next?',
      ],
    };
  }

  // 5. Inquiries on "Monsoon Letters"
  if (q.includes('monsoon letters') || q.includes('letter') || q.includes('sister')) {
    const book = books.find((b) => b.id === 'monsoon-letters');
    return {
      text: "'Monsoon Letters' is a collection of epistolary correspondence between two sisters across thirty years (1994–2024)—one in Brighton, one in Bombay. It celebrates the tactile beauty of handwritten aerogrammes, fountain pen ink, and bonds that refuse to rust.",
      suggestedBooks: book ? [book] : [],
      actionLinks: book ? [{ label: 'View Monsoon Letters', href: `/books/${book.slug}` }] : [],
      suggestedQueries: [
        'How many pages is it?',
        'Is it available in Paperback?',
        'Suggest similar books',
      ],
    };
  }

  // 6. Inquiries on "A Map of Small Things"
  if (q.includes('small things') || q.includes('essay') || q.includes('observation') || q.includes('morning') || q.includes('short')) {
    const book = books.find((b) => b.id === 'small-things') || books[2];
    return {
      text: "'A Map of Small Things' is a collection of sixteen luminous essays on mindfulness, morning tea stalls, old railway waiting rooms, and the quiet spaces we often rush past. Perfect for slow morning reading with tea.",
      suggestedBooks: book ? [book] : [],
      actionLinks: book ? [{ label: 'Explore the Essays', href: `/books/${book.slug}` }] : [],
      suggestedQueries: [
        'How long are the essays?',
        'Recommend another book',
      ],
    };
  }

  // 7. General Recommendation: "Where to start?" / "What should I read?"
  if (q.includes('start') || q.includes('recommend') || q.includes('what should i read') || q.includes('help me choose') || q.includes('best')) {
    return {
      text: "If you love immersive family stories and rainy atmospheres, begin with the novel 'The Quiet Hours'. If you prefer short reflective reads for early mornings, 'A Map of Small Things' is wonderful. Which mood speaks to you today?",
      suggestedBooks: books.slice(0, 2),
      suggestedQueries: [
        'I want an atmospheric novel',
        'I prefer short essays',
        'Tell me about the author',
      ],
    };
  }

  // 8. Questions about Ann (The Author)
  if (q.includes('who is ann') || q.includes('author') || q.includes('writer') || q.includes('biography') || q.includes('about')) {
    return {
      text: "Ann is an author writing from the rain-swept coast of southern India. Her works celebrate domestic solitude, ancestral homes, and the small, overlooked moments that quietly shape human lives. All editions are printed on archival acid-free paper.",
      actionLinks: [{ label: 'Read Full Author Note', href: '/about' }],
      suggestedQueries: [
        'Where can I read sample excerpts?',
        'Show all books by Ann',
      ],
    };
  }

  // 9. Shipping & International delivery
  if (q.includes('shipping') || q.includes('deliver') || q.includes('dhl') || q.includes('india') || q.includes('international')) {
    return {
      text: "In this demo store, all orders and pricing are sample representations. Standard US delivery is handled via major carriers (USPS, UPS, FedEx), with free domestic shipping across the US on orders over $35 [DELIVERY ESTIMATE: 3–5 business days].",
      suggestedQueries: [
        'Explore the bookshelf',
        'Check my bag',
      ],
    };
  }

  // 10. Greetings
  if (q === 'hi' || q === 'hello' || q === 'hey' || q.includes('good morning') || q.includes('good evening')) {
    return {
      text: "Hello! Welcome to Ann's quiet reading space. How are you feeling today, and what kind of story would you like to discover?",
      suggestedQueries: [
        'I want something comforting',
        'Show me Ann’s best novel',
        'I only have 15 minutes to read',
      ],
    };
  }

  // 11. Polite Fallback for anything else
  return {
    text: "While I'm tuned specifically to Ann's books, themes of memory, and quiet reflections, I'd love to help you find your next story. Are you in the mood for a sweeping monsoon novel, intimate sisterly letters, or thoughtful essays?",
    suggestedBooks: books.slice(0, 3),
    suggestedQueries: [
      'Tell me about The Quiet Hours',
      'Recommend something for a rainy day',
      'Where should I begin?',
    ],
  };
}
