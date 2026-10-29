import { z } from 'zod';

export interface JournalArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  readTime: string;
  category: string;
  excerpt: string;
  pullQuote?: string;
  body: string[];
  contentHtml?: string;
  coverImage?: string;
  coverImageAlt?: string;
  relatedBookSlug?: string;
  relatedBookTitle?: string;
  status?: 'draft' | 'scheduled' | 'published';
  publishDate?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface JournalRevisionRecord {
  id: string;
  postId: string;
  revisionNumber: number;
  title: string;
  subtitle: string;
  contentHtml: string;
  coverImage?: string;
  coverImageAlt?: string;
  category: string;
  createdAt: string;
  createdBy?: string;
}

export interface JournalPostRecord {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  excerpt: string;
  contentHtml: string;
  coverImage?: string;
  coverImageAlt?: string;
  relatedBookSlug?: string;
  relatedBookTitle?: string;
  status: 'draft' | 'scheduled' | 'published';
  publishDate?: string;
  readTime: string;
  seoTitle?: string;
  seoDescription?: string;
  revisions: JournalRevisionRecord[];
  createdAt: string;
  updatedAt: string;
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
    contentHtml: `<p>The coastal rain does not arrive with sudden thunder; it arrives as an unhurried rumor across the veranda tiles. First the smell of dust yielding to moisture, then the tamarind leaves hanging heavy and still, and finally the slate-grey sky that cancels the rest of the world.</p><blockquote>Water has a way of dissolving the borders we erect between who we were and who we have become.</blockquote><p>In our grandmother’s courtyard, rain was not an interruption to the day; it was the day’s true tempo. When the downpour began, water would pool in the central open quadrangle, reflecting the zinc roofing and the swaying coconut fronds like an inverted sky.</p><p>I began writing The Quiet Hours during one of those interminable July monsoons. Cut off by rising waters from the canal, the family was marooned together inside high lime-plastered walls. In the absence of ordinary distractions, long-buried grievances and tender loyalties rose to the surface like oil on quiet water.</p><p>To read during a monsoon is an act of defiance against velocity. It requires you to sit, to pull a coarse cotton shawl over your knees, and to allow another person’s sentences to become the rhythm of your breathing.</p>`,
    relatedBookSlug: 'the-quiet-hours',
    relatedBookTitle: 'The Quiet Hours',
    status: 'published',
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
    contentHtml: `<p>In the attic trunk of my ancestral home, there is a bundle of blue aerogrammes tied with frayed jute string. They were sent between 1994 and 2004, between my mother in Brighton and her elder sister in Bombay.</p><blockquote>Letters carry the physical weight of time. When you unfold an old letter, you breathe the air of the room in which it was folded.</blockquote><p>When you open an aerogramme, you are greeted by four distinct folds. The margins are crammed with postscripts; the paper is gossamer-thin, designed to stay beneath the airmail weight limit of five grams. You can see where the fountain pen nib dug into the paper when the writer hesitated over a difficult confession.</p><p>Digital communication has made distance negligible, but it has also flattened intimacy into pulses of light. A handwritten letter has a heartbeat. It took eleven days to cross an ocean; it spent a night in an unheated postal depot; it was touched by seven pairs of hands before reaching the breakfast table.</p><p>This tactile persistence inspired Monsoon Letters. Letters remind us that love across oceans does not need instant replies—it needs permanence.</p>`,
    relatedBookSlug: 'monsoon-letters',
    relatedBookTitle: 'Monsoon Letters',
    status: 'published',
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
    contentHtml: `<p>Every morning at six, before the street vendors begin their rounds, the light enters the writing room at a low, amber angle. It strikes the spine of an old dictionary, turns the teak floor to honey, and warms the brass paperweight that my father brought back from Mangalore.</p><blockquote>The purpose of a library is not to display knowledge, but to shelter the silence necessary to absorb it.</blockquote><p>We often think about interior design in terms of aesthetics or ergonomics. But what about designing for quietness? A quiet room does not have to be silent. It welcomes the gentle tick of a mechanical clock, the dry rustle of paper being turned, and the whistle of the morning kettle from two doors down.</p><p>When we cultivate a corner of quiet in our homes, we make room for our own interior life to breathe. It is in these unhurried spaces that stories are born.</p>`,
    relatedBookSlug: 'a-map-of-small-things',
    relatedBookTitle: 'A Map of Small Things',
    status: 'published',
  },
];

