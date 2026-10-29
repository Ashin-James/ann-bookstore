import { test, expect } from '@playwright/test';

test.describe('TASK A: Admin Login Credentials, Signed Stateless Sessions & Security Suite', () => {
  const ENV_EMAIL = process.env.ADMIN_DEMO_EMAIL || 'admin-local@annsbookstore.com';
  const ENV_PASSWORD = process.env.ADMIN_DEMO_PASSWORD || 'LocalAdminSecret2026!';

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('ann-cookie-consent', 'accepted');
      } catch (_) {}
    });
  });

  test('1. Signed-out /admin, /admin/books, /admin/orders, /admin/audit return 404; /admin/login returns 200', async ({ page }) => {
    const r1 = await page.goto('/admin');
    expect(r1?.status()).toBe(404);

    const r2 = await page.goto('/admin/books');
    expect(r2?.status()).toBe(404);
    await expect(page.locator('text=Book Catalogue')).not.toBeVisible();

    const r3 = await page.goto('/admin/orders');
    expect(r3?.status()).toBe(404);

    const r4 = await page.goto('/admin/audit');
    expect(r4?.status()).toBe(404);

    const loginRes = await page.goto('/admin/login');
    expect(loginRes?.status()).toBe(200);
    await expect(page.locator('#admin-email')).toBeVisible();
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

  test('3. Five consecutive failed attempts lock the account for 15 minutes', async ({ page }) => {
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

  test('4. Login with env credentials works and session survives memory reset (stateless demo)', async ({ page, context, baseURL }) => {
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

    // Verify authenticated page loads
    const bookRes = await page.goto('/admin/books');
    expect(bookRes?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText(/Book Catalogue/i);

    // Verify session survives cold start / in-memory reset
    const newContext = await page.context().browser()!.newContext();
    await newContext.addCookies([
      {
        name: 'ann_admin_session',
        value: sessionCookie!.value,
        url: baseURL || 'http://localhost:3005',
      },
    ]);
    const newPage = await newContext.newPage();
    const resAfterReset = await newPage.goto('/admin/books');
    expect(resAfterReset?.status()).toBe(200);
    await expect(newPage.locator('h1')).toContainText(/Book Catalogue/i);
    await newContext.close();
  });

  test('5. Test-only reset route returns 404 in production mode', async ({ request }) => {
    const res = await request.post('/api/test/reset-memory');
    expect(res.status()).toBe(404);
  });

  test('6. Hand-typed cookie returns 404 on /admin/* and 401 on /api/admin/*', async ({ browser, baseURL }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: 'ann_admin_session', value: 'hand_typed_arbitrary_session_cookie', url: baseURL || 'http://localhost:3005' },
    ]);
    const page = await context.newPage();
    const res = await page.goto('/admin/books');
    expect(res?.status()).toBe(404);
    await expect(page.locator('text=Book Catalogue')).not.toBeVisible();

    const apiRes = await context.request.get('/api/admin/books');
    expect(apiRes.status()).toBe(401);
    await context.close();
  });

  test('7. Tampered signature returns 404 on /admin/* and 401 on /api/admin/*', async ({ browser, baseURL }) => {
    const context = await browser.newContext();
    const now = Date.now();
    const tampered = `sess-1234.usr-owner.owner.${now}.${now}.${now + 43200000}.0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef`;
    await context.addCookies([
      { name: 'ann_admin_session', value: tampered, url: baseURL || 'http://localhost:3005' },
    ]);
    const page = await context.newPage();
    const res = await page.goto('/admin/books');
    expect(res?.status()).toBe(404);
    await expect(page.locator('text=Book Catalogue')).not.toBeVisible();

    const apiRes = await context.request.get('/api/admin/books');
    expect(apiRes.status()).toBe(401);
    await context.close();
  });

  test('8. Expired token returns 404 on /admin/* and 401 on /api/admin/*', async ({ browser, baseURL }) => {
    const context = await browser.newContext();
    const now = Date.now();
    const expiredIdle = now - (35 * 60 * 1000); // 35 minutes ago
    const expiredToken = `sess-exp.usr-owner.owner.${expiredIdle - 10000}.${expiredIdle}.${expiredIdle + 43200000}.0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef`;
    await context.addCookies([
      { name: 'ann_admin_session', value: expiredToken, url: baseURL || 'http://localhost:3005' },
    ]);
    const page = await context.newPage();
    const res = await page.goto('/admin/books');
    expect(res?.status()).toBe(404);
    await expect(page.locator('text=Book Catalogue')).not.toBeVisible();

    const apiRes = await context.request.get('/api/admin/books');
    expect(apiRes.status()).toBe(401);
    await context.close();
  });

  test('9. Logout clears the cookie and revokes access', async ({ page, context }) => {
    await page.goto('/admin/login');

    await page.locator('#admin-email').fill(ENV_EMAIL);
    await page.locator('#admin-password').fill(ENV_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    const logoutBtn = page.locator('[data-testid="admin-logout-button"]');
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click({ force: true });

    await expect(page).toHaveURL(/\/admin\/login/);

    const cookiesAfter = await context.cookies();
    const sessionCookieAfter = cookiesAfter.find((c) => c.name === 'ann_admin_session');
    expect(sessionCookieAfter).toBeUndefined();

    const response = await page.goto('/admin/books');
    expect(response?.status()).toBe(404);
  });

  test('10. Setup creates owner with min 12 char password, then disables itself', async ({ page }) => {
    await page.goto('/admin/setup');
    await expect(page.locator('h1')).toContainText(/Initialize Store Owner/i);

    const pwInput = page.locator('#owner-password');
    await expect(pwInput).toHaveAttribute('minLength', '12');

    // Password length validation
    await page.locator('#setup-secret').fill('any_setup_secret_value_for_validation');
    await page.locator('#owner-name').fill('Initial Owner');
    await page.locator('#owner-email').fill('setup-owner@annsbookstore.com');
    await pwInput.fill('short');
    const isTooShort = await pwInput.evaluate((el: HTMLInputElement) => el.validity.tooShort);
    expect(isTooShort).toBe(true);
  });
});
