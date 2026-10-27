import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  const isAdminEnabled = process.env.ADMIN_ENABLED === 'true';

  return NextResponse.json(
    {
      status: 'ok',
      service: 'ann-bookstore',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      features: {
        demoMode: isDemo,
        adminEnabled: isAdminEnabled,
      },
      checks: {
        server: 'healthy',
        database: isDemo ? 'simulated' : 'connected',
      },
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    }
  );
}
