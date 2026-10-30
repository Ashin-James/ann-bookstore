import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { createSignedSessionToken } from '../../lib/admin/session';

// Load .env.local into process.env if credentials/secrets are not present
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

test.describe('TASK H: Thoughts & About Page CMS Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('ann-cookie-consent', 'accepted');
      } catch (_) {}
    });
  });

  test('1. RBAC: editor role reaches /admin/thoughts and /admin/about, but gets 404 on /admin/orders', async ({
    browser,
    baseURL,
  }) => {
    const targetUrl = baseURL || 'http://localhost:3005';
    const now = Date.now();

    const editorToken = await createSignedSessionToken({
      id: `sess_editor_${now}`,
      userId: 'usr_editor_01',
      role: 'editor',
      createdAt: now,
      lastActiveAt: now,
      expiresAt: now + 12 * 3600 * 1000,
    });

    const context = await browser.newContext();
    await context.addCookies([
      { name: 'ann_admin_session', value: editorToken, url: targetUrl },
    ]);
    const page = await context.newPage();

    // Editor reaches /admin/thoughts
    const thoughtsRes = await page.goto('/admin/thoughts');
    expect(thoughtsRes?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText(/Thoughts & Quotes/i);

    // Editor reaches /admin/about
    const aboutRes = await page.goto('/admin/about');
    expect(aboutRes?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText(/About Page Editor/i);

    // Editor is BLOCKED from /admin/orders (404 rewrite)
    const ordersRes = await page.goto('/admin/orders');
    expect(ordersRes?.status()).toBe(404);

    await context.close();
  });

  test('2. Thoughts management: create, keyboard reorder, publish/unpublish, and delete with confirmation', async ({
    browser,
    baseURL,
  }) => {
    const targetUrl = baseURL || 'http://localhost:3005';
    const now = Date.now();

    const adminToken = await createSignedSessionToken({
      id: `sess_admin_${now}`,
      userId: 'usr_admin_01',
      role: 'admin',
      createdAt: now,
      lastActiveAt: now,
      expiresAt: now + 12 * 3600 * 1000,
    });

    const context = await browser.newContext();
    await context.addCookies([
      { name: 'ann_admin_session', value: adminToken, url: targetUrl },
    ]);
    const page = await context.newPage();

    await page.goto('/admin/thoughts');
    await expect(page.locator('h1')).toContainText(/Thoughts & Quotes/i);

    // 1. Create a new thought
    const uniqueThought = `A tranquil river holds more memory than a mountain ${now}.`;
    await page.click('[data-testid="btn-add-thought"]');
    await expect(page.locator('[data-testid="modal-thought-form"]')).toBeVisible();

    await page.fill('[data-testid="input-thought-content"]', uniqueThought);
    await page.fill('[data-testid="input-thought-attribution"]', 'Ann · River Notes');
    await page.selectOption('[data-testid="select-thought-status"]', 'published');
    await page.click('[data-testid="btn-save-thought"]');

    await expect(page.locator('[data-testid="modal-thought-form"]')).not.toBeVisible();
    await expect(page.locator('table')).toContainText(uniqueThought);

    // Find the row containing our unique thought
    const row = page.locator('tr', { hasText: uniqueThought });
    await expect(row).toBeVisible();

    // 2. Keyboard reorder: click Move Up button
    const moveUpBtn = row.locator('button[data-testid^="btn-move-up-"]');
    if (await moveUpBtn.isEnabled()) {
      await moveUpBtn.click();
      await page.waitForTimeout(400);
    }

    // 3. Toggle publish/unpublish
    const toggleBtn = row.locator('button[data-testid^="btn-toggle-publish-"]');
    await toggleBtn.click();
    await expect(row.locator('span[data-testid^="thought-status-"]')).toContainText(/Draft/i);

    // Toggle back to published
    await toggleBtn.click();
    await expect(row.locator('span[data-testid^="thought-status-"]')).toContainText(/Published/i);

    // 4. Delete with typed confirmation
    const deleteBtn = row.locator('button[data-testid^="btn-delete-thought-"]');
    await deleteBtn.click();
    await expect(page.locator('[data-testid="modal-delete-confirm"]')).toBeVisible();

    // Confirm button is disabled before typing confirmation
    const confirmBtn = page.locator('[data-testid="btn-confirm-delete"]');
    await expect(confirmBtn).toBeDisabled();

    // Type DELETE to confirm
    await page.fill('[data-testid="input-delete-confirm"]', 'DELETE');
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click();

    await expect(page.locator('[data-testid="modal-delete-confirm"]')).not.toBeVisible();
    await expect(page.locator('table')).not.toContainText(uniqueThought);

    await context.close();
  });

  test('3. Storefront sync: homepage shows published thought; unpublished thought never appears', async ({
    browser,
    baseURL,
  }) => {
    const targetUrl = baseURL || 'http://localhost:3005';
    const now = Date.now();

    const adminToken = await createSignedSessionToken({
      id: `sess_admin_${now}`,
      userId: 'usr_admin_01',
      role: 'admin',
      createdAt: now,
      lastActiveAt: now,
      expiresAt: now + 12 * 3600 * 1000,
    });

    const context = await browser.newContext();
    await context.addCookies([
      { name: 'ann_admin_session', value: adminToken, url: targetUrl },
    ]);
    const page = await context.newPage();

    // Go to /admin/thoughts to create a published thought at the top
    await page.goto('/admin/thoughts');
    const publishedQuote = `The monsoon writes in puddles what the sun forgets ${now}.`;
    await page.click('[data-testid="btn-add-thought"]');
    await page.fill('[data-testid="input-thought-content"]', publishedQuote);
    await page.fill('[data-testid="input-thought-attribution"]', 'Ann · Monsoon Notes');
    await page.selectOption('[data-testid="select-thought-status"]', 'published');
    await page.click('[data-testid="btn-save-thought"]');

    // Move it up to the very top order so it becomes active thought
    const row = page.locator('tr', { hasText: publishedQuote });
    let canMoveUp = await row.locator('button[data-testid^="btn-move-up-"]').isEnabled();
    while (canMoveUp) {
      await row.locator('button[data-testid^="btn-move-up-"]').click();
      await page.waitForTimeout(300);
      canMoveUp = await row.locator('button[data-testid^="btn-move-up-"]').isEnabled();
    }

    // Navigate to homepage
    await page.goto('/');
    await expect(page.locator('[data-testid="homepage-author-note"]')).toContainText(publishedQuote);
    await expect(page.locator('[data-testid="homepage-quote-note"]')).toContainText(publishedQuote);

    // Now return to /admin/thoughts and set this thought to 'draft' (unpublished)
    await page.goto('/admin/thoughts');
    const targetRow = page.locator('tr', { hasText: publishedQuote });
    const toggleBtn = targetRow.locator('button[data-testid^="btn-toggle-publish-"]');
    await toggleBtn.click();
    await expect(targetRow.locator('span[data-testid^="thought-status-"]')).toContainText(/Draft/i);

    // Navigate back to homepage: unpublished thought must NEVER appear
    await page.goto('/');
    const noteContent = await page.locator('[data-testid="homepage-author-note"]').innerText();
    const quoteContent = await page.locator('[data-testid="homepage-quote-note"]').innerText();
    expect(noteContent).not.toContain(publishedQuote);
    expect(quoteContent).not.toContain(publishedQuote);

    await context.close();
  });

  test('4. About Page CMS: edit, publish, see at /about, and restore a revision', async ({
    browser,
    baseURL,
  }) => {
    const targetUrl = baseURL || 'http://localhost:3005';
    const now = Date.now();

    const adminToken = await createSignedSessionToken({
      id: `sess_admin_${now}`,
      userId: 'usr_admin_01',
      role: 'admin',
      createdAt: now,
      lastActiveAt: now,
      expiresAt: now + 12 * 3600 * 1000,
    });

    const context = await browser.newContext();
    await context.addCookies([
      { name: 'ann_admin_session', value: adminToken, url: targetUrl },
    ]);
    const page = await context.newPage();

    await page.goto('/admin/about');
    await expect(page.locator('h1')).toContainText(/About Page Editor/i);

    // Verify placeholder warning banner exists
    await expect(page.locator('[data-testid="banner-placeholder-warning"]')).toBeVisible();
    await expect(page.locator('[data-testid="banner-placeholder-warning"]')).toContainText(/\[PLACEHOLDER\]/);

    // 1. Edit About page title & content
    const updatedTitle = `Archival Stories and Quiet Coastal Craft ${now}`;
    await page.fill('[data-testid="input-about-title"]', updatedTitle);
    await page.fill('[data-testid="input-about-subtitle"]', '“Listening to rain on the veranda roof.”');

    // Focus editor and set content
    const editorSurface = page.locator('[data-testid="editor-content"] [contenteditable="true"]');
    await editorSurface.click();
    await editorSurface.fill('Ann is an author composing from the Malabar coast [PLACEHOLDER]. Every volume is sewn by hand.');

    await page.selectOption('[data-testid="select-about-status"]', 'published');
    await page.check('[data-testid="checkbox-needs-legal-review"]');
    await page.click('[data-testid="btn-save-about"]');

    // Wait for save confirmation
    await expect(page.locator('text=/About page saved successfully|Página guardada|enregistrée/i')).toBeVisible();

    // 2. Verify on public /about page
    await page.goto('/about');
    await expect(page.locator('[data-testid="about-page-title"]')).toContainText(updatedTitle);
    await expect(page.locator('[data-testid="about-page-content"]')).toContainText('Ann is an author composing from the Malabar coast [PLACEHOLDER].');

    // 3. Return to /admin/about and restore Revision #1
    await page.goto('/admin/about');
    await expect(page.locator('[data-testid="about-revisions-list"]')).toBeVisible();

    const restoreBtn = page.locator('[data-testid="btn-restore-revision-1"]');
    await expect(restoreBtn).toBeVisible();
    await restoreBtn.click();

    await expect(page.locator('text=/restored successfully|restaurada con éxito/i')).toBeVisible();

    // 4. Verify public /about now reflects restored title
    await page.goto('/about');
    await expect(page.locator('[data-testid="about-page-title"]')).toContainText(/Stories begin/i);

    await context.close();
  });
});

