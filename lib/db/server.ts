import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSeedBooks } from '@/lib/admin/seed-data';

if (typeof window !== 'undefined') {
  throw new Error('lib/db/server.ts is a server-only module and cannot be executed in the browser.');
}

let supabaseServerClient: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient {
  if (supabaseServerClient) {
    return supabaseServerClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey || url.includes('placeholder') || url.includes('your-project-ref')) {
    throw new Error(
      'Missing or invalid Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set to connect to Supabase.'
    );
  }

  supabaseServerClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseServerClient;
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    url &&
    serviceRoleKey &&
    !url.includes('placeholder') &&
    !url.includes('your-project-ref')
  );
}

export function getDataBackend(): 'demo' | 'supabase' {
  return process.env.DATA_BACKEND === 'supabase' ? 'supabase' : 'demo';
}

/**
 * Idempotent seeder: inserts catalogue books and variants into Supabase.
 * Safe to run multiple times.
 */
export async function seedSupabase(): Promise<{ booksInserted: number; variantsInserted: number }> {
  console.log('Seeding Supabase catalogue books...');
  const supabase = getSupabaseServerClient();
  const seedBooks = getSeedBooks();

  let booksInserted = 0;
  let variantsInserted = 0;

  for (const b of seedBooks) {
    const { error: bookErr } = await supabase.from('books').upsert(
      {
        id: b.id,
        slug: b.slug,
        title: b.title,
        subtitle: b.subtitle || null,
        author: b.author || 'Ann',
        category: b.category || 'Novel',
        status: b.status || 'published',
        short_description: b.shortDescription || null,
        description: b.description || null,
        cover: b.cover || 'quiet',
        cover_alt: b.coverAlt || `Cover artwork for ${b.title}`,
        tags: b.tags || ['fiction', 'literary'],
        moods: b.moods || ['reflective'],
        featured: Boolean(b.featured),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (bookErr) {
      console.error(`Failed to upsert book "${b.title}":`, bookErr.message);
      throw bookErr;
    }
    booksInserted++;

    for (const v of b.variants) {
      const { error: varErr } = await supabase.from('book_variants').upsert(
        {
          id: v.id,
          book_id: b.id,
          format: v.format,
          price: v.price,
          compare_at_price: v.compareAtPrice || null,
          cost: v.cost,
          is_demo_cost: v.isDemoCost,
          sku: v.sku,
          stock: v.stock,
          low_stock_threshold: v.lowStockThreshold,
          weight_grams: v.weightGrams,
          signed_edition: v.signedEdition,
          personalization: v.personalization,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (varErr) {
        console.error(`Failed to upsert variant "${v.sku}":`, varErr.message);
        throw varErr;
      }
      variantsInserted++;
    }
  }

  console.log(`Successfully seeded ${booksInserted} books and ${variantsInserted} variants into Supabase.`);
  return { booksInserted, variantsInserted };
}

