import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';

const SESSION_COOKIE_NAME = 'ann_session';
const LOCKOUT_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  isVerified: boolean;
  verificationToken?: string;
  resetToken?: string;
  resetTokenExpiry?: number;
  createdAt: number;
}

interface AttemptRecord {
  count: number;
  lastAttemptAt: number;
  lockedUntil?: number;
}

declare global {
  var __customer_accounts__: Map<string, CustomerRecord> | undefined;
  var __customer_login_attempts__: Map<string, AttemptRecord> | undefined;
  var __customer_rate_limits__: Map<string, { count: number; windowStart: number }> | undefined;
}

function getCustomerStorage(): Map<string, CustomerRecord> {
  if (!globalThis.__customer_accounts__) {
    globalThis.__customer_accounts__ = new Map();
    // Seed default Eleanor Vance demo customer
    const eleanorHash = hashPassword('Monsoon@2026!');
    globalThis.__customer_accounts__.set('reader.eleanor@example.com', {
      id: 'usr_demo_01',
      name: 'Eleanor Vance',
      email: 'reader.eleanor@example.com',
      passwordHash: eleanorHash,
      isVerified: true,
      createdAt: Date.now() - 30 * 86400000,
    });
  }
  return globalThis.__customer_accounts__;
}

function getLoginAttempts(): Map<string, AttemptRecord> {
  if (!globalThis.__customer_login_attempts__) {
    globalThis.__customer_login_attempts__ = new Map();
  }
  return globalThis.__customer_login_attempts__;
}

function getRateLimits(): Map<string, { count: number; windowStart: number }> {
  if (!globalThis.__customer_rate_limits__) {
    globalThis.__customer_rate_limits__ = new Map();
  }
  return globalThis.__customer_rate_limits__;
}

function hashPassword(password: string): string {
  const salt = 'ann_customer_salt_2026_';
  return crypto.createHash('sha256').update(salt + password).digest('hex');
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

function checkRateLimit(key: string, maxAttempts = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const limits = getRateLimits();
  const entry = limits.get(key) || { count: 0, windowStart: now };
  if (now - entry.windowStart > windowMs) {
    entry.count = 0;
    entry.windowStart = now;
  }
  entry.count += 1;
  limits.set(key, entry);
  return entry.count <= maxAttempts;
}

function checkLockout(email: string): { locked: boolean; remainingMinutes?: number } {
  const attempts = getLoginAttempts();
  const record = attempts.get(email);
  if (!record) return { locked: false };

  const now = Date.now();
  if (record.lockedUntil && record.lockedUntil > now) {
    const remainingMinutes = Math.ceil((record.lockedUntil - now) / 60000);
    return { locked: true, remainingMinutes };
  }
  if (record.lockedUntil && record.lockedUntil <= now) {
    attempts.delete(email);
  }
  return { locked: false };
}

function recordFailedAttempt(email: string): { locked: boolean } {
  const attempts = getLoginAttempts();
  const now = Date.now();
  const record = attempts.get(email) || { count: 0, lastAttemptAt: now };

  if (now - record.lastAttemptAt > LOCKOUT_DURATION_MS) {
    record.count = 0;
  }
  record.count += 1;
  record.lastAttemptAt = now;

  if (record.count >= LOCKOUT_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    attempts.set(email, record);
    return { locked: true };
  }
  attempts.set(email, record);
  return { locked: false };
}

function clearFailedAttempts(email: string) {
  getLoginAttempts().delete(email);
}

// Zod schemas
const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    email: z.string().trim().email('Please enter a valid email address'),
    password: z.string().min(12, 'Password must be at least 12 characters'),
    confirmPassword: z.string().min(12, 'Password must be at least 12 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const forgotSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
});

const resetSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(12, 'Password must be at least 12 characters'),
    confirmPassword: z.string().min(12, 'Password must be at least 12 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const action = body.action;
    const storage = getCustomerStorage();

    // 1. REGISTER
    if (action === 'register') {
      const parsed = registerSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: parsed.error.issues[0].message },
          { status: 400 }
        );
      }

      const { name, email, password } = parsed.data;
      const normalizedEmail = email.toLowerCase();

      // Check duplicate email
      if (storage.has(normalizedEmail)) {
        return NextResponse.json(
          {
            success: false,
            error: 'An account with this email address already exists. Please sign in.',
          },
          { status: 409 }
        );
      }

      // Create new customer account with hashed password
      const verificationToken = crypto.randomBytes(24).toString('hex');
      const newAccount: CustomerRecord = {
        id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name,
        email: normalizedEmail,
        passwordHash: hashPassword(password),
        isVerified: false,
        verificationToken,
        createdAt: Date.now(),
      };

      storage.set(normalizedEmail, newAccount);

      const verificationLink = `/register?verifyToken=${verificationToken}`;
      console.log(`[Demo Customer Auth] Verification link: ${verificationLink}`);

      // Real mode Resend integration stub
      if (process.env.RESEND_API_KEY) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: 'Ann’s Bookstore <orders@annsbookstore.demo>',
              to: [normalizedEmail],
              subject: 'Verify your reader account',
              html: `<p>Welcome to Ann’s Bookstore, ${name}!</p><p><a href="${verificationLink}">Click here to verify your account</a></p>`,
            }),
          });
        } catch (_) {}
      }

      return NextResponse.json({
        success: true,
        data: {
          id: newAccount.id,
          name: newAccount.name,
          email: newAccount.email,
          isVerified: false,
          verificationLink,
        },
      });
    }

    // 2. VERIFY EMAIL
    if (action === 'verify_email') {
      const token = body.token?.trim();
      if (!token) {
        return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
      }

      let foundAccount: CustomerRecord | undefined;
      for (const acc of storage.values()) {
        if (acc.verificationToken === token) {
          foundAccount = acc;
          break;
        }
      }

      if (!foundAccount) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired verification link.' },
          { status: 400 }
        );
      }

      foundAccount.isVerified = true;
      delete foundAccount.verificationToken;
      storage.set(foundAccount.email, foundAccount);

      return NextResponse.json({
        success: true,
        message: 'Email verified successfully! You can now access your full reader privileges.',
      });
    }

    // 3. LOGIN
    if (action === 'login') {
      const parsed = loginSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: parsed.error.issues[0].message },
          { status: 400 }
        );
      }

      const { email, password } = parsed.data;
      const normalizedEmail = email.toLowerCase();

      // Check lockout
      const lockout = checkLockout(normalizedEmail);
      if (lockout.locked) {
        return NextResponse.json(
          {
            success: false,
            error: `Account locked after 5 failed attempts. Please retry in ${lockout.remainingMinutes} minutes.`,
          },
          { status: 429 }
        );
      }

      const account = storage.get(normalizedEmail);
      if (!account || !verifyPassword(password, account.passwordHash)) {
        const lockRes = recordFailedAttempt(normalizedEmail);
        if (lockRes.locked) {
          return NextResponse.json(
            {
              success: false,
              error: 'Account locked after 5 failed attempts. Please retry in 15 minutes.',
            },
            { status: 429 }
          );
        }
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      clearFailedAttempts(normalizedEmail);

      const response = NextResponse.json({
        success: true,
        data: {
          id: account.id,
          name: account.name,
          email: account.email,
          isVerified: account.isVerified,
        },
      });

      // Set customer session cookie (separate from admin cookie)
      response.cookies.set(SESSION_COOKIE_NAME, account.id, {
        httpOnly: false, // Accessible to client auth adapter
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });

      return response;
    }

    // 4. LOGOUT
    if (action === 'logout') {
      const response = NextResponse.json({ success: true });
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    // 5. FORGOT PASSWORD
    if (action === 'forgot_password') {
      const parsed = forgotSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: parsed.error.issues[0].message },
          { status: 400 }
        );
      }

      const { email } = parsed.data;
      const account = storage.get(email.toLowerCase());

      let resetLink: string | undefined;
      if (account) {
        const resetToken = crypto.randomBytes(24).toString('hex');
        account.resetToken = resetToken;
        account.resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
        storage.set(account.email, account);

        resetLink = `/login?mode=reset&token=${resetToken}`;
        console.log(`[Demo Customer Auth] Password reset link: ${resetLink}`);
      }

      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email address, a password reset link has been dispatched.',
        resetLink,
      });
    }

    // 6. RESET PASSWORD
    if (action === 'reset_password') {
      const parsed = resetSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: parsed.error.issues[0].message },
          { status: 400 }
        );
      }

      const { token, password } = parsed.data;
      let foundAccount: CustomerRecord | undefined;

      for (const acc of storage.values()) {
        if (acc.resetToken === token) {
          foundAccount = acc;
          break;
        }
      }

      const now = Date.now();
      if (!foundAccount || !foundAccount.resetTokenExpiry || foundAccount.resetTokenExpiry < now) {
        return NextResponse.json(
          { success: false, error: 'Password reset link is invalid or has expired.' },
          { status: 400 }
        );
      }

      foundAccount.passwordHash = hashPassword(password);
      delete foundAccount.resetToken;
      delete foundAccount.resetTokenExpiry;
      storage.set(foundAccount.email, foundAccount);

      return NextResponse.json({
        success: true,
        message: 'Your password has been reset successfully. Please sign in with your new password.',
      });
    }

    // 7. CHANGE PASSWORD
    if (action === 'change_password') {
      const { email, currentPassword, newPassword } = body;
      const account = storage.get(email?.toLowerCase());
      if (!account || !verifyPassword(currentPassword, account.passwordHash)) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect.' },
          { status: 400 }
        );
      }

      if (!newPassword || newPassword.length < 12) {
        return NextResponse.json(
          { success: false, error: 'New password must be at least 12 characters.' },
          { status: 400 }
        );
      }

      account.passwordHash = hashPassword(newPassword);
      storage.set(account.email, account);

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully.',
      });
    }

    // 8. DELETE ACCOUNT
    if (action === 'delete_account') {
      const { email } = body;
      if (email) {
        storage.delete(email.toLowerCase());
      }
      const response = NextResponse.json({ success: true });
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const token = searchParams.get('token');
  const storage = getCustomerStorage();

  if (action === 'verify' && token) {
    let foundAccount: CustomerRecord | undefined;
    for (const acc of storage.values()) {
      if (acc.verificationToken === token) {
        foundAccount = acc;
        break;
      }
    }

    if (!foundAccount) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification token.' },
        { status: 400 }
      );
    }

    foundAccount.isVerified = true;
    delete foundAccount.verificationToken;
    storage.set(foundAccount.email, foundAccount);

    return NextResponse.json({
      success: true,
      data: {
        id: foundAccount.id,
        name: foundAccount.name,
        email: foundAccount.email,
        isVerified: true,
      },
    });
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return NextResponse.json({ success: true, data: { isLoggedIn: false } });
  }

  let foundAccount: CustomerRecord | undefined;
  for (const acc of storage.values()) {
    if (acc.id === sessionCookie) {
      foundAccount = acc;
      break;
    }
  }

  if (!foundAccount) {
    return NextResponse.json({ success: true, data: { isLoggedIn: false } });
  }

  return NextResponse.json({
    success: true,
    data: {
      isLoggedIn: true,
      user: {
        id: foundAccount.id,
        name: foundAccount.name,
        email: foundAccount.email,
        isVerified: foundAccount.isVerified,
      },
    },
  });
}

