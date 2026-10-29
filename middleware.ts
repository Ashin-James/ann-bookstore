import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface SessionRecord {
  id: string;
  userId: string;
  role: string;
  createdAt: number;
  lastActiveAt: number;
  expiresAt: number;
}

declare global {
  var __admin_session_records__: Map<string, SessionRecord> | undefined;
}

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Edge-compatible session signature & expiry verification using Web Crypto API.
 */
async function verifySignedSessionToken(token: string | undefined): Promise<{
  valid: boolean;
  sessionId?: string;
  userId?: string;
  role?: string;
}> {
  if (!token) return { valid: false };

  // Expected Format: ${sessionId}.${userId}.${role}.${createdAt}.${lastActiveAt}.${expiresAt}.${signature}
  const parts = token.split('.');
  if (parts.length !== 7) return { valid: false };

  const [sessionId, userId, role, createdAtStr, lastActiveAtStr, expiresAtStr, signature] = parts;
  const createdAt = parseInt(createdAtStr, 10);
  const lastActiveAt = parseInt(lastActiveAtStr, 10);
  const expiresAt = parseInt(expiresAtStr, 10);

  if (isNaN(createdAt) || isNaN(lastActiveAt) || isNaN(expiresAt)) {
    return { valid: false };
  }

  const now = Date.now();

  // 1. Check 30-minute idle timeout
  if (now - lastActiveAt > IDLE_TIMEOUT_MS) {
    return { valid: false };
  }

  // 2. Check 12-hour absolute maximum lifespan
  if (now > expiresAt || now - createdAt > MAX_AGE_MS) {
    return { valid: false };
  }

  // 3. Verify HMAC signature using Web Crypto
  const secret = process.env.SESSION_SECRET || 'ann-bookstore-default-dev-session-secret-min-32-chars';
  const data = `${sessionId}.${userId}.${role}.${createdAtStr}.${lastActiveAtStr}.${expiresAtStr}`;

  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    if (signature.length !== 64) return { valid: false };
    const sigBytes = new Uint8Array(32);
    for (let i = 0; i < 64; i += 2) {
      sigBytes[i / 2] = parseInt(signature.slice(i, i + 2), 16);
    }

    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(data));
    if (!isValid) return { valid: false };

    // 4. Verify server-side session record exists (when in-memory store is available in this process)
    if (globalThis.__admin_session_records__) {
      const record = globalThis.__admin_session_records__.get(sessionId);
      if (!record) {
        return { valid: false };
      }
      if (now - record.lastActiveAt > IDLE_TIMEOUT_MS || now > record.expiresAt) {
        globalThis.__admin_session_records__.delete(sessionId);
        return { valid: false };
      }
      record.lastActiveAt = now;
    }

    return { valid: true, sessionId, userId, role };
  } catch {
    return { valid: false };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionCookie = request.cookies.get('ann_session')?.value;

  // Admin Route Protection & Security Guards
  if (pathname === '/admin' || pathname.startsWith('/admin/') || pathname.startsWith('/api/admin/')) {
    const adminEnabled = process.env.ADMIN_ENABLED === 'true';
    if (!adminEnabled) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.rewrite(new URL('/not-found', request.url), { status: 404 });
    }

    // Public onboarding endpoints within admin (login, setup, invite)
    const isPublicAdminPage =
      pathname === '/admin/login' ||
      pathname === '/admin/setup' ||
      pathname.startsWith('/admin/invite');

    // Authentication API endpoint manages its own public/private actions
    const isAuthApi = pathname === '/api/admin/auth' || pathname.startsWith('/api/admin/auth/');

    if (!isPublicAdminPage && !isAuthApi) {
      const adminSessionCookie = request.cookies.get('ann_admin_session')?.value;
      const verified = await verifySignedSessionToken(adminSessionCookie);

      if (!verified.valid) {
        // Return 401 for API endpoints, 404 for page routes (no discovery)
        if (pathname.startsWith('/api/admin/')) {
          return NextResponse.json({ error: 'Unauthorized: Invalid or missing session' }, { status: 401 });
        }
        return NextResponse.rewrite(new URL('/not-found', request.url), { status: 404 });
      }
    }
  }

  // Protect /account and all /account/* routes
  if (pathname === '/account' || pathname.startsWith('/account/')) {
    if (!sessionCookie) {
      const fullPath = pathname + search;
      // Ensure same-site path only (starts with / and not //)
      const safeNext =
        fullPath.startsWith('/') && !fullPath.startsWith('//') ? fullPath : '/account';
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', safeNext);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in and visiting /login, redirect to next or /account
  if (pathname === '/login' && sessionCookie) {
    const nextParam = request.nextUrl.searchParams.get('next');
    const safeNext =
      nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
        ? nextParam
        : '/account';
    return NextResponse.redirect(new URL(safeNext, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/account',
    '/account/:path*',
    '/login',
    '/admin',
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
