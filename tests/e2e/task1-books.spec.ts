import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('TASK 1: Admin Books & Storefront Synchronization', () => {
  test.beforeEach(async ({ page, context }) => {
    // Authenticate as Demo Owner
    await context.addCookies([
      {
        name: 'ann_admin_session',
        value: 'demo_session_token_owner',
        url: 'http://localhost:3001',
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
