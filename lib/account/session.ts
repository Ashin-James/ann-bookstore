export const SESSION_COOKIE_NAME = 'ann_session';

export function setSessionCookie(userId: string): void {
  if (typeof document === 'undefined') return;
  // 30 days session expiry
  document.cookie = `${SESSION_COOKIE_NAME}=${userId}; path=/; max-age=2592000; SameSite=Lax`;
}

export function clearSessionCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function getSessionUserId(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${SESSION_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
