-- ==============================================================================
-- Ann's Bookstore: Journal Posts & Revisions Schema (Additive Migration)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.journal_posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT NOT NULL DEFAULT 'Reflections',
  excerpt TEXT,
  content_html TEXT NOT NULL,
  cover_image TEXT,
  cover_image_alt TEXT,
  related_book_slug TEXT,
  related_book_title TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
  publish_date TIMESTAMPTZ,
  read_time TEXT,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.journal_revisions (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES public.journal_posts(id) ON DELETE CASCADE,
  revision_number INT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  content_html TEXT NOT NULL,
  cover_image TEXT,
  cover_image_alt TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_journal_posts_slug ON public.journal_posts(slug);
CREATE INDEX IF NOT EXISTS idx_journal_posts_status ON public.journal_posts(status, publish_date);
CREATE INDEX IF NOT EXISTS idx_journal_revisions_post_id ON public.journal_revisions(post_id, revision_number DESC);

-- Row Level Security
ALTER TABLE public.journal_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_revisions ENABLE ROW LEVEL SECURITY;

-- Allow public reads on published journal posts whose publish_date is now or past
CREATE POLICY "Public reads published journal posts" ON public.journal_posts
  FOR SELECT USING (
    status = 'published' AND (publish_date IS NULL OR publish_date <= NOW())
  );

-- Staff full access on journal posts
CREATE POLICY "Staff full access on journal posts" ON public.journal_posts
  FOR ALL TO authenticated USING (true);

-- Staff full access on journal revisions
CREATE POLICY "Staff full access on journal revisions" ON public.journal_revisions
  FOR ALL TO authenticated USING (true);

