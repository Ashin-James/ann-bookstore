import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Load .env.local into process.env if not already present in the environment
if (!process.env.ADMIN_DEMO_EMAIL || !process.env.ADMIN_DEMO_PASSWORD) {
  try {
    const envPath = path.resolve('.env.local');
    if (fs.existsSync(envPath)) {
      if (typeof process.loadEnvFile === 'function') {
        process.loadEnvFile(envPath);
      } else {
        const lines = fs.readFileSync(envPath, 'utf8').split('\n');
        for (const line of lines) {
          const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
          if (match && !process.env[match[1]]) {
            process.env[match[1]] = match[2]?.trim().replace(/^['"]|['"]$/g, '') || '';
          }
        }
      }
    }
  } catch (_) {}
}

const ENV_EMAIL = process.env.ADMIN_DEMO_EMAIL;
const ENV_PASSWORD = process.env.ADMIN_DEMO_PASSWORD;

if (!ENV_EMAIL || !ENV_PASSWORD) {
  throw new Error(
    'Missing required admin demo credentials: ADMIN_DEMO_EMAIL and ADMIN_DEMO_PASSWORD must be configured in .env.local'
  );
}

test.describe('TASK B: Staff Sign-in Link & Admin Dashboard Navigation Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('ann-cookie-consent', 'accepted');
        window.localStorage.setItem('ann-bookstore-signed-out', 'true');
      } catch (_) {}
    });
  });

  test('1. Signed-out visitor sees "Staff sign in" link on /login and in footer; captures screenshots', async ({ page }) => {
    // 1. Visit /login
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const loginStaffLink = page.locator('[data-testid="login-staff-link"]');
    await expect(loginStaffLink).toBeVisible();
    await expect(loginStaffLink).toHaveText('Staff sign in');
    await expect(loginStaffLink).toHaveAttribute('href', '/admin/login');

    // Verify touch target >= 44px and font size >= 14px
    const loginBox = await loginStaffLink.boundingBox();
    expect(loginBox).not.toBeNull();
    if (loginBox) {
      expect(loginBox.height).toBeGreaterThanOrEqual(44);
    }
    const loginFontSize = await loginStaffLink.evaluate((el) => window.getComputedStyle(el).fontSize);
    expect(parseFloat(loginFontSize)).toBeGreaterThanOrEqual(14);

    // 2. Check site footer
    const footerStaffLink = page.locator('[data-testid="footer-staff-link"]');
    await expect(footerStaffLink).toBeVisible();
    await expect(footerStaffLink).toHaveText('Staff sign in');
    await expect(footerStaffLink).toHaveAttribute('href', '/admin/login');

    const footerBox = await footerStaffLink.boundingBox();
    expect(footerBox).not.toBeNull();
    if (footerBox) {
      expect(footerBox.height).toBeGreaterThanOrEqual(44);
    }
    const footerFontSize = await footerStaffLink.evaluate((el) => window.getComputedStyle(el).fontSize);
    expect(parseFloat(footerFontSize)).toBeGreaterThanOrEqual(14);

    // Capture required screenshots
    const screenshotsDir = path.resolve('docs/screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    await page.screenshot({ path: path.join(screenshotsDir, 'task-b-login.png'), fullPage: true });
    const footerElem = page.locator('footer.site-footer');
    await footerElem.screenshot({ path: path.join(screenshotsDir, 'task-b-footer.png') });
  });

  test('2. Clicking "Staff sign in" opens /admin/login from /login and from footer', async ({ page }) => {
    // Click from /login
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="login-staff-link"]').click();
    await expect(page).toHaveURL(/\/admin\/login/);

    // Click from footer
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="footer-staff-link"]').click({ force: true });
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('3. After admin login, the link reads "Admin dashboard" linking to /admin/dashboard', async ({ page }) => {
    // Perform admin login
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await page.locator('#admin-email').fill(ENV_EMAIL);
    await page.locator('#admin-password').fill(ENV_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Visit /login as logged-in admin
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const loginStaffLink = page.locator('[data-testid="login-staff-link"]');
    await expect(loginStaffLink).toBeVisible();
    await expect(loginStaffLink).toHaveText('Admin dashboard');
    await expect(loginStaffLink).toHaveAttribute('href', '/admin/dashboard');

    // Visit home page and verify footer link
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const footerStaffLink = page.locator('[data-testid="footer-staff-link"]');
    await expect(footerStaffLink).toBeVisible();
    await expect(footerStaffLink).toHaveText('Admin dashboard');
    await expect(footerStaffLink).toHaveAttribute('href', '/admin/dashboard');

    // Clicking it navigates to /admin/dashboard (status 200)
    await footerStaffLink.click({ force: true });
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('4. Customer session does not get admin privileges: link remains "Staff sign in" and /admin/books returns 404', async ({ page, context }) => {
    // Allow customer session and pre-seed customer session cookie
    await page.addInitScript(() => {
      try {
        window.localStorage.removeItem('ann-bookstore-signed-out');
      } catch (_) {}
    });

    await context.addCookies([
      {
        name: 'ann_session',
        value: 'customer-session-token-eleanor',
        path: '/',
        domain: 'localhost',
      },
    ]);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const footerStaffLink = page.locator('[data-testid="footer-staff-link"]');
    await expect(footerStaffLink).toBeVisible();
    await expect(footerStaffLink).toHaveText('Staff sign in');
    await expect(footerStaffLink).toHaveAttribute('href', '/admin/login');

    // Customer attempt to access /admin/books returns 404
    const adminRes = await page.goto('/admin/books');
    expect(adminRes?.status()).toBe(404);
  });

  test('5. Multi-language translation: switching language updates Staff sign in link', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Switch to Spanish (es)
    await page.evaluate(() => {
      localStorage.setItem('ann-bookstore-language', 'es');
      document.cookie = 'ann-bookstore-language=es; path=/';
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="footer-staff-link"]')).toHaveText('Acceso de personal');

    // Switch to German (de)
    await page.evaluate(() => {
      localStorage.setItem('ann-bookstore-language', 'de');
      document.cookie = 'ann-bookstore-language=de; path=/';
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="footer-staff-link"]')).toHaveText('Mitarbeiter-Login');
  });
});
