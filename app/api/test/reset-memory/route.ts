import { NextResponse } from 'next/server';

export async function POST() {
  // Only accessible when NODE_ENV === 'test'
  if (process.env.NODE_ENV !== 'test') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (globalThis.__admin_session_records__) {
    globalThis.__admin_session_records__.clear();
  }

  return NextResponse.json({ success: true, message: 'Server memory reset' });
}

export async function GET() {
  if (process.env.NODE_ENV !== 'test') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ count: globalThis.__admin_session_records__?.size ?? 0 });
}
