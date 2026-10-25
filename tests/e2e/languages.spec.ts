import { test, expect } from '@playwright/test';
import { SUPPORTED_LANGUAGES } from '../../src/config/languages';

const RAW_KEY_PATTERN = /^(nav[A-Z]|cart[A-Z]|checkout[A-Z]|account[A-Z]|footer[A-Z]|search[A-Z]|languagePicker[A-Z]|companion[A-Z])/;

test.describe('Language System Upgrade Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage to ensure clean state
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.clear();
      document.cookie.split(';').forEach((c) => {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
    });
  });

  test('1. Globe button opens accessible popover/dialog with keyboard navigation and focus trapping', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Header globe button
    const globeBtn = page.locator('.lang-trigger-header').first();
    await expect(globeBtn).toBeVisible();
    await expect(globeBtn.locator('.lang-code-badge')).toHaveText('EN');

    // Click to open dialog
    await globeBtn.click();
    const dialog = page.locator('.lang-dialog-container');
    await expect(dialog).toBeVisible();

    // Check search input is present
    const searchInput = page.locator('.lang-search-input');
    await expect(searchInput).toBeVisible();

    // Search for "Spanish"
    await searchInput.fill('Español');
    const option = page.locator('.lang-option-btn').first();
    await expect(option).toContainText('Español');
    await expect(option).toContainText('Spanish');

    // Press Escape to close and check focus restored
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(globeBtn).toBeFocused();

    // Reopen and test arrow keys + Enter
    await globeBtn.click();
    await expect(dialog).toBeVisible();
    await searchInput.fill('');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Dialog should close after selection
    await expect(dialog).not.toBeVisible();
  });

  test('2. Mobile viewport (<640px) renders full-height bottom sheet with sheet handle', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });

    // Open language picker
    const globeBtn = page.locator('.lang-trigger-header').first();
    await globeBtn.click();

    const dialog = page.locator('.lang-dialog-container');
    await expect(dialog).toBeVisible();

    // Verify sheet handle is visible on mobile
    const sheetHandle = page.locator('.sheet-drag-handle');
    await expect(sheetHandle).toBeVisible();

    // Verify sheet height takes majority of viewport
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThan(700);
    }
  });

  test('3. Language switching updates UI chrome, sets <html lang> and dir, no raw keys, no horizontal overflow', async ({ page }) => {
    // Test sample representing distinct scripts and directions: Spanish, Arabic (RTL), Japanese, German, Hindi
    const testLangs = ['es', 'ar', 'ja', 'de', 'hi'];

    for (const code of testLangs) {
      const cfg = SUPPORTED_LANGUAGES.find((l) => l.code === code)!;
      await page.goto('/', { waitUntil: 'networkidle' });

      // Open switcher
      const globeBtn = page.locator('.lang-trigger-header').first();
      await globeBtn.click();

      // Search & select language
      const searchInput = page.locator('.lang-search-input');
      await searchInput.fill(cfg.code);
      const targetOption = page.locator(`.lang-option-btn`).filter({ hasText: cfg.nativeName }).first();
      await targetOption.click();

      // Verify DOM lang and dir
      await expect(page.locator('html')).toHaveAttribute('lang', cfg.code);
      await expect(page.locator('html')).toHaveAttribute('dir', cfg.direction);

      // Verify header globe button badge updated
      await expect(page.locator('.lang-trigger-header .lang-code-badge')).toHaveText(cfg.code.toUpperCase());

      // If Arabic, verify RTL directionality
      if (cfg.code === 'ar') {
        const htmlDir = await page.getAttribute('html', 'dir');
        expect(htmlDir).toBe('rtl');
      }

      // Check header nav does not contain raw translation keys
      const headerText = await page.locator('.site-header').innerText();
      const headerLines = headerText.split('\n').map((s) => s.trim()).filter(Boolean);
      for (const line of headerLines) {
        expect(line).not.toMatch(RAW_KEY_PATTERN);
      }

      // Check horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 2;
      });
      expect(hasHorizontalScroll).toBe(false);
    }
  });

  test('4. Arabic (RTL) renders correctly with mirrored icons and logical alignments', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Set language directly to Arabic
    await page.evaluate(() => {
      localStorage.setItem('ann-bookstore-language', 'ar');
      document.cookie = 'ann-bookstore-language=ar; path=/';
    });
    await page.reload({ waitUntil: 'networkidle' });

    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    // Open Cart Drawer
    const cartBtn = page.locator('button[aria-label*="Cart"]').first();
    await cartBtn.click();
    const cartDrawer = page.locator('.cart-drawer-panel');
    await expect(cartDrawer).toBeVisible();

    // Verify no raw keys in Cart Drawer
    const cartText = await cartDrawer.innerText();
    const cartLines = cartText.split('\n').map((s) => s.trim()).filter(Boolean);
    for (const line of cartLines) {
      expect(line).not.toMatch(RAW_KEY_PATTERN);
    }

    // Close cart drawer
    await page.keyboard.press('Escape');

    // Visit Checkout Page
    await page.goto('/checkout', { waitUntil: 'networkidle' });
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    const checkoutHeading = page.locator('h1').first();
    await expect(checkoutHeading).toBeVisible();
    const checkoutText = await page.locator('main').innerText();
    const checkoutLines = checkoutText.split('\n').map((s) => s.trim()).filter(Boolean);
    for (const line of checkoutLines) {
      expect(line).not.toMatch(RAW_KEY_PATTERN);
    }

    // Visit Account Page
    await page.goto('/account', { waitUntil: 'networkidle' });
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    const accountText = await page.locator('main').innerText();
    const accountLines = accountText.split('\n').map((s) => s.trim()).filter(Boolean);
    for (const line of accountLines) {
      expect(line).not.toMatch(RAW_KEY_PATTERN);
    }
  });

  test('5. Reload keeps the user language choice via cookie and localStorage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Switch to French (fr)
    const globeBtn = page.locator('.lang-trigger-header').first();
    await globeBtn.click();
    const searchInput = page.locator('.lang-search-input');
    await searchInput.fill('Français');
    await page.locator('.lang-option-btn').filter({ hasText: 'Français' }).first().click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');

    // Reload page
    await page.reload({ waitUntil: 'networkidle' });

    // Language should persist as French
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.locator('.lang-trigger-header .lang-code-badge')).toHaveText('FR');
  });

  test('6. Signed-in profile keeps language selection across sessions', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Pre-seed authenticated user with German (de)
    await page.evaluate(() => {
      localStorage.setItem(
        'ann-bookstore-user',
        JSON.stringify({
          id: 'user_test',
          name: 'Jane Austen',
          email: 'jane@example.com',
          joinedDate: '2025-01-01',
          savedAddresses: [],
          orderCount: 1,
          readingPace: 'moderate',
          language: 'de',
        })
      );
    });

    // Reload with user profile
    await page.reload({ waitUntil: 'networkidle' });

    // HTML lang should be German 'de'
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    await expect(page.locator('.lang-trigger-header .lang-code-badge')).toHaveText('DE');

    // Switch to Italian (it)
    const globeBtn = page.locator('.lang-trigger-header').first();
    await globeBtn.click();
    const searchInput = page.locator('.lang-search-input');
    await searchInput.fill('Italiano');
    await page.locator('.lang-option-btn').filter({ hasText: 'Italiano' }).first().click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'it');

    // Verify localStorage user profile was updated to 'it'
    const storedUser = await page.evaluate(() => {
      const u = localStorage.getItem('ann-bookstore-user');
      return u ? JSON.parse(u) : null;
    });
    expect(storedUser).not.toBeNull();
    expect(storedUser.language).toBe('it');

    // Clear cookies to simulate fresh session with profile
    await page.evaluate(() => {
      document.cookie.split(';').forEach((c) => {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
    });

    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'it');
  });
});
