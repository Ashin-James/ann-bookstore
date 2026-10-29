/**
 * Shared Web Crypto session signing and verification for Edge Middleware and Node Route Handlers.
 * Completely stateless in Demo Mode (validity relies strictly on HMAC-SHA256 signature + timestamps).
 */

export const SESSION_COOKIE_NAME = 'ann_admin_session';
export const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
export const MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 hours

export interface SessionRecord {
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

export function getServerSessions(): Map<string, SessionRecord> {
  if (!globalThis.__admin_session_records__) {
    globalThis.__admin_session_records__ = new Map();
  }
  return globalThis.__admin_session_records__;
}

/**
 * Creates a cryptographically signed HMAC token for the session using Web Crypto.
 */
export async function createSignedSessionToken(
  session: {
    id: string;
    userId: string;
    role: string;
    createdAt: number;
    lastActiveAt: number;
    expiresAt: number;
  },
  customSecret?: string
): Promise<string> {
  const secret = customSecret || process.env.SESSION_SECRET || 'ann-bookstore-default-dev-session-secret-min-32-chars';
  const data = `${session.id}.${session.userId}.${session.role}.${session.createdAt}.${session.lastActiveAt}.${session.expiresAt}`;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const hexSig = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return `${data}.${hexSig}`;
}

/**
 * Edge-compatible session verification using Web Crypto API only.
 * Stateless in demo mode (depends ONLY on HMAC signature + timestamps).
 */
export async function verifySignedSessionToken(
  token: string | undefined,
  customSecret?: string
): Promise<{
  valid: boolean;
  sessionId?: string;
  userId?: string;
  role?: string;
  createdAt?: number;
  lastActiveAt?: number;
  expiresAt?: number;
  refreshedToken?: string;
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
  const secret = customSecret || process.env.SESSION_SECRET || 'ann-bookstore-default-dev-session-secret-min-32-chars';
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

    // 4. In demo mode (NEXT_PUBLIC_DEMO_MODE=true), session validity is stateless and DOES NOT depend on in-memory records.
    // In real mode (NEXT_PUBLIC_DEMO_MODE !== true), check persistent Supabase sessions table.
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    if (!isDemoMode) {
      // Real-mode session revocation check (requires Supabase sessions table)
      return { valid: false };
    }

    // 5. Idle refresh: compute refreshed token with updated lastActiveAt (preserving createdAt and expiresAt)
    let refreshedToken: string | undefined;
    if (now - lastActiveAt >= 1000) {
      refreshedToken = await createSignedSessionToken(
        {
          id: sessionId,
          userId,
          role,
          createdAt,
          lastActiveAt: now,
          expiresAt,
        },
        secret
      );
    }

    return {
      valid: true,
      sessionId,
      userId,
      role,
      createdAt,
      lastActiveAt,
      expiresAt,
      refreshedToken,
    };
  } catch {
    return { valid: false };
  }
}