// Zod Schema for validation
export const journalPostInputSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().trim().min(3, 'Title must be at least 3 characters'),
    subtitle: z.string().trim().optional(),
    category: z.string().trim().min(2, 'Category is required'),
    excerpt: z.string().trim().optional(),
    contentHtml: z.string().trim().min(10, 'Content must be at least 10 characters'),
    coverImage: z.string().trim().optional(),
    coverImageAlt: z.string().trim().optional(),
    relatedBookSlug: z.string().trim().optional(),
    relatedBookTitle: z.string().trim().optional(),
    status: z.enum(['draft', 'scheduled', 'published']),
    publishDate: z.string().optional(),
    seoTitle: z.string().trim().optional(),
    seoDescription: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (data.coverImage && data.coverImage.trim()) {
        return Boolean(data.coverImageAlt && data.coverImageAlt.trim());
      }
      return true;
    },
    {
      message: 'Cover image alt text is required when a cover image is provided.',
      path: ['coverImageAlt'],
    }
  );

/**
 * Sanitizes HTML content by stripping scripts, iframe, objects,
 * inline event handlers (onerror, onload, onclick, etc.), and javascript: URIs.
 */
export function sanitizeHtmlContent(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?>[\s\S]*?<\/embed>/gi, '')
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/href\s*=\s*(['"])javascript:.*?\1/gi, 'href="#"')
    .replace(/src\s*=\s*(['"])javascript:.*?\1/gi, 'src=""');
}

/**
 * Calculates reading time automatically based on word count (approx. 200 wpm).
 */
export function calculateReadingTime(html: string): string {
  const text = html.replace(/<[^>]*>/g, ' ').trim();
  const words = text ? text.split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

/**
 * Validates that all <img> tags in the HTML have a non-empty alt attribute.
 */
export function validateImageAltTags(html: string): boolean {
  const imgRegex = /<img\b([^>]*)>/gi;
  let match: RegExpExecArray | null;
  while ((match = imgRegex.exec(html)) !== null) {
    const attributes = match[1];
    const altMatch = attributes.match(/alt\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i);
    if (!altMatch) return false;
    const altValue = altMatch[1].replace(/^["']|["']$/g, '').trim();
    if (!altValue) return false;
  }
  return true;
}

const STORAGE_KEY = 'ann_admin_v1_store';

function createInitialDemoJournalPosts(): JournalPostRecord[] {
  return journalArticles.map((art) => ({
    id: art.id,
    slug: art.slug,
    title: art.title,
    subtitle: art.subtitle,
    category: art.category,
    excerpt: art.excerpt,
    contentHtml: art.contentHtml || art.body.map((p) => `<p>${p}</p>`).join(''),
    relatedBookSlug: art.relatedBookSlug,
    relatedBookTitle: art.relatedBookTitle,
    status: 'published',
    readTime: art.readTime,
    revisions: [
      {
        id: `rev_${art.id}_1`,
        postId: art.id,
        revisionNumber: 1,
        title: art.title,
        subtitle: art.subtitle,
        contentHtml: art.contentHtml || art.body.map((p) => `<p>${p}</p>`).join(''),
        category: art.category,
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ],
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-10-12T00:00:00.000Z',
  }));
}

/**
 * Returns journal posts for the public storefront.
 * Reads from the demo store in localStorage, returning only published and non-future-dated posts.
 */
export function getStorefrontJournalArticles(): JournalArticle[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.journalPosts) && parsed.journalPosts.length > 0) {
          const now = Date.now();
          return parsed.journalPosts
            .filter((p: JournalPostRecord) => {
              if (p.status !== 'published') return false;
              if (p.publishDate) {
                const pubTime = new Date(p.publishDate).getTime();
                if (!isNaN(pubTime) && pubTime > now) return false;
              }
              return true;
            })
            .map((p: JournalPostRecord) => convertRecordToArticle(p));
        }
      }
    } catch {
      // Fallback
    }
  }
  return journalArticles;
}

export function getStorefrontJournalArticleBySlug(slug: string): JournalArticle | undefined {
  return getStorefrontJournalArticles().find((a) => a.slug === slug);
}

function convertRecordToArticle(record: JournalPostRecord): JournalArticle {
  const plainText = record.contentHtml.replace(/<[^>]*>/g, ' ');
  const paragraphs = record.contentHtml
    .split(/<\/p>/i)
    .map((p) => p.replace(/<[^>]*>/g, '').trim())
    .filter(Boolean);

  const formattedDate = record.publishDate
    ? new Date(record.publishDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date(record.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    subtitle: record.subtitle,
    date: formattedDate,
    readTime: record.readTime || calculateReadingTime(record.contentHtml),
    category: record.category,
    excerpt: record.excerpt || (paragraphs[0] ? paragraphs[0].substring(0, 160) + '...' : ''),
    pullQuote: '',
    body: paragraphs.length > 0 ? paragraphs : [plainText],
    contentHtml: record.contentHtml,
    coverImage: record.coverImage,
    coverImageAlt: record.coverImageAlt,
    relatedBookSlug: record.relatedBookSlug,
    relatedBookTitle: record.relatedBookTitle,
    status: record.status,
    publishDate: record.publishDate,
    seoTitle: record.seoTitle,
    seoDescription: record.seoDescription,
  };
}

/**
 * Returns all admin journal posts (including drafts and scheduled), with optional filter/search.
 */
export function getAdminJournalPosts(filter?: {
  status?: string;
  search?: string;
}): JournalPostRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    let store: { journalPosts?: JournalPostRecord[] } = {};
    if (raw) {
      store = JSON.parse(raw);
    }
    if (!Array.isArray(store.journalPosts)) {
      store.journalPosts = createInitialDemoJournalPosts();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }

    let posts = store.journalPosts;
    if (filter?.status && filter.status !== 'all') {
      posts = posts.filter((p) => p.status === filter.status);
    }
    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.subtitle && p.subtitle.toLowerCase().includes(q))
      );
    }
    return posts;
  } catch {
    return [];
  }
}

