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

  test('2. Complete Journal Lifecycle: Cover/image alt requirement, XSS sanitization, revisions, and status/future 404 isolation', async ({
    page,
    baseURL,
  }) => {
    const now = Date.now();
    const testTitle = `Monsoon Reflections Vol ${now}`;
    const testSlug = `monsoon-reflections-vol-${now}`;
    const draftTitle = `Secret Draft Musings ${now}`;
    const draftSlug = `secret-draft-musings-${now}`;
    const futureTitle = `Future Dispatch Year 2030 ${now}`;
    const futureSlug = `future-dispatch-year-2030-${now}`;

    // Admin session created with zero hardcoded credentials:
    // Signs HMAC-SHA256 session token using SESSION_SECRET loaded from process.env (.env.local)
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

    // Step B: Create a post - Cover image alt is strictly required
    await page.click('[data-testid="btn-create-post"]');
    await page.fill('[data-testid="input-post-title"]', testTitle);
    await page.fill('[data-testid="input-post-subtitle"]', 'Reflections on the sound of rain on veranda stone.');
    await page.fill('[data-testid="input-post-category"]', 'Reflections');

    // Supply cover image WITHOUT alt text -> Refused
    await page.fill('[data-testid="input-cover-image"]', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c');
    await page.fill('[data-testid="input-cover-alt"]', '');
    const editorSurface = page.locator('[data-testid="tiptap-editor-surface"] .tiptap');
    await editorSurface.click();
    await page.keyboard.type('Initial draft body for alt test.');
    await page.click('[data-testid="btn-save-post"]');

    // Verify error for missing cover alt
    const coverAltError = page.locator('[data-testid="admin-journal-error"]');
    await expect(coverAltError).toBeVisible();
    await expect(coverAltError).toContainText(/Cover image alt text is required/i);

    // Provide valid cover alt text
    await page.fill('[data-testid="input-cover-alt"]', 'Open journal on wooden table beside cup of black tea');

    // Embedded image in editor WITHOUT alt text -> Refused
    await page.click('[data-testid="editor-btn-image"]');
    await expect(page.locator('[data-testid="modal-insert-image"]')).toBeVisible();
    await page.fill('[data-testid="input-modal-image-url"]', 'https://images.unsplash.com/photo-1512820790803-83ca734da794');
    await page.click('[data-testid="btn-confirm-insert-image"]');

    const modalError = page.locator('[data-testid="modal-image-error"]');
    await expect(modalError).toBeVisible();
    await expect(modalError).toContainText(/Alt Text is strictly required/i);

    // Provide Alt text and confirm insert
    await page.fill('[data-testid="input-modal-image-alt"]', 'Open leatherbound book on oak desk with rain outside');
    await page.click('[data-testid="btn-confirm-insert-image"]');
    await expect(page.locator('[data-testid="modal-insert-image"]')).not.toBeVisible();

    // Step C: XSS Sanitization Test: Pasting <script> and onerror= into editor
    await editorSurface.click();
    await page.keyboard.type(' In the quietest rooms of monsoon morning.');

    // Paste HTML containing script and onerror into the editor
    await page.evaluate(() => {
      const dt = new DataTransfer();
      dt.setData('text/html', '<script>alert("xss-injected")</script><img src="x" onerror="alert(1)" alt="safe description">');
      const event = new ClipboardEvent('paste', {
        clipboardData: dt,
        bubbles: true,
        cancelable: true,
      });
      document.querySelector('[data-testid="tiptap-editor-surface"] .tiptap')?.dispatchEvent(event);
    });

    // Select related book
    await page.selectOption('[data-testid="select-related-book"]', { label: 'The Quiet Hours' });

    // Step D: Live Preview with public journal styles
    await page.click('[data-testid="btn-toggle-preview"]');
    await expect(page.locator('[data-testid="journal-live-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-title"]')).toHaveText(testTitle);
    await expect(page.locator('[data-testid="preview-content"]')).toContainText('In the quietest rooms');
    await expect(page.locator('text=The Quiet Hours')).toBeVisible();

    // Toggle back to editor mode
    await page.click('[data-testid="btn-toggle-preview"]');
    await expect(page.locator('[data-testid="input-post-title"]')).toBeVisible();

    // Step E: Publish post
    await page.selectOption('[data-testid="select-post-status"]', 'published');
    await page.click('[data-testid="btn-save-post"]');
    await expect(page.locator('[data-testid="admin-journal-success"]')).toBeVisible();

    // Assert: Pasted <script> and onerror= never appear in saved HTML
    const savedHtmlCheck = await page.evaluate((slug) => {
      try {
        const raw = window.localStorage.getItem('ann_admin_v1_store');
        if (!raw) return { found: false, html: '' };
        const parsed = JSON.parse(raw);
        const post = parsed.journalPosts?.find((p: { slug: string }) => p.slug === slug);
        return { found: Boolean(post), html: post?.contentHtml || '' };
      } catch {
        return { found: false, html: '' };
      }
    }, testSlug);
    expect(savedHtmlCheck.found).toBe(true);
    expect(savedHtmlCheck.html).not.toContain('<script');
    expect(savedHtmlCheck.html).not.toContain('onerror=');

    // Step F: Verify storefront /journal listing and sanitized article page
    await page.goto('/journal', { waitUntil: 'domcontentloaded' });
    const postCard = page.locator(`[data-testid="journal-card-${testSlug}"]`);
    await expect(postCard).toBeVisible();
    await expect(postCard).toContainText(testTitle);

    // Direct article URL verification
    await page.goto(`/journal/${testSlug}`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="journal-article-title"]')).toHaveText(testTitle);
    await expect(page.locator('[data-testid="journal-article-content"]')).toContainText('In the quietest rooms');

    // Strict sanitization assertion: script and onerror NEVER appear in saved or public HTML
    const articleHtml = await page.locator('[data-testid="journal-article-content"]').innerHTML();
    expect(articleHtml).not.toContain('<script');
    expect(articleHtml).not.toContain('onerror=');
    const publicPageHtml = await page.content();
    expect(publicPageHtml).not.toContain('<script>alert(');
    expect(publicPageHtml).not.toContain('onerror=');

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

    // Step I: Draft post & public 404 isolation
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

    // Step J: Future-dated scheduled post & public 404 isolation
    await page.goto('/admin/journal', { waitUntil: 'domcontentloaded' });
    await page.click('[data-testid="btn-create-post"]');
    await page.fill('[data-testid="input-post-title"]', futureTitle);
    await page.selectOption('[data-testid="select-post-status"]', 'scheduled');
    await page.fill('[data-testid="input-publish-date"]', '2030-01-01T10:00');
    const futureEditor = page.locator('[data-testid="tiptap-editor-surface"] .tiptap');
    await futureEditor.click();
    await page.keyboard.type('This is a future dispatch scheduled for 2030 that must return 404 until then.');

    await page.click('[data-testid="btn-save-post"]');
    await expect(page.locator('[data-testid="admin-journal-success"]')).toBeVisible();

    // Public /journal must NOT show the future-dated post
    await page.goto('/journal', { waitUntil: 'domcontentloaded' });
    const futureCard = page.locator(`[data-testid="journal-card-${futureSlug}"]`);
    await expect(futureCard).not.toBeVisible();

    // Direct URL to /journal/[futureSlug] must return 404
    await page.goto(`/journal/${futureSlug}`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toContainText(/This story wandered off/i);
    await expect(page.locator('text=A PAGE OUT OF PLACE')).toBeVisible();
    await expect(page.locator(`text=${futureTitle}`)).not.toBeVisible();
  });
});
