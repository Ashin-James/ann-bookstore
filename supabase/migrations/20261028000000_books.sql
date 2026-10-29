-- ==============================================================================
-- Ann's Bookstore: Books Table Schema & RLS Policies (Additive Migration)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.books (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  author TEXT NOT NULL DEFAULT 'Ann',
  category TEXT DEFAULT 'Novel',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  short_description TEXT,
  description TEXT,
  cover TEXT DEFAULT 'quiet',
  cover_alt TEXT,
  pages INT,
  language TEXT DEFAULT 'en',
  publication_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Allow public reads on published books only
CREATE POLICY "Public reads published books" ON public.books
  FOR SELECT USING (status = 'published');

-- Allow authenticated admin/staff full access
CREATE POLICY "Staff full access on books" ON public.books
  FOR ALL TO authenticated USING (true);
