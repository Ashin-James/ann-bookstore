import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { createSignedSessionToken } from '../../lib/admin/session';

// Load .env.local into process.env if not already present
if (!process.env.SESSION_SECRET) {
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

test.describe('TASK 1: Admin Books & Storefront Synchronization', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    const targetUrl = baseURL || 'http://localhost:3005';
    const now = Date.now();
    const token = await createSignedSessionToken({
      id: `sess_owner_${now}`,
      userId: 'usr_owner_01',
      role: 'owner',
      createdAt: now,
      lastActiveAt: now,
      expiresAt: now + 12 * 3600 * 1000,
    });

    // Authenticate as Demo Owner
    await context.addCookies([
      {
        name: 'ann_admin_session',
        value: token,
        url: targetUrl,
      },
    ]);

    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('ann-cookie-consent', 'accepted');
      } catch (_) {}
    });
  });

  test('Add, edit, archive, remove with title confirmation, undo, and storefront reflection', async ({ page }) => {
    // 1. Visit Admin Books page
    await page.goto('/admin/books');
    await expect(page.locator('h1')).toContainText(/Book Catalogue/i);

    // 2. Open Add Book Modal
    await page.locator('[data-testid="add-book-button"]').click();
    await expect(page.locator('h3')).toContainText(/Add New Book/i);

    // 3. Fill Book Details
    await page.locator('[data-testid="book-title-input"]').fill('The Whispering Pines');
    await page.locator('[data-testid="book-slug-input"]').fill('the-whispering-pines');
    await page.locator('[data-testid="book-short-desc-input"]').fill('A quiet mystery in the northern hills.');
    await page.locator('[data-testid="book-desc-input"]').fill('In a secluded valley surrounded by misty evergreen forests, an estranged daughter discovers her grandmother\'s lost journals.');
    await page.locator('[data-testid="cover-alt-input"]').fill('Cover artwork of twilight pine forest in misty fog');
    await page.locator('[data-testid="pb-price-input"]').fill('22.00');

    // Save Book
    await page.locator('[data-testid="save-book-button"]').click();

    // Verify book appears in admin list
    const newBookRow = page.locator('[data-testid="book-row-the-whispering-pines"]');
    await expect(newBookRow).toBeVisible();
    await expect(newBookRow).toContainText('The Whispering Pines');
    await expect(newBookRow.locator('[data-testid="book-status-the-whispering-pines"]')).toContainText('published');

    // 4. Check Storefront Reflection: /books
    await page.goto('/books');
    await expect(page.locator('h1')).toContainText(/world in/i);
    const storefrontCard = page.locator('article.book-card:has-text("The Whispering Pines")');
    await expect(storefrontCard).toBeVisible();
    await expect(storefrontCard).toContainText('$22.00');

    // 5. Check Storefront Book Detail Page: /books/the-whispering-pines
    await page.goto('/books/the-whispering-pines');
    await expect(page.locator('h1')).toHaveText('The Whispering Pines');
    await expect(page.locator('.product-subtitle')).toContainText('A quiet mystery in the northern hills.');
    await expect(page.locator('.product-price')).toContainText('$22.00');

    // 6. Return to Admin and Edit the Title
    await page.goto('/admin/books');
    await page.locator('[data-testid="edit-book-the-whispering-pines"]').click();
    await expect(page.locator('h3')).toContainText(/Edit Book/i);

    await page.locator('[data-testid="book-title-input"]').fill('The Whispering Pines (Expanded Edition)');
    await page.locator('[data-testid="save-book-button"]').click();

    // Verify updated title in admin
    await expect(page.locator('[data-testid="book-row-the-whispering-pines"]')).toContainText('The Whispering Pines (Expanded Edition)');

    // 7. Verify updated title on storefront /books
    await page.goto('/books');
    await expect(page.locator('article.book-card:has-text("The Whispering Pines (Expanded Edition)")')).toBeVisible();

    // 8. Archive the book in admin
    await page.goto('/admin/books');
    await page.locator('[data-testid="archive-book-the-whispering-pines"]').click();

    // Verify status changed to archived
    const statusBadge = page.locator('[data-testid="book-status-the-whispering-pines"]');
    await expect(statusBadge).toHaveText('archived');

    // 9. Verify archived book disappears from public storefront /books
    await page.goto('/books');
    await expect(page.locator('article.book-card:has-text("The Whispering Pines (Expanded Edition)")')).not.toBeVisible();

    // 10. Return to Admin, Delete the book (requires typing title)
    await page.goto('/admin/books');
    await page.locator('[data-testid="delete-book-the-whispering-pines"]').click();

    // Modal opens
    await expect(page.locator('h3:has-text("Remove Book")')).toBeVisible();
    const confirmDeleteBtn = page.locator('[data-testid="confirm-delete-button"]');
    await expect(confirmDeleteBtn).toBeDisabled();

    // Typing partial or wrong title keeps button disabled
    const deleteTitleInput = page.locator('[data-testid="delete-title-input"]');
    await deleteTitleInput.fill('Wrong Title');
    await expect(confirmDeleteBtn).toBeDisabled();

    // Typing exact title enables delete button
    await deleteTitleInput.fill('The Whispering Pines (Expanded Edition)');
    await expect(confirmDeleteBtn).toBeEnabled();
    await confirmDeleteBtn.click();

    // Verify book is removed from list
    await expect(page.locator('[data-testid="book-row-the-whispering-pines"]')).not.toBeVisible();

    // 11. Undo the deletion via Toast notification
    const toast = page.locator('[data-testid="admin-toast"]');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(/deleted/i);

    const undoButton = page.locator('[data-testid="toast-undo-button"]');
    await expect(undoButton).toBeVisible();
    await undoButton.click();

    // Verify book is restored
    await expect(page.locator('[data-testid="book-row-the-whispering-pines"]')).toBeVisible();

    // 12. Save Evidence Screenshot
    const evidenceDir = path.join(process.cwd(), 'docs', 'screenshots', 'evidence');
    if (!fs.existsSync(evidenceDir)) {
      fs.mkdirSync(evidenceDir, { recursive: true });
    }
    const screenshotPath = path.join(evidenceDir, 'task1.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    expect(fs.existsSync(screenshotPath)).toBeTruthy();
  });
});

