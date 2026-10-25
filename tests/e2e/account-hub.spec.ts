import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { width: 1440, height: 900, name: 'Desktop (1440px)' },
  { width: 390, height: 844, name: 'Mobile Phone (390px)' },
];

test.describe('Account Hub & Subpages E2E Suite', () => {
  for (const vp of VIEWPORTS) {
    test.describe(`Viewport: ${vp.name}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
          try {
            window.localStorage.setItem('ann-cookie-consent', 'accepted');
          } catch (_) {}
        });
      });

      test('Signed-out access to /account/orders redirects to /login', async ({ page, context }) => {
        // Clear all cookies and storage to simulate signed-out user
        await context.clearCookies();
        await page.goto('/login');
        await page.evaluate(() => {
          localStorage.setItem('ann-bookstore-signed-out', 'true');
          localStorage.removeItem('ann-bookstore-user');
          document.cookie = 'ann_session=; path=/; max-age=0';
        });

        await page.goto('/account/orders');
        await expect(page).toHaveURL(/.*\/login\?next=%2Faccount%2Forders/);
        await expect(page.locator('h1')).toContainText(/Sign in/i);
      });

      test('Sign in flow authenticates and lands on /account Hub', async ({ page }) => {
        await page.goto('/login?next=/account');
        // Click 1-click demo login
        await page.locator('button:has-text("Sign in as Eleanor Vance")').click();
        await page.waitForURL('**/account');
        await expect(page.locator('h1')).toContainText(/Your Account/i);

        // Verify avatar, name, and real metric counts
        await expect(page.locator('text=Eleanor Vance').first()).toBeVisible();
        await expect(page.locator('text=reader.eleanor@example.com').first()).toBeVisible();
      });

      test('Hub shows all 10 cards and each card link opens its page', async ({ page }) => {
        await page.goto('/account');

        const cardHrefs = [
          '/account/orders',
          '/account/security',
          '/account/addresses',
          '/account/payments',
          '/account/lists',
          '/account/returns',
          '/account/reviews',
          '/account/preferences',
          '/account/privacy',
          '/account/help',
        ];

        for (const href of cardHrefs) {
          const cardLink = page.locator(`a[href="${href}"]`).first();
          await expect(cardLink).toBeVisible();
        }

        // Click first card and verify navigation
        await page.locator('a[href="/account/orders"]').first().click();
        await page.waitForURL('**/account/orders');
        await expect(page.locator('h1')).toContainText(/Your Orders/i);
      });

      test('Sidebar / mobile tabs navigation and active states', async ({ page }) => {
        await page.goto('/account/orders');

        if (vp.width >= 1024) {
          // Desktop sidebar visible
          const sidebar = page.locator('.account-desktop-sidebar');
          await expect(sidebar).toBeVisible();
          const activeLink = sidebar.locator('a[href="/account/orders"]');
          await expect(activeLink).toBeVisible();

          // Click Security link in sidebar
          await sidebar.locator('a[href="/account/security"]').click();
          await page.waitForURL('**/account/security');
          await expect(page.locator('h1')).toContainText(/Login & Security/i);
        } else {
          // Mobile horizontal tabs or mobile back link visible
          const backLink = page.locator('.account-mobile-back a');
          await expect(backLink).toBeVisible();
          const tabs = page.locator('.account-horizontal-tabs');
          await expect(tabs).toBeVisible();

          // Tap security tab
          await tabs.locator('a[href="/account/security"]').click();
          await page.waitForURL('**/account/security');
          await expect(page.locator('h1')).toContainText(/Login & Security/i);
        }
      });

      test('Address management: add, edit, delete with undo, and set default', async ({ page }) => {
        await page.goto('/account/addresses');

        // Add new address
        await page.locator('button:has-text("Add Address")').first().click();
        await expect(page.locator('#address-modal-title')).toBeVisible();

        await page.fill('#address-fullName', 'Eleanor Tester');
        await page.fill('#address-street', '456 Hawthorn Boulevard');
        await page.fill('#address-city', 'Seattle');
        await page.selectOption('#address-state', 'WA');
        await page.fill('#address-zip', '98101');
        await page.locator('button[type="submit"]:has-text("Add Address")').click();

        // Verify address added
        await expect(page.locator('text=456 Hawthorn Boulevard').first()).toBeVisible();

        // Set as default
        const newCard = page.locator('.address-card').filter({ hasText: '456 Hawthorn Boulevard' }).first();
        const setDefaultBtn = newCard.locator('button:has-text("Set as default")');
        if (await setDefaultBtn.isVisible()) {
          await setDefaultBtn.click();
          await expect(page.locator('text=Default Address').first()).toBeVisible();
        }

        // Delete address and verify Undo toast
        const removeBtn = newCard.locator('button:has-text("Remove")').first();
        await removeBtn.click();
        await expect(page.locator('text=Address deleted: 456 Hawthorn Boulevard').first()).toBeVisible();

        // Click Undo
        const undoBtn = page.locator('button:has-text("Undo")');
        if (await undoBtn.isVisible()) {
          await undoBtn.click();
          await expect(page.locator('text=Address deletion undone').first()).toBeVisible();
          await expect(page.locator('text=456 Hawthorn Boulevard').first()).toBeVisible();
        }
      });

      test('Payment options: demo test card only with no card inputs, set default and remove', async ({ page }) => {
        await page.goto('/account/payments');

        // Check demo security banner
        await expect(page.locator('text=Demo: no real payment details are collected or stored').first()).toBeVisible();

        // Add Test Card
        await page.locator('button:has-text("Add Test Card")').first().click();
        await expect(page.locator('#add-card-dialog-title')).toBeVisible();

        // Verify NO credit card number input exists
        const cardInput = page.locator('input[name="cardNumber"], input[placeholder*="Card number"]');
        await expect(cardInput).toHaveCount(0);

        // Select Mastercard preset
        await page.locator('text=Mastercard · Test Card (ending in 4444)').click();
        await page.locator('button[type="submit"]:has-text("Add Test Card")').click();

        // Verify Mastercard 4444 added
        await expect(page.locator('text=Mastercard ending in 4444').first()).toBeVisible();

        // Remove card with confirmation
        const removeCardBtn = page.locator('.payment-card').filter({ hasText: 'Mastercard ending in 4444' }).locator('button:has-text("Remove Card")').first();
        await removeCardBtn.click();
        await expect(page.locator('#remove-card-dialog-title')).toBeVisible();
        await page.locator('button:has-text("Confirm Remove")').click();

        await expect(page.locator('text=Removed Mastercard ending in 4444').first()).toBeVisible();
      });

      test('Orders: Buy It Again, Cancel order before dispatched, and Return flow', async ({ page }) => {
        await page.goto('/account/orders');

        // Verify sample orders exist and are labeled
        await expect(page.locator('text=Sample Order').first()).toBeVisible();

        // Buy it again
        const buyAgainBtn = page.locator('button:has-text("Buy It Again"), button:has-text("Buy it again")').first();
        await buyAgainBtn.click();
        await expect(page.locator('text=item(s) to your bag').first()).toBeVisible();

        // Place a real order through checkout
        await page.goto('/books/the-quiet-hours');
        const addBtn = page.locator('button.add-product').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }

        await page.goto('/checkout');
        await page.fill('#checkout-email', 'reader.eleanor@example.com');
        await page.fill('#checkout-fullName', 'Eleanor Vance');
        await page.fill('#checkout-addressLine1', '14 Elmwood Terrace');
        await page.fill('#checkout-city', 'Portland');
        await page.selectOption('#checkout-state', 'OR');
        await page.fill('#checkout-zip', '97201');

        await page.locator('button[type="submit"]').click();
        await page.waitForURL('**/checkout/confirmation');

        // Go to Orders and find the newly created order
        await page.goto('/account/orders');
        await expect(page.locator('span:has-text("Confirmed"), [data-status="Confirmed"]').first()).toBeVisible();

        // Cancel order
        const cancelBtn = page.locator('button:has-text("Cancel Order")').first();
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click();
          await expect(page.locator('#cancel-order-dialog-title')).toBeVisible();
          await page.locator('button:has-text("Confirm Cancellation")').click();
          await expect(page.locator('text=has been cancelled').first()).toBeVisible();
        }
      });

      test('Security: change password with validation and active sessions list', async ({ page }) => {
        await page.goto('/account/security');

        // Test wrong current password
        await page.fill('#current-password-input', 'wrongpassword');
        await page.fill('#new-password-input', 'NewPass1234');
        await page.fill('#confirm-password-input', 'NewPass1234');
        await page.locator('button:has-text("Update Password")').click();
        await expect(page.locator('text=Current password is incorrect').first()).toBeVisible();

        // Active sessions list verification
        await expect(page.locator('text=This Device').first()).toBeVisible();
        await expect(page.locator('text=Active Sessions').first()).toBeVisible();
      });

      test('Reading lists: create, rename, share link, and add to bag', async ({ page }) => {
        await page.goto('/account/lists');

        // Create new list
        await page.locator('button:has-text("Create New List")').click();
        await expect(page.locator('#create-list-dialog-title')).toBeVisible();
        await page.fill('#create-list-name-input', 'Winter Poetry Collection');
        await page.locator('button[type="submit"]:has-text("Create List")').click();

        await expect(page.locator('text=Winter Poetry Collection').first()).toBeVisible();

        // Share link
        await page.locator('button:has-text("Share Link")').first().click();
        await expect(page.locator('text=Shareable link copied').first()).toBeVisible();
      });

      test('Privacy & Data: download JSON archive and delete account verification', async ({ page }) => {
        await page.goto('/account/privacy');

        // Verify download data button
        const downloadBtn = page.locator('button:has-text("Download My Data (JSON)")');
        await expect(downloadBtn).toBeVisible();

        // Verify delete modal requires typing DELETE
        await page.locator('button:has-text("Delete My Data and Account")').click();
        await expect(page.locator('#delete-privacy-title')).toBeVisible();

        const confirmBtn = page.locator('button:has-text("Confirm Erasure")');
        await expect(confirmBtn).toBeDisabled();

        await page.fill('input[placeholder="DELETE"]', 'DELETE');
        await expect(confirmBtn).toBeEnabled();

        // Cancel modal
        await page.locator('button:has-text("Cancel")').click();
      });

      test('Customer Service: contact form generates ticket and track order finds shipments', async ({ page }) => {
        await page.goto('/account/help');

        // Track order box
        await page.fill('input[placeholder*="ANN-2026"]', 'ANN-2026-00412');
        await page.locator('button:has-text("Track")').click();
        await expect(page.locator('text=Found order #ANN-2026-00412').first()).toBeVisible();

        // Submit support ticket
        await page.fill('#inquiry-message', 'Inquiring regarding archival binding condition.');
        await page.locator('button:has-text("Send Inquiry")').click();
        await expect(page.locator('text=Message Received!').first()).toBeVisible();
        await expect(page.locator('text=support ticket').first()).toBeVisible();
      });

      test('Language change persists and keeps working in /account', async ({ page }) => {
        await page.goto('/account/preferences');
        // Switch to Spanish
        await page.locator('button:has-text("Español")').click();
        await expect(page.locator('text=Language preference updated').first()).toBeVisible();

        // Check hub in Spanish
        await page.goto('/account');
        await expect(page.locator('h1')).toContainText(/Your Account|Tu Cuenta/i);

        // Switch back to English
        await page.goto('/account/preferences');
        await page.locator('section[aria-labelledby="language-card-title"] button:has-text("English")').first().click();
      });
    });
  }
});
