import { NextRequest, NextResponse } from 'next/server';
import { getAdminService } from '@/lib/admin/service-factory';
import { hashIp } from '@/lib/admin/auth';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const ipHash = hashIp(ip);

    const body = await request.json().catch(() => ({}));
    const { action = 'subscribe', email, source = 'home footer', token } = body;

    const service = getAdminService();

    if (action === 'subscribe') {
      if (!service.subscribeNewsletter) {
        return NextResponse.json({ success: false, error: 'Newsletter service not available' }, { status: 500 });
      }
      const res = await service.subscribeNewsletter({ email, source, ipHash });
      if (!res.success) {
        const status = res.error.code === 'RATE_LIMITED' ? 429 : 400;
        return NextResponse.json({ success: false, error: res.error.message }, { status });
      }
      return NextResponse.json({ success: true, ...res.data });
    }

    if (action === 'confirm') {
      if (!service.confirmNewsletter) {
        return NextResponse.json({ success: false, error: 'Newsletter service not available' }, { status: 500 });
      }
      const res = await service.confirmNewsletter({ token, ipHash });
      if (!res.success) {
        return NextResponse.json({ success: false, error: res.error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, ...res.data });
    }

    if (action === 'unsubscribe') {
      if (!service.unsubscribeNewsletter) {
        return NextResponse.json({ success: false, error: 'Newsletter service not available' }, { status: 500 });
      }
      const res = await service.unsubscribeNewsletter({ token, ipHash });
      if (!res.success) {
        return NextResponse.json({ success: false, error: res.error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, ...res.data });
    }

    if (action === 'resubscribe') {
      if (!service.resubscribeNewsletter) {
        return NextResponse.json({ success: false, error: 'Newsletter service not available' }, { status: 500 });
      }
      const res = await service.resubscribeNewsletter({ token, ipHash });
      if (!res.success) {
        return NextResponse.json({ success: false, error: res.error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, ...res.data });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

