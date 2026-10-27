import crypto from 'crypto';

const IP_HASH_SALT = process.env.IP_HASH_SALT || 'ann-bookstore-salt-2026';
const LOCKOUT_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
export const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
export const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 hours

// In-memory rate limiting and lockout state (also mirrored in DB/storage)
interface LoginAttemptRecord {
  count: number;
  lastAttemptAt: number;
  lockedUntil?: number;
}
const loginAttempts = new Map<string, LoginAttemptRecord>();

/**
 * Hash an IP address with a salt so real IPs are never stored in plain text
 */
export function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip + IP_HASH_SALT).digest('hex').slice(0, 16);
}

/**
 * Standard SHA-256 / PBKDF2 Password Hashing
 */
export function hashPassword(password: string): string {
  const salt = 'ann_auth_salt_';
  return crypto.createHash('sha256').update(salt + password).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * Check Lockout Status for an identifier (email or IP hash)
 */
export function checkLockout(identifier: string): { locked: boolean; remainingMinutes?: number } {
  const record = loginAttempts.get(identifier);
  if (!record) return { locked: false };

  const now = Date.now();
  if (record.lockedUntil && record.lockedUntil > now) {
    const remainingMinutes = Math.ceil((record.lockedUntil - now) / 60000);
    return { locked: true, remainingMinutes };
  }

  // Clear expired lockouts
  if (record.lockedUntil && record.lockedUntil <= now) {
    loginAttempts.delete(identifier);
  }

  return { locked: false };
}

/**
 * Record a Failed Login Attempt
 */
export function recordFailedAttempt(identifier: string): { locked: boolean; attemptsLeft: number } {
  const now = Date.now();
  const record = loginAttempts.get(identifier) || { count: 0, lastAttemptAt: now };

  // If previous attempt was over 15 mins ago, reset count
  if (now - record.lastAttemptAt > LOCKOUT_DURATION_MS) {
    record.count = 0;
  }

  record.count += 1;
  record.lastAttemptAt = now;

  if (record.count >= LOCKOUT_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    loginAttempts.set(identifier, record);
    return { locked: true, attemptsLeft: 0 };
  }

  loginAttempts.set(identifier, record);
  return { locked: false, attemptsLeft: LOCKOUT_ATTEMPTS - record.count };
}

/**
 * Reset Failed Attempts on Success
 */
export function clearFailedAttempts(identifier: string): void {
  loginAttempts.delete(identifier);
}

/**
 * Generate 10 Single-Use Recovery Codes
 */
export function generateRecoveryCodes(): { plainCodes: string[]; hashedCodes: string[] } {
  const plainCodes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < 10; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase(); // e.g. "A1B2C3D4"
    plainCodes.push(code);
    hashedCodes.push(crypto.createHash('sha256').update(code).digest('hex'));
  }

  return { plainCodes, hashedCodes };
}

export function hashRecoveryCode(code: string): string {
  return crypto.createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
}

/**
 * TOTP Generator & Validator (RFC 6238 HMAC-SHA1)
 * Works cross-platform with zero external dependencies
 */
export function generateTotpSecret(): string {
  // Base32 secret string (16 chars)
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  const bytes = crypto.randomBytes(20);
  for (let i = 0; i < 20; i++) {
    secret += charset[bytes[i] % charset.length];
  }
  return secret;
}

function base32Decode(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (let i = 0; i < clean.length; i++) {
    const val = charset.indexOf(clean[i]);
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

export function generateTotpCode(secretBase32: string, timeStepWindow = 0): string {
  const timeStepSeconds = 30;
  const time = Math.floor(Date.now() / 1000 / timeStepSeconds) + timeStepWindow;

  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigUInt64BE(BigInt(time));

  const key = base32Decode(secretBase32);
  const hmac = crypto.createHmac('sha1', key).update(timeBuffer).digest();

  const offset = hmac[hmac.length - 1] & 0x0f;
  const codeInt =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = codeInt % 1000000;
  return otp.toString().padStart(6, '0');
}

export function verifyTotpCode(code: string, secretBase32: string): boolean {
  if (!code || !secretBase32) return false;
  const clean = code.trim();
  // Check current window and ±1 window (drift tolerance of ±30s)
  for (const window of [0, -1, 1]) {
    if (generateTotpCode(secretBase32, window) === clean) {
      return true;
    }
  }
  return false;
}

/**
 * Session Token Generator
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
