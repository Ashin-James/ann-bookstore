import { test, expect } from '@playwright/test';

test.describe('TASK C: Customer Registration, Verification & Auth Suite', () => {
  test.describe.configure({ mode: 'serial' });

  const timestamp = Date.now();
  const testEmail = `reader_test_${timestamp}@example.com`;
  const testPassword = 'ReaderSecretPassword2026!#';
  const updatedPassword = 'NewSecretPassword2026!#';

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('ann-cookie-consent', 'accepted');
      } catch (_) {}
    });
  });

  test('1. Header shows visible "Sign in" and "Register" links when signed out', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('ann-bookstore-signed-out', 'true');
      localStorage.removeItem('ann-bookstore-user');
      document.cookie = 'ann_session=; path=/; max-age=0';
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const signinLink = page.locator('.header-signin-link');
    const registerLink = page.locator('.header-register-link');

    await expect(signinLink).toBeVisible();
    await expect(signinLink).toContainText(/Sign in/i);
    await expect(signinLink).toHaveAttribute('href', '/login');

    await expect(registerLink).toBeVisible();
    await expect(registerLink).toContainText(/Register/i);
    await expect(registerLink).toHaveAttribute('href', '/register');

    // Click Register navigates to /register
    await registerLink.click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('2. Customer registration with Zod validation and on-screen demo email verification', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' });

    await page.fill('#register-name', 'Jane Reader');
    await page.fill('#register-email', testEmail);
    await page.fill('#register-password', testPassword);
    await page.fill('#register-confirm-password', testPassword);

    await page.click('button[type="submit"]');

    // Expect registration success message
    const successAlert = page.locator('[data-testid="register-success"]');
    await expect(successAlert).toBeVisible();
    await expect(successAlert).toContainText(/Account created successfully/i);

    // Expect demo verification link on screen
    const verifyLink = page.locator('[data-testid="demo-verification-link"]');
    await expect(verifyLink).toBeVisible();

    // Click demo verification link
    await verifyLink.click();

    // Verification alert confirmation
    const verifiedAlert = page.locator('[data-testid="verification-success-alert"]');
    await expect(verifiedAlert).toBeVisible();
    await expect(verifiedAlert).toContainText(/Email verified successfully/i);
  });

  test('3. Verified customer login, session persistence, and logout', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    await page.fill('#customer-login-email', testEmail);
    await page.fill('#customer-login-password', testPassword);
    await page.click('button[type="submit"]');

    // Lands on Account page
    await expect(page).toHaveURL(/\/account/);
    await expect(page.locator('h1')).toContainText(/Your Account/i);

    // Header now displays "Account" instead of "Sign in"
    const accountHeaderLink = page.locator('.header-account-link');
    await expect(accountHeaderLink).toBeVisible();
    await expect(accountHeaderLink).toContainText(/Account/i);

    // Logout
    const signoutBtn = page.locator('button:has-text("Sign Out")').first();
    await signoutBtn.click();

    // Header updates to signed-out state
    await expect(page.locator('.header-signin-link')).toBeVisible();
  });

  test('4. Forgot password and reset password flow (single-use 1-hour token)', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    // Switch to forgot password mode
    await page.click('button:has-text("Forgot password?")');
    await expect(page.locator('h1')).toHaveText(/Reset Password/i);

    await page.fill('#customer-login-email', testEmail);
    await page.click('button[type="submit"]');

    // Demo reset link banner appears on screen
    const resetLink = page.locator('[data-testid="demo-reset-link"]');
    await expect(resetLink).toBeVisible();

    // Click reset link
    await resetLink.click();
    await expect(page.locator('h1')).toHaveText(/Set New Password/i);

    // Fill new password (min 12 chars)
    await page.fill('#customer-new-password', updatedPassword);
    await page.fill('#customer-confirm-password', updatedPassword);
    await page.click('button[type="submit"]');

    // Expect success message
    const successBox = page.locator('[data-testid="customer-login-success"]');
    await expect(successBox).toBeVisible();
    await expect(successBox).toContainText(/Your password has been reset successfully/i);

    // Verify login with updated password works
    await page.fill('#customer-login-email', testEmail);
    await page.fill('#customer-login-password', updatedPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/account/);
  });

  test('5. Five failed consecutive login attempts lock the account for 15 minutes', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    const lockEmail = `customer_lock_${Date.now()}@example.com`;
    await page.fill('#customer-login-email', lockEmail);
    await page.fill('#customer-login-password', 'WrongPassword123!');

    for (let i = 0; i < 5; i++) {
      await page.click('button[type="submit"]');
      await page.waitForTimeout(150);
    }

    const errorAlert = page.locator('[data-testid="customer-login-error"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/Account locked after 5 failed attempts/i);
  });

  test('6. Customer session cookie cannot access admin routes (404 isolation)', async ({ page, context }) => {
    // Set customer cookie ann_session
    await context.addCookies([
      {
        name: 'ann_session',
        value: 'customer-test-id-12345',
        path: '/',
        domain: 'localhost',
      },
    ]);

    // Attempt visiting /admin/books
    const response = await page.goto('/admin/books');
    expect(response?.status()).toBe(404);
    await expect(page.locator('text=Book Catalogue')).not.toBeVisible();

    // Attempt visiting /admin/orders
    const ordersRes = await page.goto('/admin/orders');
    expect(ordersRes?.status()).toBe(404);
  });
});
