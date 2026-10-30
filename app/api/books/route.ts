import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { books } from '@/data/books';
import { getDataBackend, isSupabaseConfigured, getSupabaseServerClient } from '@/lib/db/server';
import { verifySignedSessionToken } from '@/lib/admin/session';
import { hashIp } from '@/lib/admin/auth';
import { getAdminService } from '@/lib/admin/service-factory';

const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(100),
  subtitle: z.string().optional(),
  author: z.string().default('Ann'),
  category: z.string().default('Novel'),
  status: z.enum(['draft', 'scheduled', 'published', 'archived']).default('published'),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  cover: z.string().default('quiet'),
  coverAlt: z.string().optional(),
  tags: z.array(z.string()).optional(),
  moods: z.array(z.string()).optional(),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        format: z.string(),
        price: z.number().int().nonnegative(),
        compareAtPrice: z.number().optional(),
        cost: z.number().optional(),
        isDemoCost: z.boolean().optional(),
        sku: z.string().optional(),
        stock: z.number().int().nonnegative().optional(),
        lowStockThreshold: z.number().optional(),
        weightGrams: z.number().optional(),
        signedEdition: z.boolean().optional(),
        personalization: z.boolean().optional(),
      })
    )
    .optional(),
});

export async function GET(request: NextRequest) {
  const backend = getDataBackend();
  const all = request.nextUrl.searchParams.get('all') === 'true';

  if (backend === 'supabase' && isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseServerClient();
      let query = supabase.from('books').select('*');
      if (!all) {
        query = query.eq('status', 'published');
      }

      const { data: dbBooks, error: bookErr } = await query;
      if (bookErr || !dbBooks || dbBooks.length === 0) {
        console.warn('[storefront-books] Supabase books unreachable or empty, falling back to data/books.ts');
        return NextResponse.json(books, {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
            'x-data-backend': 'supabase-fallback',
          },
        });
      }

      const { data: dbVariants } = await supabase.from('book_variants').select('*');
      const variantsList = (dbVariants || []) as Array<{
        id: string;
        book_id: string;
        format: string;
        price: number | string;
      }>;

      const mappedBooks = dbBooks.map((b) => ({
        id: b.id,
        slug: b.slug,
        title: b.title,
        author: b.author || 'Ann',
        category: b.category || 'Novel',
        description: b.description || '',
        shortDescription: b.short_description || '',
        cover: b.cover || 'quiet',
        coverAlt: b.cover_alt || `Cover artwork for ${b.title}`,
        status: b.status || 'published',
        featured: Boolean(b.featured),
        note: b.subtitle || (b.author ? `A story by ${b.author}` : undefined),
        formats: (variantsList.filter((v) => v.book_id === b.id).length > 0
          ? variantsList.filter((v) => v.book_id === b.id)
          : [{ id: `${b.id}-pb`, book_id: b.id, format: 'Paperback', price: 1800 }]
        ).map((v) => ({
          id: v.id,
          name: v.format,
          price: Number(v.price),
        })),
      }));

      return NextResponse.json(mappedBooks, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'x-data-backend': 'supabase',
        },
      });
    } catch (err: unknown) {
      console.warn(
        '[storefront-books] Supabase exception, falling back to data/books.ts:',
        err instanceof Error ? err.message : err
      );
      return NextResponse.json(books, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'x-data-backend': 'supabase-fallback',
        },
      });
    }
  }

  // Demo backend
  return NextResponse.json(books, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      'x-data-backend': 'demo',
    },
  });
}

