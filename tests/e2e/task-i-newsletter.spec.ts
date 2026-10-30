import { test, expect } from '@playwright/test';

test.describe('TASK I: Newsletter Signup, Double Opt-In & Unsubscribe Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('ann-cookie-consent', 'accepted');
      } catch (_) {}
    });
  });

  test('1. Subscribe gives pending, then verify link gives confirmed', async ({ page }) => {
    const uniqueEmail = `reader_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;

    await page.goto('/');

    const form = page.locator('[data-testid="newsletter-form"]');
    await expect(form).toBeVisible();

    await page.fill('[data-testid="input-newsletter-email"]', uniqueEmail);
    await page.click('[data-testid="btn-newsletter-submit"]');

    // 1. Subscribe gives pending: success box displays double opt-in notice and demo confirm link
    const successBox = page.locator('[data-testid="newsletter-success-box"]');
    await expect(successBox).toBeVisible();
    await expect(successBox).toContainText(/Check your inbox to confirm|Double Opt-In/i);

    const confirmLink = page.locator('[data-testid="link-demo-confirm-subscription"]');
    await expect(confirmLink).toBeVisible();
    const href = await confirmLink.getAttribute('href');
    expect(href).toContain('/newsletter/confirm?token=');
    expect(href).not.toContain(encodeURIComponent(uniqueEmail));
    expect(href).not.toContain(uniqueEmail);

    // 2. Navigate to verify link -> marks subscriber confirmed
    await page.goto(href!);
    const confirmMessage = page.locator('[data-testid="confirm-success-message"]');
    await expect(confirmMessage).toBeVisible();
    await expect(confirmMessage).toContainText(/Subscription Confirmed|Welcome to The Collector’s Dispatch/i);

    // Unsubscribe link is available
    const unsubLink = page.locator('[data-testid="link-manage-unsubscribe"]');
    await expect(unsubLink).toBeVisible();
  });

  test('2. Duplicate signup shows the same friendly message without revealing email status', async ({ page }) => {
    const uniqueEmail = `dup_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;

    // First signup
    await page.goto('/');
    await page.fill('[data-testid="input-newsletter-email"]', uniqueEmail);
    await page.click('[data-testid="btn-newsletter-submit"]');
    await expect(page.locator('[data-testid="newsletter-success-box"]')).toBeVisible();

    // Second signup with exact same email
    await page.goto('/');
    await page.fill('[data-testid="input-newsletter-email"]', uniqueEmail);
    await page.click('[data-testid="btn-newsletter-submit"]');

    // Displays identical friendly message without revealing whether email already exists
    const successBox = page.locator('[data-testid="newsletter-success-box"]');
    await expect(successBox).toBeVisible();
    await expect(successBox).toContainText(/Check your inbox to confirm|Double Opt-In/i);
  });

  test('3. Unsubscribe works from signed link, and resubscribe requires verification again', async ({ page }) => {
    const uniqueEmail = `unsub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;

    // Subscribe and confirm
    await page.goto('/');
    await page.fill('[data-testid="input-newsletter-email"]', uniqueEmail);
    await page.click('[data-testid="btn-newsletter-submit"]');
    const confirmHref = await page.locator('[data-testid="link-demo-confirm-subscription"]').getAttribute('href');

    await page.goto(confirmHref!);
    await expect(page.locator('[data-testid="confirm-success-message"]')).toBeVisible();

    const unsubHref = await page.locator('[data-testid="link-manage-unsubscribe"]').getAttribute('href');
    expect(unsubHref).toContain('/newsletter/unsubscribe?token=');
    expect(unsubHref).not.toContain(uniqueEmail);

    // Unsubscribe
    await page.goto(unsubHref!);
    const unsubSuccess = page.locator('[data-testid="unsubscribe-success-message"]');
    await expect(unsubSuccess).toBeVisible();
    await expect(unsubSuccess).toContainText(/You have been unsubscribed|no longer receive/i);

    // Offers resubscribe
    const resubBtn = page.locator('[data-testid="btn-resubscribe"]');
    await expect(resubBtn).toBeVisible();
    await resubBtn.click();

    // Resubscribing requires verification again
    const resubSuccess = page.locator('[data-testid="box-resubscribe-success"]');
    await expect(resubSuccess).toBeVisible();
    await expect(resubSuccess).toContainText(/Check your inbox to confirm|Double Opt-In/i);
    await expect(page.locator('[data-testid="link-demo-confirm-subscription"]')).toBeVisible();
  });

  test('4. Expired or reused token is refused', async ({ page }) => {
    const uniqueEmail = `reused_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;

    // Subscribe
    await page.goto('/');
    await page.fill('[data-testid="input-newsletter-email"]', uniqueEmail);
    await page.click('[data-testid="btn-newsletter-submit"]');
    const confirmHref = await page.locator('[data-testid="link-demo-confirm-subscription"]').getAttribute('href');

    // Confirm once
    await page.goto(confirmHref!);
    await expect(page.locator('[data-testid="confirm-success-message"]')).toBeVisible();

    // Attempt to reuse the single-use token a second time
    await page.goto(confirmHref!);
    const errorMessage = page.locator('[data-testid="confirm-error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/invalid or has already been used|expired/i);

    // Arbitrary fake token is refused
    await page.goto('/newsletter/confirm?token=invalid_arbitrary_token_hex_9999');
    await expect(page.locator('[data-testid="confirm-error-message"]')).toBeVisible();
  });

  test('5. Invalid email is refused', async ({ page }) => {
    await page.goto('/');

    // Test API validation refusal
    const res = await page.request.post('/api/newsletter', {
      data: {
        action: 'subscribe',
        email: 'invalid-email-format-without-at',
        source: 'home footer',
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('valid email');
  });

  test('6. Rate limit triggers per IP hash', async ({ page }) => {
    const testIp = `198.51.100.${Math.floor(Math.random() * 200) + 1}`;
    let triggeredRateLimit = false;

    for (let i = 0; i < 15; i++) {
      const res = await page.request.post('/api/newsletter', {
        headers: {
          'x-forwarded-for': testIp,
        },
        data: {
          action: 'subscribe',
          email: `ratelimit_${Date.now()}_${i}@example.com`,
          source: 'home footer',
        },
      });

      if (res.status() === 429) {
        triggeredRateLimit = true;
        const body = await res.json();
        expect(body.error).toMatch(/rate limit|too many requests/i);
        break;
      }
    }

    expect(triggeredRateLimit).toBe(true);
  });
});

