import { NextRequest, NextResponse } from 'next/server';
import { getAdminService } from '@/lib/admin/demo-admin-service';
import { hashIp } from '@/lib/admin/auth';
import {
  createSignedSessionToken,
  verifySignedSessionToken,
  getServerSessions,
  MAX_AGE_MS,
  SessionRecord,
} from '@/lib/admin/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'browser';
    const ipHash = hashIp(ip);
    const service = getAdminService();

    if (action === 'login') {
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
      }

      const res = await service.login({ email, password, ipHash, userAgent });
      if (!res.success) {
        return NextResponse.json(res, { status: res.error.code === 'LOCKED_OUT' ? 429 : 401 });
      }

      const response = NextResponse.json(res);
      if (res.data.session) {
        const sessionId = crypto.randomUUID();
        const now = Date.now();
        const sessionRecord: SessionRecord = {
          id: sessionId,
          userId: res.data.session.user.id,
          role: res.data.session.user.role,
          createdAt: now,
          lastActiveAt: now,
          expiresAt: now + MAX_AGE_MS,
        };
        getServerSessions().set(sessionId, sessionRecord);

        const signedToken = await createSignedSessionToken(sessionRecord);
        res.data.session.token = signedToken;

        response.cookies.set('ann_admin_session', signedToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 12 * 60 * 60, // 12 hours max
        });
      }
      return response;
    }

    if (action === 'verify_totp') {
      const { tempToken, totpCode } = body;
      const res = await service.verifyTotp({ tempToken, totpCode, ipHash, userAgent });
      if (!res.success) {
        return NextResponse.json(res, { status: 401 });
      }

      const response = NextResponse.json(res);
      if (res.data.session) {
        const sessionId = crypto.randomUUID();
        const now = Date.now();
        const sessionRecord: SessionRecord = {
          id: sessionId,
          userId: res.data.session.user.id,
          role: res.data.session.user.role,
          createdAt: now,
          lastActiveAt: now,
          expiresAt: now + MAX_AGE_MS,
        };
        getServerSessions().set(sessionId, sessionRecord);

        const signedToken = await createSignedSessionToken(sessionRecord);
        res.data.session.token = signedToken;

        response.cookies.set('ann_admin_session', signedToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 12 * 60 * 60,
        });
      }
      return response;
    }

    if (action === 'setup') {
      const { setupSecret, email, fullName, password } = body;
      const res = await service.setupOwner({
        setupSecret,
        email,
        fullName,
        password,
        ipHash,
        userAgent,
      });

      if (!res.success) {
        const status = res.error.code === 'SETUP_DISABLED' ? 403 : res.error.code === 'FORBIDDEN' ? 403 : 400;
        return NextResponse.json(res, { status });
      }

      const response = NextResponse.json(res);
      if (res.data?.session) {
        const sessionId = crypto.randomUUID();
        const now = Date.now();
        const sessionRecord: SessionRecord = {
          id: sessionId,
          userId: res.data.session.user.id,
          role: res.data.session.user.role,
          createdAt: now,
          lastActiveAt: now,
          expiresAt: now + MAX_AGE_MS,
        };
        getServerSessions().set(sessionId, sessionRecord);

        const signedToken = await createSignedSessionToken(sessionRecord);
        res.data.session.token = signedToken;

        response.cookies.set('ann_admin_session', signedToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 12 * 60 * 60,
        });
      }
      return response;
    }

    if (action === 'logout') {
      const sessionToken = request.cookies.get('ann_admin_session')?.value;
      if (sessionToken) {
        const parts = sessionToken.split('.');
        if (parts.length === 7) {
          getServerSessions().delete(parts[0]);
        }
        await service.logout(sessionToken);
      }
      const response = NextResponse.json({ success: true });
      response.cookies.delete('ann_admin_session');
      return response;
    }

    if (action === 'reset_demo') {
      const res = await service.resetDemoData();
      return NextResponse.json(res);
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action');

  if (action === 'config') {
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    const hasDemoEnv = Boolean(
      process.env.ADMIN_DEMO_EMAIL &&
      process.env.ADMIN_DEMO_PASSWORD &&
      process.env.ADMIN_DEMO_EMAIL.trim() !== '' &&
      process.env.ADMIN_DEMO_PASSWORD.trim() !== ''
    );
    return NextResponse.json({
      success: true,
      data: {
        isDemoMode,
        demoConfigured: hasDemoEnv,
      },
    });
  }

  if (action === 'setup_status') {
    const service = getAdminService();
    const available = await service.isSetupAvailable();
    return NextResponse.json({
      success: true,
      data: { available },
    });
  }

  const token = request.cookies.get('ann_admin_session')?.value;
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthenticated' }, { status: 401 });
  }

  const verified = await verifySignedSessionToken(token);
  if (!verified.valid || !verified.sessionId) {
    const response = NextResponse.json({ success: false, error: 'Unauthorized: Invalid or expired session' }, { status: 401 });
    response.cookies.delete('ann_admin_session');
    return response;
  }

  const response = NextResponse.json({
    success: true,
    data: {
      token: verified.refreshedToken || token,
      user: {
        id: verified.userId || 'usr_owner',
        email: process.env.ADMIN_DEMO_EMAIL || 'admin@annsbookstore.com',
        fullName: 'Store Admin',
        role: verified.role || 'owner',
      },
    },
  });

  if (verified.refreshedToken) {
    response.cookies.set('ann_admin_session', verified.refreshedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 60 * 60,
    });
  }

  return response;
}
