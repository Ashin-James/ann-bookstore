-- ==============================================================================
-- Ann's Bookstore: Newsletter & Collector's Dispatch Additive Migration
-- Task I: Newsletter Signup, Double Opt-In & Unsubscribe Flow
-- Status: BUILT-NOT-VERIFIED (no live Supabase instance connected in demo mode)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL DEFAULT 'home footer',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  verification_token_hash TEXT,
  verification_expires_at TIMESTAMPTZ,
  unsubscribe_token TEXT NOT NULL UNIQUE,
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance and lookup isolation
CREATE INDEX IF NOT EXISTS idx_subscribers_token_hash ON public.subscribers (verification_token_hash);
CREATE INDEX IF NOT EXISTS idx_subscribers_unsub_token ON public.subscribers (unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON public.subscribers (status);

-- Enable Row-Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- 1. Public can insert new subscriptions (double opt-in flow)
DROP POLICY IF EXISTS "Public can subscribe" ON public.subscribers;
CREATE POLICY "Public can subscribe" ON public.subscribers
  FOR INSERT WITH CHECK (true);

-- 2. Staff can view and export subscribers
DROP POLICY IF EXISTS "Staff manages subscribers" ON public.subscribers;
CREATE POLICY "Staff manages subscribers" ON public.subscribers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('owner', 'admin', 'editor')
        AND profiles.disabled = FALSE
    )
  );

