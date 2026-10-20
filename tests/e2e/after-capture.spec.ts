import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('capture after screenshots and calculate recovery metrics', async ({ page }) => {
  const screenshotsDir = path.join(process.cwd(), 'docs', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const viewports = [
    { width: 1440, height: 900, name: '1440' },
    { width: 1024, height: 768, name: '1024' },
    { width: 768, height: 1024, name: '768' },
    { width: 390, height: 844, name: '390' },
    { width: 320, height: 700, name: '320' },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('ann-cookie-consent', 'accepted');
      } catch (_) {}
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    // Full page screenshot requested: after-<viewport>.png
    await page.screenshot({
      path: path.join(screenshotsDir, `after-${vp.name}.png`),
      fullPage: true,
    });

    // First view screenshot: after-firstview-<viewport>.png
    await page.screenshot({
      path: path.join(screenshotsDir, `after-firstview-${vp.name}.png`),
      clip: { x: 0, y: 0, width: vp.width, height: vp.height },
    });

    // Header screenshot
    const header = page.locator('.site-header');
    if ((await header.count()) > 0) {
      await header.first().screenshot({
        path: path.join(screenshotsDir, `after-header-${vp.name}.png`),
      });
    }

    // Footer screenshot
    const footer = page.locator('footer, .site-footer');
    if ((await footer.count()) > 0) {
      await footer.first().screenshot({
        path: path.join(screenshotsDir, `after-footer-${vp.name}.png`),
      });
    }

    if (vp.name === '1440') {
      const metrics = await page.evaluate(() => {
        const h = window.innerHeight;

        const interactives = Array.from(
          document.querySelectorAll('a, button, input, select, textarea, [role="button"]')
        ).filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= h;
        });

        const headerEl = document.querySelector('.site-header');
        const headerHeight = headerEl ? Math.round(headerEl.getBoundingClientRect().height) : 0;
        const headerControls = headerEl
          ? Array.from(headerEl.querySelectorAll('a, button, input')).filter(
              (el) => el.getBoundingClientRect().width > 0
            ).length
          : 0;

        const sections = Array.from(
          document.querySelectorAll('section, .layout-section, .hero-section, .shelf-section, .author-section, .journal-section, .companion-section')
        ).length;

        const floating = Array.from(document.querySelectorAll('*')).filter((el) => {
          const pos = window.getComputedStyle(el).position;
          return pos === 'fixed' && el.getBoundingClientRect().width > 0;
        }).length;

        const firstViewAll = Array.from(document.querySelectorAll('*')).filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && r.top < h && r.bottom > 0;
        });

        let withBorders = 0;
        let withShadows = 0;
        const fontSizes = new Set<string>();
        const textColors = new Set<string>();
        let totalWords = 0;

        for (const el of firstViewAll) {
          const style = window.getComputedStyle(el);
          if (style.borderWidth && parseFloat(style.borderWidth) > 0 && style.borderStyle !== 'none')
            withBorders++;
          if (style.boxShadow && style.boxShadow !== 'none') withShadows++;
          if (el.childNodes) {
            for (const n of Array.from(el.childNodes)) {
              if (n.nodeType === Node.TEXT_NODE && (n.textContent || '').trim()) {
                fontSizes.add(style.fontSize);
                textColors.add(style.color);
                totalWords += (n.textContent || '').trim().split(/\s+/).length;
              }
            }
          }
        }

        return {
          firstViewInteractives: interactives.length,
          distinctFontSizes: fontSizes.size,
          distinctTextColors: textColors.size,
          sectionsCount: sections,
          firstViewWords: totalWords,
          elementsWithBorders: withBorders,
          elementsWithShadows: withShadows,
          headerHeight,
          headerControls,
          floatingElements: floating,
        };
      });

      console.log('AFTER_METRICS:' + JSON.stringify(metrics));
    }
  }
});
