import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySignedSessionToken } from '@/lib/admin/session';

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

      const role = verified.role || 'support';

      // RBAC Guards:
      // 1. /admin/journal: allowed for owner, admin, editor; support & customers get 404
      if (pathname === '/admin/journal' || pathname.startsWith('/admin/journal/')) {
        const allowedRoles = ['owner', 'admin', 'editor'];
        if (!allowedRoles.includes(role)) {
          return NextResponse.rewrite(new URL('/not-found', request.url), { status: 404 });
        }
      }

      // 2. /admin/orders: editor role cannot reach /admin/orders
      if (pathname === '/admin/orders' || pathname.startsWith('/admin/orders/')) {
        if (role === 'editor') {
          return NextResponse.rewrite(new URL('/not-found', request.url), { status: 404 });
        }
      }

      // Idle Refresh: Reissue signed cookie with refreshed lastActiveAt timestamp
      if (verified.refreshedToken) {
        const response = NextResponse.next();
        response.cookies.set('ann_admin_session', verified.refreshedToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 12 * 60 * 60,
        });
        return response;
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
