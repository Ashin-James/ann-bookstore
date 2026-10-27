import { NextRequest, NextResponse } from 'next/server';
import { getAdminService } from '@/lib/admin/demo-admin-service';
import { hashIp } from '@/lib/admin/auth';

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
        response.cookies.set('ann_admin_session', res.data.session.token, {
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
      response.cookies.set('ann_admin_session', res.data.session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 12 * 60 * 60,
      });
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
        return NextResponse.json(res, { status: 400 });
      }

      const response = NextResponse.json(res);
      response.cookies.set('ann_admin_session', res.data.session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 12 * 60 * 60,
      });
      return response;
    }

    if (action === 'logout') {
      const sessionToken = request.cookies.get('ann_admin_session')?.value;
      if (sessionToken) {
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
  const token = request.cookies.get('ann_admin_session')?.value;
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthenticated' }, { status: 401 });
  }

  const service = getAdminService();
  const res = await service.getSession(token);
  if (!res.success) {
    const response = NextResponse.json(res, { status: 401 });
    response.cookies.delete('ann_admin_session');
    return response;
  }

  return NextResponse.json(res);
}
