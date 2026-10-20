export interface JournalArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  readTime: string;
  category: string;
  excerpt: string;
  pullQuote: string;
  body: string[];
  relatedBookSlug?: string;
  relatedBookTitle?: string;
}

export const journalArticles: JournalArticle[] = [
  {
    id: 'on-monsoon-and-memory',
    slug: 'on-monsoon-and-memory',
    title: 'On Monsoon and Memory',
    subtitle: 'How seasonal rain slow-cooks the things we thought we had forgotten.',
    date: 'October 12, 2026',
    readTime: '4 min read',
    category: 'Reflections',
    excerpt:
      'The coastal rain does not arrive with sudden thunder; it arrives as an unhurried rumor across the veranda tiles.',
    pullQuote:
      'Water has a way of dissolving the borders we erect between who we were and who we have become.',
    body: [
      'The coastal rain does not arrive with sudden thunder; it arrives as an unhurried rumor across the veranda tiles. First the smell of dust yielding to moisture, then the tamarind leaves hanging heavy and still, and finally the slate-grey sky that cancels the rest of the world.',
      'In our grandmother’s courtyard, rain was not an interruption to the day; it was the day’s true tempo. When the downpour began, water would pool in the central open quadrangle, reflecting the zinc roofing and the swaying coconut fronds like an inverted sky.',
      'I began writing The Quiet Hours during one of those interminable July monsoons. Cut off by rising waters from the canal, the family was marooned together inside high lime-plastered walls. In the absence of ordinary distractions, long-buried grievances and tender loyalties rose to the surface like oil on quiet water.',
      'To read during a monsoon is an act of defiance against velocity. It requires you to sit, to pull a coarse cotton shawl over your knees, and to allow another person’s sentences to become the rhythm of your breathing.',
    ],
    relatedBookSlug: 'the-quiet-hours',
    relatedBookTitle: 'The Quiet Hours',
  },
  {
    id: 'the-lost-art-of-letter-writing',
    slug: 'the-lost-art-of-letter-writing',
    title: 'The Lost Art of Letter Writing',
    subtitle: 'Why fountain pen ink on blue aerogrammes refuses to rust.',
    date: 'September 28, 2026',
    readTime: '5 min read',
    category: 'Epistolary',
    excerpt:
      'A digital message demands immediacy; an aerogramme invites patience and the tactile scent of sea breeze.',
    pullQuote:
      'Letters carry the physical weight of time. When you unfold an old letter, you breathe the air of the room in which it was folded.',
    body: [
      'In the attic trunk of my ancestral home, there is a bundle of blue aerogrammes tied with frayed jute string. They were sent between 1994 and 2004, between my mother in Brighton and her elder sister in Bombay.',
      'When you open an aerogramme, you are greeted by four distinct folds. The margins are crammed with postscripts; the paper is gossamer-thin, designed to stay beneath the airmail weight limit of five grams. You can see where the fountain pen nib dug into the paper when the writer hesitated over a difficult confession.',
      'Digital communication has made distance negligible, but it has also flattened intimacy into pulses of light. A handwritten letter has a heartbeat. It took eleven days to cross an ocean; it spent a night in an unheated postal depot; it was touched by seven pairs of hands before reaching the breakfast table.',
      'This tactile persistence inspired Monsoon Letters. Letters remind us that love across oceans does not need instant replies—it needs permanence.',
    ],
    relatedBookSlug: 'monsoon-letters',
    relatedBookTitle: 'Monsoon Letters',
  },
  {
    id: 'architecture-of-a-quiet-room',
    slug: 'architecture-of-a-quiet-room',
    title: 'Architecture of a Quiet Room',
    subtitle: 'Notes on natural morning light, wooden benches, and the space for unhurried thought.',
    date: 'August 15, 2026',
    readTime: '3 min read',
    category: 'The Writing Desk',
    excerpt:
      'A good desk does not demand productivity; it asks only that you sit still long enough to notice the shadows move.',
    pullQuote:
      'The purpose of a library is not to display knowledge, but to shelter the silence necessary to absorb it.',
    body: [
      'Every morning at six, before the street vendors begin their rounds, the light enters the writing room at a low, amber angle. It strikes the spine of an old dictionary, turns the teak floor to honey, and warms the brass paperweight that my father brought back from Mangalore.',
      'We often think about interior design in terms of aesthetics or ergonomics. But what about designing for quietness? A quiet room does not have to be silent. It welcomes the gentle tick of a mechanical clock, the dry rustle of paper being turned, and the whistle of the morning kettle from two doors down.',
      'When we cultivate a corner of quiet in our homes, we make room for our own interior life to breathe. It is in these unhurried spaces that stories are born.',
    ],
    relatedBookSlug: 'a-map-of-small-things',
    relatedBookTitle: 'A Map of Small Things',
  },
];
