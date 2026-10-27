import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionCookie = request.cookies.get('ann_session')?.value;

  // Admin Route Protection & Security Guards
  if (pathname === '/admin' || pathname.startsWith('/admin/') || pathname.startsWith('/api/admin/')) {
    const adminEnabled = process.env.ADMIN_ENABLED === 'true';
    if (!adminEnabled) {
      return NextResponse.rewrite(new URL('/not-found', request.url), { status: 404 });
    }

    // Public onboarding & auth endpoints within admin
    const isPublicAdminRoute =
      pathname === '/admin/login' ||
      pathname === '/admin/setup' ||
      pathname.startsWith('/admin/invite') ||
      pathname === '/api/admin/auth' ||
      pathname.startsWith('/api/admin/auth/');

    const adminSessionCookie = request.cookies.get('ann_admin_session')?.value;

    if (!isPublicAdminRoute && !adminSessionCookie) {
      // Return real 404 to non-admins and signed-out visitors (no discovery)
      return NextResponse.rewrite(new URL('/not-found', request.url), { status: 404 });
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
