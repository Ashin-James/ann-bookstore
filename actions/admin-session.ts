'use server';

import { cookies } from 'next/headers';
import { verifySignedSessionToken, SESSION_COOKIE_NAME } from '@/lib/admin/session';

/**
 * Server-side check returning only a boolean for the current admin session cookie.
 */
export async function checkAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return false;
    const verified = await verifySignedSessionToken(token);
    return Boolean(verified.valid);
  } catch {
    return false;
  }
}