export async function POST(request: NextRequest) {
  // 1. Origin check
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return NextResponse.json({ success: false, error: 'Forbidden: Origin mismatch' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ success: false, error: 'Forbidden: Invalid origin' }, { status: 403 });
    }
  }

  // 2. Admin Session check
  const sessionCookie = request.cookies.get('ann_admin_session')?.value;
  const isDemoOwner = sessionCookie === 'demo_session_token_owner';
  const session = sessionCookie ? await verifySignedSessionToken(sessionCookie) : null;
  if (!session && !isDemoOwner) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const actorEmail = session ? session.userId : (process.env.ADMIN_DEMO_EMAIL || 'admin@annsbookstore.com');
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const ipHash = hashIp(ip);

  try {
    const body = await request.json();
    const { action, id, book } = body;

    const backend = getDataBackend();

    // In demo mode, route directly to AdminService
    if (backend !== 'supabase') {
      const service = getAdminService();
      const safeActor = actorEmail || 'admin@annsbookstore.com';
      if (action === 'create') {
        const res = await service.createBook({ book, actorEmail: safeActor, ipHash });
        return NextResponse.json(res);
      }
      if (action === 'update') {
        const res = await service.updateBook({ id: id || '', book, actorEmail: safeActor, ipHash });
        return NextResponse.json(res);
      }
      if (action === 'archive') {
        const res = await service.archiveBook({ id: id || '', actorEmail: safeActor, ipHash });
        return NextResponse.json(res);
      }
      if (action === 'delete') {
        const res = await service.deleteBook({ id: id || '', actorEmail: safeActor, ipHash });
        return NextResponse.json(res);
      }
      if (action === 'restore') {
        const res = await service.restoreBook({ book, actorEmail: safeActor, ipHash });
        return NextResponse.json(res);
      }
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    // In Supabase mode
    const supabase = getSupabaseServerClient();

    if (action === 'create' || action === 'restore') {
      const parsed = bookSchema.safeParse(book);
      if (!parsed.success) {
        return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message }, { status: 400 });
      }
      if (parsed.data.cover && !parsed.data.coverAlt?.trim()) {
        return NextResponse.json({ success: false, error: 'Cover upload requires alt text for accessibility.' }, { status: 400 });
      }

      const bookId = book.id || `book_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const nowIso = new Date().toISOString();

      const { error: insErr } = await supabase.from('books').upsert({
        id: bookId,
        slug: parsed.data.slug,
        title: parsed.data.title,
        subtitle: parsed.data.subtitle || null,
        author: parsed.data.author || 'Ann',
        category: parsed.data.category || 'Novel',
        status: parsed.data.status || 'published',
        short_description: parsed.data.shortDescription || null,
        description: parsed.data.description || null,
        cover: parsed.data.cover || 'quiet',
        cover_alt: parsed.data.coverAlt || null,
        tags: parsed.data.tags || ['fiction', 'literary'],
        moods: parsed.data.moods || ['reflective'],
        updated_at: nowIso,
      });

      if (insErr) {
        return NextResponse.json({ success: false, error: insErr.message }, { status: 500 });
      }

      if (Array.isArray(book.variants)) {
        for (const v of book.variants) {
          const varId = v.id || `var_${bookId}_${v.format?.toLowerCase() || 'std'}`;
          await supabase.from('book_variants').upsert({
            id: varId,
            book_id: bookId,
            format: v.format || 'Paperback',
            price: v.price || 1800,
            compare_at_price: v.compareAtPrice || null,
            cost: v.cost || 0,
            is_demo_cost: v.isDemoCost ?? true,
            sku: v.sku || `ANN-${parsed.data.title.slice(0, 4).toUpperCase()}-PB`,
            stock: v.stock ?? 50,
            low_stock_threshold: v.lowStockThreshold ?? 5,
            weight_grams: v.weightGrams ?? 450,
            signed_edition: Boolean(v.signedEdition),
            personalization: Boolean(v.personalization),
            updated_at: nowIso,
          });
        }
      }

      // Audit log row
      await supabase.from('audit_log').insert({
        actor_email: actorEmail,
        action: action === 'restore' ? 'books.restore' : 'books.create',
        entity: 'book',
        entity_id: bookId,
        before_state: null,
        after_state: { title: parsed.data.title, slug: parsed.data.slug, status: parsed.data.status },
        ip_hash: ipHash,
      });

      return NextResponse.json({ success: true, data: { id: bookId, ...book } });
    }

    if (action === 'update') {
      if (!id) return NextResponse.json({ success: false, error: 'Book ID required' }, { status: 400 });

      const { data: existing } = await supabase.from('books').select('*').eq('id', id).single();
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Book not found' }, { status: 404 });
      }

      const nowIso = new Date().toISOString();
      const updatePayload: Record<string, unknown> = { updated_at: nowIso };
      if (book.title !== undefined) updatePayload.title = book.title.trim();
      if (book.subtitle !== undefined) updatePayload.subtitle = book.subtitle.trim();
      if (book.slug !== undefined) updatePayload.slug = book.slug.trim();
      if (book.category !== undefined) updatePayload.category = book.category;
      if (book.status !== undefined) updatePayload.status = book.status;
      if (book.shortDescription !== undefined) updatePayload.short_description = book.shortDescription.trim();
      if (book.description !== undefined) updatePayload.description = book.description.trim();
      if (book.cover !== undefined) updatePayload.cover = book.cover;
      if (book.coverAlt !== undefined) updatePayload.cover_alt = book.coverAlt.trim();

      const { error: updErr } = await supabase.from('books').update(updatePayload).eq('id', id);
      if (updErr) {
        return NextResponse.json({ success: false, error: updErr.message }, { status: 500 });
      }

      // Audit log row
      await supabase.from('audit_log').insert({
        actor_email: actorEmail,
        action: 'books.update',
        entity: 'book',
        entity_id: id,
        before_state: { title: existing.title, status: existing.status },
        after_state: updatePayload,
        ip_hash: ipHash,
      });

      return NextResponse.json({ success: true, data: { ...existing, ...updatePayload } });
    }

    if (action === 'archive') {
      if (!id) return NextResponse.json({ success: false, error: 'Book ID required' }, { status: 400 });

      const { data: existing } = await supabase.from('books').select('*').eq('id', id).single();
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Book not found' }, { status: 404 });
      }

      const nowIso = new Date().toISOString();
      const { error: archErr } = await supabase.from('books').update({ status: 'archived', updated_at: nowIso }).eq('id', id);
      if (archErr) {
        return NextResponse.json({ success: false, error: archErr.message }, { status: 500 });
      }

      // Audit log row
      await supabase.from('audit_log').insert({
        actor_email: actorEmail,
        action: 'books.archive',
        entity: 'book',
        entity_id: id,
        before_state: { status: existing.status },
        after_state: { status: 'archived' },
        ip_hash: ipHash,
      });

      return NextResponse.json({ success: true, data: { ...existing, status: 'archived' } });
    }

    if (action === 'delete') {
      if (!id) return NextResponse.json({ success: false, error: 'Book ID required' }, { status: 400 });

      const { data: existing } = await supabase.from('books').select('*').eq('id', id).single();
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Book not found' }, { status: 404 });
      }

      await supabase.from('book_variants').delete().eq('book_id', id);
      const { error: delErr } = await supabase.from('books').delete().eq('id', id);
      if (delErr) {
        return NextResponse.json({ success: false, error: delErr.message }, { status: 500 });
      }

      // Audit log row
      await supabase.from('audit_log').insert({
        actor_email: actorEmail,
        action: 'books.delete',
        entity: 'book',
        entity_id: id,
        before_state: { title: existing.title },
        after_state: null,
        ip_hash: ipHash,
      });

      return NextResponse.json({ success: true, data: existing });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
