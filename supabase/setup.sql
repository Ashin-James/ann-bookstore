-- ==============================================================================
-- Ann's Bookstore: Supabase Foundation & Books Schema Setup
-- Idempotent setup for: books, book_variants, reviews, newsletter_subscribers, audit_log
-- Row Level Security (RLS) enabled on all tables with NO public policies.
-- All access is server-only via SUPABASE_SERVICE_ROLE_KEY.
-- ==============================================================================

-- 1. Books Table
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
  tags TEXT[] DEFAULT '{}',
  moods TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Book Variants Table
CREATE TABLE IF NOT EXISTS public.book_variants (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  format TEXT NOT NULL,
  price BIGINT NOT NULL, -- USD cents
  compare_at_price BIGINT,
  cost BIGINT NOT NULL DEFAULT 0, -- USD cents
  is_demo_cost BOOLEAN DEFAULT TRUE,
  sku TEXT NOT NULL UNIQUE,
  stock INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 5,
  weight_grams INT DEFAULT 450,
  signed_edition BOOLEAN DEFAULT FALSE,
  personalization BOOLEAN DEFAULT FALSE,
  preorder_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compatibility view for existing code querying public.variants
CREATE OR REPLACE VIEW public.variants AS SELECT * FROM public.book_variants;

-- 3. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  book_title TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL DEFAULT 'home footer',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  verification_token_hash TEXT,
  verification_expires_at TIMESTAMPTZ,
  unsubscribe_token TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compatibility view for existing code querying public.subscribers
CREATE OR REPLACE VIEW public.subscribers AS SELECT * FROM public.newsletter_subscribers;

-- 5. Audit Log Table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  actor_id TEXT,
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  before_state JSONB,
  after_state JSONB,
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- Indexes for Performance
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_books_slug ON public.books(slug);
CREATE INDEX IF NOT EXISTS idx_books_status ON public.books(status);
CREATE INDEX IF NOT EXISTS idx_book_variants_book ON public.book_variants(book_id);
CREATE INDEX IF NOT EXISTS idx_reviews_book ON public.reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log(created_at DESC);

-- ==============================================================================
-- Row-Level Security (RLS) - ON with NO public policies
-- Direct client access is denied. All access is server-side via SUPABASE_SERVICE_ROLE_KEY.
-- ==============================================================================
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

