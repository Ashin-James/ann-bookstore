import { test, expect } from '@playwright/test';

test.describe('TASK A: Admin Login Credentials & Security Suite', () => {
  const ENV_EMAIL = process.env.ADMIN_DEMO_EMAIL || 'admin-local@annsbookstore.com';
  const ENV_PASSWORD = process.env.ADMIN_DEMO_PASSWORD || 'LocalAdminSecret2026!';

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('ann-cookie-consent', 'accepted');
      } catch (_) {}
    });
  });

  test('1. Signed-out visitor gets 404 on /admin/books', async ({ page }) => {
    const response = await page.goto('/admin/books');
    expect(response?.status()).toBe(404);
    await expect(page.locator('text=Book Catalogue')).not.toBeVisible();
  });

  test('2. Wrong password fails with generic error message', async ({ page }) => {
    await page.goto('/admin/login');

    const emailInput = page.locator('#admin-email');
    const passwordInput = page.locator('#admin-password');
    const submitBtn = page.locator('button[type="submit"]');

    await emailInput.fill(ENV_EMAIL);
    await passwordInput.fill('DefinitelyWrongPassword123!');

    const resPromise = page.waitForResponse((res) => res.url().includes('/api/admin/auth'));
    await submitBtn.click();
    await resPromise;

    const errorBox = page.locator('[data-testid="admin-login-error"]');
    await expect(errorBox).toBeVisible();
    await expect(errorBox).toContainText(/Invalid email or password/i);
  });

  test('3. Five consecutive failed attempts lock the account', async ({ page }) => {
    await page.goto('/admin/login');

    const emailInput = page.locator('#admin-email');
    const passwordInput = page.locator('#admin-password');
    const submitBtn = page.locator('button[type="submit"]');

    const uniqueLockoutEmail = `lockout_pw_${Date.now()}@annsbookstore.com`;
    await emailInput.fill(uniqueLockoutEmail);
    await passwordInput.fill('WrongPassword123!');

    for (let i = 0; i < 5; i++) {
      const resPromise = page.waitForResponse((res) => res.url().includes('/api/admin/auth'));
      await submitBtn.click();
      await resPromise;
    }

    const errorBox = page.locator('[data-testid="admin-login-error"]');
    await expect(errorBox).toBeVisible();
    await expect(errorBox).toContainText(/Account locked after 5 failed attempts/i);
  });

  test('4. Login with env credentials works and sets session cookie', async ({ page, context }) => {
    await page.goto('/admin/login');

    const emailInput = page.locator('#admin-email');
    const passwordInput = page.locator('#admin-password');
    const submitBtn = page.locator('button[type="submit"]');

    await emailInput.fill(ENV_EMAIL);
    await passwordInput.fill(ENV_PASSWORD);

    const loginPromise = page.waitForResponse((res) => res.url().includes('/api/admin/auth') && res.status() === 200);
    await submitBtn.click();
    await loginPromise;

    await expect(page).toHaveURL(/\/admin\/dashboard/);

    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name === 'ann_admin_session');
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.httpOnly).toBe(true);
  });

  test('5. Logout works and subsequent /admin/books request returns 404', async ({ page, context }) => {
    await page.goto('/admin/login');

    // Login first
    await page.locator('#admin-email').fill(ENV_EMAIL);
    await page.locator('#admin-password').fill(ENV_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Click logout
    const logoutBtn = page.locator('[data-testid="admin-logout-button"]');
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click({ force: true });

    // Verify redirected to login
    await expect(page).toHaveURL(/\/admin\/login/);

    // Verify session cookie is deleted
    const cookiesAfter = await context.cookies();
    const sessionCookieAfter = cookiesAfter.find((c) => c.name === 'ann_admin_session');
    expect(sessionCookieAfter).toBeUndefined();

    // Verify /admin/books is now 404
    const response = await page.goto('/admin/books');
    expect(response?.status()).toBe(404);
  });

  test('6. Setup creates owner with min 12 char password, then disables itself', async ({ page }) => {
    await page.goto('/admin/setup');
    await expect(page.locator('h1')).toContainText(/Initialize Store Owner/i);

    // Verify minLength=12 attribute and browser constraint validation
    const pwInput = page.locator('#owner-password');
    await expect(pwInput).toHaveAttribute('minLength', '12');

    await page.locator('#setup-secret').fill('local_demo_setup_secret_32_characters_long');
    await page.locator('#owner-name').fill('Initial Owner');
    await page.locator('#owner-email').fill('setup-owner@annsbookstore.com');
    await pwInput.fill('short');
    const isTooShort = await pwInput.evaluate((el: HTMLInputElement) => el.validity.tooShort);
    expect(isTooShort).toBe(true);

    // Fill with valid >= 12 char password
    await pwInput.fill('SecurePassword2026!');
    const setupPromise = page.waitForResponse((res) => res.url().includes('/api/admin/auth') && res.status() === 200);
    await page.locator('button[type="submit"]').click();
    await setupPromise;

    // Verify recovery codes are shown
    await expect(page.locator('text=Save Your 10 Backup Recovery Codes')).toBeVisible();

    // Re-visiting /admin/setup now shows setup is disabled
    await page.goto('/admin/setup');
    await expect(page.locator('text=Store owner setup is disabled')).toBeVisible();
    await expect(page.locator('button:has-text("Go to Staff Login")')).toBeVisible();
  });

  test('7. Hand-typed unsigned cookie returns 404 on /admin/books and 401 on /api/admin/books', async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: 'ann_admin_session', value: 'hand_typed_arbitrary_session_cookie', url: 'http://localhost:3001' },
    ]);
    const page = await context.newPage();
    const res = await page.goto('/admin/books');
    expect(res?.status()).toBe(404);
    await expect(page.locator('text=Book Catalogue')).not.toBeVisible();

    const apiRes = await context.request.get('http://localhost:3001/api/admin/books', {
      headers: { Cookie: 'ann_admin_session=hand_typed_arbitrary_session_cookie' },
    });
    expect(apiRes.status()).toBe(401);
    await context.close();
  });

  test('8. Tampered signature on session cookie returns 404 on /admin/books', async ({ browser }) => {
    const context = await browser.newContext();
    // Tampered signature part at the end
    const now = Date.now();
    const tampered = `sess-1234.usr-owner.owner.${now}.${now}.${now + 43200000}.0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef`;
    await context.addCookies([
      { name: 'ann_admin_session', value: tampered, url: 'http://localhost:3001' },
    ]);
    const page = await context.newPage();
    const res = await page.goto('/admin/books');
    expect(res?.status()).toBe(404);
    await expect(page.locator('text=Book Catalogue')).not.toBeVisible();
    await context.close();
  });

  test('9. Expired session cookie (>30m idle or >12h max) returns 404 on /admin/books', async ({ browser }) => {
    const context = await browser.newContext();
    const now = Date.now();
    const expiredIdle = now - (35 * 60 * 1000); // 35 minutes ago
    const expiredToken = `sess-exp.usr-owner.owner.${expiredIdle - 10000}.${expiredIdle}.${expiredIdle + 43200000}.0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef`;
    await context.addCookies([
      { name: 'ann_admin_session', value: expiredToken, url: 'http://localhost:3001' },
    ]);
    const page = await context.newPage();
    const res = await page.goto('/admin/books');
    expect(res?.status()).toBe(404);
    await expect(page.locator('text=Book Catalogue')).not.toBeVisible();
    await context.close();
  });
});