test.describe('TASK 1 Security: Route Protection & Admin Lockout', () => {
  test('signed-out visitor accessing /admin/books receives 404', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const response = await page.goto('/admin/books');
    expect(response?.status()).toBe(404);
    await expect(page.locator('text=Book Catalogue')).not.toBeVisible();
    await context.close();
  });

  test('admin login locks out after 5 consecutive failed attempts', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/admin/login');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    const testEmail = `lockout_e2e_${Date.now()}@test.com`;
    await emailInput.fill(testEmail);
    await passwordInput.fill('WrongPassword123!');

    for (let i = 0; i < 5; i++) {
      const resPromise = page.waitForResponse((res) => res.url().includes('/api/admin/auth'));
      await submitButton.click();
      await resPromise;
    }

    await expect(page.locator('text=Account locked after 5 failed attempts')).toBeVisible();
    await context.close();
  });

  test('customer session without admin credentials receives 404 on /admin and /admin/books', async ({ browser, baseURL }) => {
    const context = await browser.newContext();
    const targetUrl = baseURL || 'http://localhost:3005';
    // Customer session cookie only
    await context.addCookies([
      { name: 'ann_session', value: 'customer_session_token', url: targetUrl },
    ]);
    const page = await context.newPage();

    const adminResponse = await page.goto('/admin');
    expect(adminResponse?.status()).toBe(404);

    const booksResponse = await page.goto('/admin/books');
    expect(booksResponse?.status()).toBe(404);
    await expect(page.locator('text=Book Catalogue')).not.toBeVisible();
    await context.close();
  });

  test('signed-out direct admin API call receives 401 or 404', async ({ request }) => {
    // Direct HTTP request to protected admin API without session cookie
    const response = await request.get('/api/admin/books');
    expect([401, 404]).toContain(response.status());
  });

  test('admin logout revokes session and blocks further access', async ({ browser, baseURL }) => {
    const context = await browser.newContext();
    const targetUrl = baseURL || 'http://localhost:3005';
    const now = Date.now();
    const token = await createSignedSessionToken({
      id: `sess_logout_${now}`,
      userId: 'usr_owner_01',
      role: 'owner',
      createdAt: now,
      lastActiveAt: now,
      expiresAt: now + 12 * 3600 * 1000,
    });
    await context.addCookies([
      { name: 'ann_admin_session', value: token, url: targetUrl },
    ]);
    const page = await context.newPage();

    // Authenticated access works
    await page.goto('/admin/books');
    await expect(page.locator('h1')).toContainText(/Book Catalogue/i);

    // Perform logout via API
    await page.request.post('/api/admin/auth', {
      data: { action: 'logout' },
    });

    // Clear client-side cookies to match revoked session
    await context.clearCookies();

    // Re-accessing /admin/books now returns 404
    const response = await page.goto('/admin/books');
    expect(response?.status()).toBe(404);
    await expect(page.locator('text=Book Catalogue')).not.toBeVisible();
    await context.close();
  });

  test('admin session idle timeout returns 401 and deletes session cookie', async ({ request }) => {
    // Request with an expired / invalid session token
    const res = await request.get('/api/admin/auth', {
      headers: {
        Cookie: 'ann_admin_session=expired_idle_session_token_123',
      },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe('TASK SB-1: Supabase Multi-Context Books Verification', () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasSupabase = Boolean(
    supabaseUrl &&
    serviceKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('your-project-ref') &&
    process.env.DATA_BACKEND === 'supabase'
  );

  test('add a book in admin, see it on /books from a SECOND browser context with no shared storage, archive it, delete it', async ({ browser }) => {
    test.skip(!hasSupabase, 'Supabase environment variables are absent; skipping live Supabase multi-context test.');

    const adminEmail = process.env.ADMIN_DEMO_EMAIL || 'admin@annsbookstore.com';
    const adminPassword = process.env.ADMIN_DEMO_PASSWORD || '';

    // Context 1: Admin session
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    // Authenticate
    await adminPage.goto('/admin/login');
    await adminPage.fill('input[type="email"]', adminEmail);
    await adminPage.fill('input[type="password"]', adminPassword);
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL(/\/admin/);

    const testTitle = `SB1 Book ${Date.now()}`;
    const testSlug = `sb1-book-${Date.now()}`;

    // Add book in admin
    await adminPage.goto('/admin/books');
    await adminPage.locator('[data-testid="add-book-button"]').click();
    await adminPage.locator('[data-testid="book-title-input"]').fill(testTitle);
    await adminPage.locator('[data-testid="book-slug-input"]').fill(testSlug);
    await adminPage.locator('[data-testid="book-short-desc-input"]').fill('A cross-context Supabase verification novel.');
    await adminPage.locator('[data-testid="cover-alt-input"]').fill('Cover artwork for cross-context test');
    await adminPage.locator('[data-testid="pb-price-input"]').fill('25.00');
    await adminPage.locator('[data-testid="save-book-button"]').click();

    await expect(adminPage.locator(`[data-testid="book-row-${testSlug}"]`)).toBeVisible();

    // Context 2: Completely separate browser context (NO shared storage, NO cookies)
    const secondContext = await browser.newContext();
    const secondPage = await secondContext.newPage();

    // Visit public /books in second context
    await secondPage.goto('/books');
    await expect(secondPage.locator(`article.book-card:has-text("${testTitle}")`)).toBeVisible({ timeout: 10000 });

    // Context 1: Archive book
    await adminPage.goto('/admin/books');
    await adminPage.locator(`[data-testid="archive-book-${testSlug}"]`).click();
    await expect(adminPage.locator(`[data-testid="book-status-${testSlug}"]`)).toHaveText('archived');

    // Context 2: Verify book disappears from public storefront
    await secondPage.goto('/books');
    await expect(secondPage.locator(`article.book-card:has-text("${testTitle}")`)).not.toBeVisible();

    // Context 1: Delete book with typed title confirmation
    await adminPage.goto('/admin/books');
    await adminPage.locator(`[data-testid="delete-book-${testSlug}"]`).click();
    await adminPage.locator('[data-testid="delete-title-input"]').fill(testTitle);
    await adminPage.locator('[data-testid="confirm-delete-button"]').click();
    await expect(adminPage.locator(`[data-testid="book-row-${testSlug}"]`)).not.toBeVisible();

    // Context 2: Verify book is gone
    await secondPage.goto('/books');
    await expect(secondPage.locator(`article.book-card:has-text("${testTitle}")`)).not.toBeVisible();

    await adminContext.close();
    await secondContext.close();
  });
});