/**
 * Saves a journal post in the demo store.
 * Manages the last 10 revisions, sanitizes HTML, calculates read time,
 * records audit log, and dispatches change events.
 */
export function saveAdminJournalPost(
  input: z.infer<typeof journalPostInputSchema>,
  actorEmail = 'editor@annsbookstore.demo'
): { success: true; post: JournalPostRecord } | { success: false; error: string } {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Window not defined' };
  }

  // 1. Zod Validation
  const parsed = journalPostInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // 2. Validate image alt tags
  if (!validateImageAltTags(parsed.data.contentHtml)) {
    return {
      success: false,
      error: 'Every embedded image must include descriptive alt text before saving.',
    };
  }

  // 3. Sanitize HTML
  const sanitizedHtml = sanitizeHtmlContent(parsed.data.contentHtml);
  const readTime = calculateReadingTime(sanitizedHtml);
  const nowIso = new Date().toISOString();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const store = raw ? JSON.parse(raw) : {};
    if (!Array.isArray(store.journalPosts)) {
      store.journalPosts = createInitialDemoJournalPosts();
    }
    if (!Array.isArray(store.auditLogs)) {
      store.auditLogs = [];
    }

    const posts: JournalPostRecord[] = store.journalPosts;
    const isNew = !input.id || !posts.some((p) => p.id === input.id);

    const slug = (
      input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `post-${Date.now()}`
    );

    let targetPost: JournalPostRecord;

    if (isNew) {
      const newId = input.id || `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const firstRevision: JournalRevisionRecord = {
        id: `rev_${newId}_1`,
        postId: newId,
        revisionNumber: 1,
        title: parsed.data.title,
        subtitle: parsed.data.subtitle || '',
        contentHtml: sanitizedHtml,
        coverImage: parsed.data.coverImage,
        coverImageAlt: parsed.data.coverImageAlt,
        category: parsed.data.category,
        createdAt: nowIso,
        createdBy: actorEmail,
      };

      targetPost = {
        id: newId,
        slug,
        title: parsed.data.title,
        subtitle: parsed.data.subtitle || '',
        category: parsed.data.category,
        excerpt: parsed.data.excerpt || '',
        contentHtml: sanitizedHtml,
        coverImage: parsed.data.coverImage,
        coverImageAlt: parsed.data.coverImageAlt,
        relatedBookSlug: parsed.data.relatedBookSlug,
        relatedBookTitle: parsed.data.relatedBookTitle,
        status: parsed.data.status,
        publishDate: parsed.data.publishDate,
        readTime,
        seoTitle: parsed.data.seoTitle,
        seoDescription: parsed.data.seoDescription,
        revisions: [firstRevision],
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      posts.unshift(targetPost);

      store.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorId: 'usr_editor',
        actorEmail,
        action: 'journal.create',
        entity: 'journal_post',
        entityId: newId,
        beforeState: null,
        afterState: { title: targetPost.title, status: targetPost.status },
        ipHash: 'local_hash',
        createdAt: nowIso,
      });
    } else {
      const idx = posts.findIndex((p) => p.id === input.id);
      const existing = posts[idx];
      const nextRevNum = (existing.revisions?.[0]?.revisionNumber || existing.revisions?.length || 0) + 1;

      const newRevision: JournalRevisionRecord = {
        id: `rev_${existing.id}_${nextRevNum}`,
        postId: existing.id,
        revisionNumber: nextRevNum,
        title: parsed.data.title,
        subtitle: parsed.data.subtitle || '',
        contentHtml: sanitizedHtml,
        coverImage: parsed.data.coverImage,
        coverImageAlt: parsed.data.coverImageAlt,
        category: parsed.data.category,
        createdAt: nowIso,
        createdBy: actorEmail,
      };

      // Keep last 10 revisions
      const updatedRevisions = [newRevision, ...(existing.revisions || [])].slice(0, 10);

      targetPost = {
        ...existing,
        title: parsed.data.title,
        slug,
        subtitle: parsed.data.subtitle || '',
        category: parsed.data.category,
        excerpt: parsed.data.excerpt || '',
        contentHtml: sanitizedHtml,
        coverImage: parsed.data.coverImage,
        coverImageAlt: parsed.data.coverImageAlt,
        relatedBookSlug: parsed.data.relatedBookSlug,
        relatedBookTitle: parsed.data.relatedBookTitle,
        status: parsed.data.status,
        publishDate: parsed.data.publishDate,
        readTime,
        seoTitle: parsed.data.seoTitle,
        seoDescription: parsed.data.seoDescription,
        revisions: updatedRevisions,
        updatedAt: nowIso,
      };
      posts[idx] = targetPost;

      store.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorId: 'usr_editor',
        actorEmail,
        action: 'journal.update',
        entity: 'journal_post',
        entityId: existing.id,
        beforeState: { title: existing.title, status: existing.status },
        afterState: { title: targetPost.title, status: targetPost.status },
        ipHash: 'local_hash',
        createdAt: nowIso,
      });
    }

    store.journalPosts = posts;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent('ann_journal_updated'));

    return { success: true, post: targetPost };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Storage error';
    return { success: false, error: msg };
  }
}

/**
 * Restores a specific revision for a journal post.
 */
export function restoreAdminJournalRevision(
  postId: string,
  revisionNumber: number,
  actorEmail = 'editor@annsbookstore.demo'
): { success: true; post: JournalPostRecord } | { success: false; error: string } {
  if (typeof window === 'undefined') return { success: false, error: 'Window not defined' };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const store = raw ? JSON.parse(raw) : {};
    if (!Array.isArray(store.journalPosts)) return { success: false, error: 'No posts found' };

    const idx = store.journalPosts.findIndex((p: JournalPostRecord) => p.id === postId);
    if (idx === -1) return { success: false, error: 'Post not found' };

    const post = store.journalPosts[idx];
    const targetRev = post.revisions?.find((r: JournalRevisionRecord) => r.revisionNumber === revisionNumber);
    if (!targetRev) return { success: false, error: 'Revision not found' };

    const nowIso = new Date().toISOString();
    const nextRevNum = (post.revisions?.[0]?.revisionNumber || post.revisions?.length || 0) + 1;
    const restoredRevision: JournalRevisionRecord = {
      id: `rev_${post.id}_${nextRevNum}`,
      postId: post.id,
      revisionNumber: nextRevNum,
      title: targetRev.title,
      subtitle: targetRev.subtitle,
      contentHtml: targetRev.contentHtml,
      coverImage: targetRev.coverImage,
      coverImageAlt: targetRev.coverImageAlt,
      category: targetRev.category,
      createdAt: nowIso,
      createdBy: `${actorEmail} (restored rev ${revisionNumber})`,
    };

    const updatedRevisions = [restoredRevision, ...(post.revisions || [])].slice(0, 10);
    const updatedPost: JournalPostRecord = {
      ...post,
      title: targetRev.title,
      subtitle: targetRev.subtitle,
      contentHtml: targetRev.contentHtml,
      coverImage: targetRev.coverImage,
      coverImageAlt: targetRev.coverImageAlt,
      category: targetRev.category,
      readTime: calculateReadingTime(targetRev.contentHtml),
      revisions: updatedRevisions,
      updatedAt: nowIso,
    };

    store.journalPosts[idx] = updatedPost;
    if (!Array.isArray(store.auditLogs)) store.auditLogs = [];
    store.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorId: 'usr_editor',
      actorEmail,
      action: 'journal.restore_revision',
      entity: 'journal_post',
      entityId: post.id,
      beforeState: { title: post.title },
      afterState: { title: updatedPost.title, restoredRevision: revisionNumber },
      ipHash: 'local_hash',
      createdAt: nowIso,
    });

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent('ann_journal_updated'));

    return { success: true, post: updatedPost };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Restore failed';
    return { success: false, error: msg };
  }
}

/**
 * Deletes a journal post after verifying exact title match.
 */
export function deleteAdminJournalPost(
  id: string,
  titleConfirmation: string,
  actorEmail = 'editor@annsbookstore.demo'
): { success: true } | { success: false; error: string } {
  if (typeof window === 'undefined') return { success: false, error: 'Window not defined' };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const store = raw ? JSON.parse(raw) : {};
    if (!Array.isArray(store.journalPosts)) return { success: false, error: 'No posts found' };

    const idx = store.journalPosts.findIndex((p: JournalPostRecord) => p.id === id);
    if (idx === -1) return { success: false, error: 'Post not found' };

    const post = store.journalPosts[idx];
    if (titleConfirmation.trim() !== post.title.trim()) {
      return { success: false, error: 'Typed title does not match post title exactly' };
    }

    store.journalPosts.splice(idx, 1);
    if (!Array.isArray(store.auditLogs)) store.auditLogs = [];
    store.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorId: 'usr_editor',
      actorEmail,
      action: 'journal.delete',
      entity: 'journal_post',
      entityId: id,
      beforeState: { title: post.title },
      afterState: null,
      ipHash: 'local_hash',
      createdAt: new Date().toISOString(),
    });

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent('ann_journal_updated'));

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Delete failed';
    return { success: false, error: msg };
  }
}
