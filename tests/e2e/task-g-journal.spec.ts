import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { createSignedSessionToken } from '../../lib/admin/session';

// Load .env.local into process.env if credentials are not already present
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

const ADMIN_EMAIL = process.env.ADMIN_DEMO_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_DEMO_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error('ADMIN_DEMO_EMAIL and ADMIN_DEMO_PASSWORD must be configured in .env.local');
}

test.describe('TASK G: Journal Editor, Revisions, Status Isolation & RBAC Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('ann-cookie-consent', 'accepted');
      } catch (_) {}
    });
  });

  test('1. RBAC Guards: Editor accesses /admin/journal, blocked from /admin/orders (404); support blocked (404)', async ({
    browser,
    baseURL,
  }) => {
    const targetUrl = baseURL || 'http://localhost:3005';
    const now = Date.now();

    // Editor session
    const editorToken = await createSignedSessionToken({
      id: `sess_editor_${now}`,
      userId: 'usr_editor_01',
      role: 'editor',
      createdAt: now,
      lastActiveAt: now,
      expiresAt: now + 12 * 3600 * 1000,
    });

    const editorContext = await browser.newContext();
    await editorContext.addCookies([
      { name: 'ann_admin_session', value: editorToken, url: targetUrl },
    ]);
    const editorPage = await editorContext.newPage();

    // Editor can reach /admin/journal
    const journalRes = await editorPage.goto('/admin/journal');
    expect(journalRes?.status()).toBe(200);
    await expect(editorPage.locator('h1')).toContainText(/Journal & Editorial/i);

    // Editor CANNOT reach /admin/orders (returns 404 rewrite)
    const ordersRes = await editorPage.goto('/admin/orders');
    expect(ordersRes?.status()).toBe(404);

    await editorContext.close();

    // Support session
    const supportToken = await createSignedSessionToken({
      id: `sess_support_${now}`,
      userId: 'usr_support_01',
      role: 'support',
      createdAt: now,
      lastActiveAt: now,
      expiresAt: now + 12 * 3600 * 1000,
    });

    const supportContext = await browser.newContext();
    await supportContext.addCookies([
      { name: 'ann_admin_session', value: supportToken, url: targetUrl },
    ]);
    const supportPage = await supportContext.newPage();

    // Support CANNOT reach /admin/journal (returns 404 rewrite)
    const supportJournalRes = await supportPage.goto('/admin/journal');
    expect(supportJournalRes?.status()).toBe(404);

    await supportContext.close();

    // Signed-out user gets 404 on /admin/journal
    const anonContext = await browser.newContext();
    const anonPage = await anonContext.newPage();
    const anonRes = await anonPage.goto('/admin/journal');
    expect(anonRes?.status()).toBe(404);
    await anonContext.close();
  });

  test('2. Complete Journal Lifecycle: Create with image (alt required), preview, publish, edit, restore rev 1, and draft 404', async ({
    page,
    baseURL,
  }) => {
    const now = Date.now();
    const testTitle = `Monsoon Reflections Vol ${now}`;
    const testSlug = `monsoon-reflections-vol-${now}`;
    const draftTitle = `Secret Draft Musings ${now}`;
    const draftSlug = `secret-draft-musings-${now}`;

    const adminToken = await createSignedSessionToken({
      id: `sess_admin_${now}`,
      userId: 'usr_admin_01',
      role: 'admin',
      createdAt: now,
      lastActiveAt: now,
      expiresAt: now + 12 * 3600 * 1000,
    });

    await page.context().addCookies([
      { name: 'ann_admin_session', value: adminToken, url: baseURL || 'http://localhost:3005' },
    ]);

    // Step A: Open /admin/journal
    await page.goto('/admin/journal', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toContainText(/Journal & Editorial/i);
    await expect(page.locator('[data-testid="journal-demo-notice"]')).toBeVisible();

    // Step B: Create a post with an image (alt text required)
    await page.click('[data-testid="btn-create-post"]');
    await page.fill('[data-testid="input-post-title"]', testTitle);
    await page.fill('[data-testid="input-post-subtitle"]', 'Reflections on the sound of rain on veranda stone.');
    await page.fill('[data-testid="input-post-category"]', 'Reflections');

    // Attempt to insert image without alt text
    await page.click('[data-testid="editor-btn-image"]');
    await expect(page.locator('[data-testid="modal-insert-image"]')).toBeVisible();
    await page.fill('[data-testid="input-modal-image-url"]', 'https://images.unsplash.com/photo-1512820790803-83ca734da794');
    await page.click('[data-testid="btn-confirm-insert-image"]');

    // Error message: Alt text is required
    const errorMsg = page.locator('[data-testid="modal-image-error"]');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText(/Alt Text is strictly required/i);

    // Provide Alt text and confirm insert
    await page.fill('[data-testid="input-modal-image-alt"]', 'Open leatherbound book on oak desk with rain outside');
    await page.click('[data-testid="btn-confirm-insert-image"]');
    await expect(page.locator('[data-testid="modal-insert-image"]')).not.toBeVisible();

    // Type body content into TipTap editor
    const editorSurface = page.locator('[data-testid="tiptap-editor-surface"] .tiptap');
    await editorSurface.click();
    await page.keyboard.type('In the quietest rooms of monsoon morning, memory slow-cooks the days we forgot.');

    // Select related book
    await page.selectOption('[data-testid="select-related-book"]', { label: 'The Quiet Hours' });

    // Step C: Live Preview with public journal styles
    await page.click('[data-testid="btn-toggle-preview"]');
    await expect(page.locator('[data-testid="journal-live-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-title"]')).toHaveText(testTitle);
    await expect(page.locator('[data-testid="preview-content"]')).toContainText('In the quietest rooms');
    await expect(page.locator('text=The Quiet Hours')).toBeVisible();

    // Toggle back to editor mode
    await page.click('[data-testid="btn-toggle-preview"]');
    await expect(page.locator('[data-testid="input-post-title"]')).toBeVisible();

    // Step D: Publish post
    await page.selectOption('[data-testid="select-post-status"]', 'published');
    await page.click('[data-testid="btn-save-post"]');
    await expect(page.locator('[data-testid="admin-journal-success"]')).toBeVisible();

    // Step E: Verify live appearance on storefront /journal
    await page.goto('/journal', { waitUntil: 'domcontentloaded' });
    const postCard = page.locator(`[data-testid="journal-card-${testSlug}"]`);
    await expect(postCard).toBeVisible();
    await expect(postCard).toContainText(testTitle);

    // Step F: Verify direct article URL
    await page.goto(`/journal/${testSlug}`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="journal-article-title"]')).toHaveText(testTitle);
    await expect(page.locator('[data-testid="journal-article-content"]')).toContainText('In the quietest rooms');

    // Step G: Edit post, create Revision #2
    await page.goto('/admin/journal', { waitUntil: 'domcontentloaded' });
    await page.click(`[data-testid="btn-edit-${testSlug}"]`);

    const editedTitle = `${testTitle} (Edited Edition)`;
    await page.fill('[data-testid="input-post-title"]', editedTitle);
    await page.click('[data-testid="btn-save-post"]');
    await expect(page.locator('[data-testid="admin-journal-success"]')).toBeVisible();

    // Step H: Verify revision list and restore Revision #1
    const rev2 = page.locator('[data-testid="revision-item-2"]');
    const rev1 = page.locator('[data-testid="revision-item-1"]');
    await expect(rev2).toBeVisible();
    await expect(rev1).toBeVisible();

    await page.click('[data-testid="btn-restore-rev-1"]');
    await expect(page.locator('[data-testid="admin-journal-success"]')).toContainText(/Restored Revision #1/i);
    await expect(page.locator('[data-testid="input-post-title"]')).toHaveValue(testTitle);

    await page.click('[data-testid="btn-save-post"]');
    await expect(page.locator('[data-testid="admin-journal-success"]')).toBeVisible();

    // Step I: Create a draft post & verify public 404 isolation
    await page.click('[data-testid="btn-back-to-list"]');
    await page.click('[data-testid="btn-create-post"]');
    await page.fill('[data-testid="input-post-title"]', draftTitle);
    await page.selectOption('[data-testid="select-post-status"]', 'draft');
    const draftEditor = page.locator('[data-testid="tiptap-editor-surface"] .tiptap');
    await draftEditor.click();
    await page.keyboard.type('This is an unreleased draft that must never be visible publicly.');

    await page.click('[data-testid="btn-save-post"]');
    await expect(page.locator('[data-testid="admin-journal-success"]')).toBeVisible();

    // Public /journal must NOT show the draft
    await page.goto('/journal', { waitUntil: 'domcontentloaded' });
    const draftCard = page.locator(`[data-testid="journal-card-${draftSlug}"]`);
    await expect(draftCard).not.toBeVisible();

    // Direct URL to /journal/[draftSlug] must return 404 (not found page)
    await page.goto(`/journal/${draftSlug}`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toContainText(/This story wandered off/i);
    await expect(page.locator('text=A PAGE OUT OF PLACE')).toBeVisible();
    await expect(page.locator(`text=${draftTitle}`)).not.toBeVisible();
  });
});
