-- ==============================================================================
-- Ann's Bookstore: Thoughts & About Page CMS Additive Migration
-- Task H: Content, Thoughts and Institutional Pages
-- Status: BUILT-NOT-VERIFIED (no live Supabase instance connected in demo mode)
-- ==============================================================================

-- 1. Thoughts & Author Notes
CREATE TABLE IF NOT EXISTS public.thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  attribution TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for ordering and storefront queries
CREATE INDEX IF NOT EXISTS idx_thoughts_status_order ON public.thoughts (status, display_order ASC);

-- 2. Enable Row-Level Security
ALTER TABLE public.thoughts ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Public reads published thoughts" ON public.thoughts;
CREATE POLICY "Public reads published thoughts" ON public.thoughts
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Staff manages thoughts" ON public.thoughts;
CREATE POLICY "Staff manages thoughts" ON public.thoughts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('owner', 'admin', 'editor')
        AND profiles.disabled = FALSE
    )
  );

-- Ensure staff manage policies for pages and revisions
DROP POLICY IF EXISTS "Staff manages pages" ON public.pages;
CREATE POLICY "Staff manages pages" ON public.pages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('owner', 'admin', 'editor')
        AND profiles.disabled = FALSE
    )
  );

DROP POLICY IF EXISTS "Staff manages revisions" ON public.revisions;
CREATE POLICY "Staff manages revisions" ON public.revisions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('owner', 'admin', 'editor')
        AND profiles.disabled = FALSE
    )
  );

