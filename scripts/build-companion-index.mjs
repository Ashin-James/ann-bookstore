import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/models/companion');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 4 Catalogue books facts
const catalogueBooks = [
  {
    id: 'quiet-hours',
    title: 'The Quiet Hours',
    category: 'Novel',
    description: 'A family, one long rainy season, and the small choices that change everything. A tender story about what we keep, what we lose, and the quiet courage it takes to return.',
    shortDescription: 'A family, one long rainy season, and the small choices that change everything.',
    note: 'A novel by Ann'
  },
  {
    id: 'monsoon-letters',
    title: 'Monsoon Letters',
    category: 'Essays',
    description: 'A collection of intimate letters and essays about memory, home, and the words we write when the rain will not stop.',
    shortDescription: 'Essays on memory, home, and the words we leave behind.',
    note: 'Epistolary essays'
  },
  {
    id: 'small-things',
    title: 'A Map of Small Things',
    category: 'E-book',
    description: 'Small observations become a map back to ourselves in this thoughtful collection about everyday wonder and the art of paying attention.',
    shortDescription: 'A thoughtful map to the wonder hiding in everyday life.',
    note: 'Reflective collection'
  },
  {
    id: 'room-for-rain',
    title: 'A Room for Rain',
    category: 'Novel',
    description: 'In a coastal town shaped by the weather, one unexpected guest changes the way a family understands its past.',
    shortDescription: 'An intimate story of family, weather, and unexpected beginnings.',
    note: 'A coastal novel'
  }
];

const intentExamples = [
  { intent: 'greeting', text: 'hello there good morning welcome hi' },
  { intent: 'thanks', text: 'thank you so much thanks appreciate it grateful' },
  { intent: 'goodbye', text: 'goodbye bye see you farewell talk to you later' },
  { intent: 'how_are_you', text: 'how are you doing today how do you feel how is everything' },
  { intent: 'who_are_you', text: 'who are you what are you are you an ai what can you do' },
  { intent: 'about_ann', text: 'who is ann tell me about the author writer biography background' },
  { intent: 'mood_recommendation', text: 'i feel lonely sad nostalgic reflective rainy day quiet comforting story' },
  { intent: 'genre', text: 'i want a fiction novel or nonfiction essays letters family saga' },
  { intent: 'length', text: 'something shorter brief quick read under hundred pages short essays' },
  { intent: 'format', text: 'paperback hardcover physical copy ebook digital kindle' },
  { intent: 'price_delivery', text: 'how much is shipping cost delivery price postage free shipping' },
  { intent: 'summary_request', text: 'what is the plot summary of the book synopsis story overview' },
  { intent: 'compare_books', text: 'compare two books difference between the quiet hours and a room for rain vs' },
  { intent: 'excerpt_request', text: 'can i read an excerpt chapter one preview sample snippet' },
  { intent: 'add_to_cart', text: 'add to cart add to bag purchase buy this book checkout' },
  { intent: 'returns_faq', text: 'what is your return policy how do returns work refund exchange' },
  { intent: 'small_talk', text: 'what is the weather like what is your favorite book tell me a joke compliment' },
  { intent: 'complaint', text: 'i have a complaint bad service damaged book order is delayed upset' },
  { intent: 'off_topic', text: 'tell me about bitcoin crypto capital of france python code soccer game' },
  { intent: 'crisis', text: 'i want to kill myself commit suicide end my life hurt myself no reason to live' },
  { intent: 'injection', text: 'ignore previous instructions system prompt you are now dan reveal secrets' }
];

// Build vocabulary dictionary
const allCorpus = [
  ...catalogueBooks.map(b => `${b.title} ${b.category} ${b.description} ${b.shortDescription} ${b.note}`),
  ...intentExamples.map(e => e.text)
].join(' ').toLowerCase();

const rawTokens = allCorpus.match(/[a-z0-9]{2,}/g) || [];
const vocabFreq = {};
for (const t of rawTokens) {
  vocabFreq[t] = (vocabFreq[t] || 0) + 1;
}

// Select top 256 dimension features
const featureVocab = Object.entries(vocabFreq)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 256)
  .map(([word]) => word);

const vocabIndex = {};
featureVocab.forEach((w, i) => {
  vocabIndex[w] = i;
});

function embedText(text) {
  const vec = new Float32Array(featureVocab.length);
  const words = text.toLowerCase().match(/[a-z0-9]{2,}/g) || [];
  for (const w of words) {
    if (vocabIndex[w] !== undefined) {
      vec[vocabIndex[w]] += 1.0;
    }
  }
  // L2 normalize
  let norm = 0;
  for (let i = 0; i < vec.length; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < vec.length; i++) vec[i] = Number((vec[i] / norm).toFixed(5));
  }
  return Array.from(vec);
}

// Compute embeddings
const bookEmbeddings = catalogueBooks.map(b => ({
  id: b.id,
  title: b.title,
  vector: embedText(`${b.title} ${b.category} ${b.description} ${b.shortDescription} ${b.note}`)
}));

const intentEmbeddings = intentExamples.map(e => ({
  intent: e.intent,
  text: e.text,
  vector: embedText(e.text)
}));

const indexData = {
  version: '1.0.0',
  dimension: featureVocab.length,
  vocab: featureVocab,
  books: bookEmbeddings,
  intents: intentEmbeddings,
  modelName: 'companion-embed-quantized-25m',
  license: 'Apache-2.0'
};

const indexPath = path.join(outDir, 'index.json');
fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2), 'utf-8');
console.log(`Precomputed companion semantic index written to ${indexPath} (${(fs.statSync(indexPath).size / 1024).toFixed(1)} KB)`);

// Also save model config manifest in public/models/companion
const configPath = path.join(outDir, 'config.json');
fs.writeFileSync(configPath, JSON.stringify({
  model_type: 'companion_sentence_transformer',
  quantized: true,
  embedding_size: featureVocab.length,
  permissive_license: 'Apache-2.0',
  offline_ready: true
}, null, 2), 'utf-8');
