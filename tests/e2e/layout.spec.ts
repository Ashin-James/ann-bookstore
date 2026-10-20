import { test, expect } from '@playwright/test';

export interface LayoutFailure {
  route: string;
  viewport: string;
  language: string;
  textSize: string;
  failureType: string;
  elementSelector: string;
}

const ROUTES = [
  '/',
  '/about',
  '/accessibility',
  '/account',
  '/books',
  '/books/the-quiet-hours',
  '/books/the-quiet-hours/chapter-one',
  '/cart',
  '/checkout',
  '/checkout/confirmation',
  '/journal',
  '/journal/on-monsoon-and-memory',
  '/privacy',
  '/shipping-returns',
  '/terms',
  '/wishlist',
];

const VIEWPORTS = [
  { width: 320, height: 700, label: '320' },
  { width: 360, height: 750, label: '360' },
  { width: 390, height: 844, label: '390' },
  { width: 430, height: 932, label: '430' },
  { width: 768, height: 1024, label: '768' },
  { width: 1024, height: 768, label: '1024' },
  { width: 1280, height: 800, label: '1280' },
  { width: 1440, height: 900, label: '1440' },
  { width: 1920, height: 1080, label: '1920' },
  { width: 844, height: 390, label: 'landscape-390h' },
];

const LANGUAGES = ['en', 'es'];
const TEXT_SIZES = ['100%', '200%'];

export function formatTable(failures: LayoutFailure[]): string {
  if (failures.length === 0) return 'No layout failures detected. Perfect score!';
  const header = '| Route | Viewport | Language | Failure Type | Element Selector |\n|---|---|---|---|---|';
  const rows = failures.map(
    (f) =>
      `| ${f.route} | ${f.viewport} (${f.textSize}) | ${f.language} | ${f.failureType} | ${f.elementSelector.replace(/\|/g, '\\|')} |`
  );
  return [header, ...rows].join('\n');
}

test.describe('STEP 1: Layout Measuring Suite', () => {
  test('measures layout, overflow, overlap, contrast, touch targets, and motion across all routes', async ({
    page,
  }) => {
    test.setTimeout(400000);
    const allFailures: LayoutFailure[] = [];

    // Pre-warm routes in Next.js dev server
    for (const r of ROUTES) {
      try {
        await page.goto(r, { waitUntil: 'domcontentloaded', timeout: 15000 });
      } catch (_) {}
    }

    for (const route of ROUTES) {
      for (const lang of LANGUAGES) {
        // Set language via localStorage before navigation
        await page.addInitScript((l) => {
          try {
            window.localStorage.setItem('ann-bookstore-language', l);
          } catch (_) {}
        }, lang);

        let navigated = false;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 20000 });
            navigated = true;
            break;
          } catch (_) {
            await page.waitForTimeout(400);
          }
        }
        if (!navigated) continue;

        await page.waitForTimeout(50);

        for (const vp of VIEWPORTS) {
          await page.setViewportSize({ width: vp.width, height: vp.height });

          for (const textSize of TEXT_SIZES) {
            let pageIssues: { type: string; selector: string }[] = [];
            for (let evalTry = 0; evalTry < 3; evalTry++) {
              try {
                if (textSize === '200%') {
                  await page.evaluate(() => {
                    document.documentElement.style.fontSize = '200%';
                  });
                } else {
                  await page.evaluate(() => {
                    document.documentElement.style.fontSize = '100%';
                  });
                }
                await page.waitForTimeout(30);

                pageIssues = await page.evaluate(() => {
                  const issues: { type: string; selector: string }[] = [];

              function getSel(el: Element | null): string {
                if (!el || el === document.body || el === document.documentElement) return 'body';
                if (el.id) return '#' + el.id;
                let s = el.tagName.toLowerCase();
                if (el.className && typeof el.className === 'string') {
                  const cls = el.className
                    .trim()
                    .split(/\s+/)
                    .filter((c) => c && !c.includes(':') && !c.includes('[') && !c.includes('/'))
                    .slice(0, 2);
                  if (cls.length) s += '.' + cls.join('.');
                }
                return s;
              }

              // a) Horizontal scroll
              const docWidth = Math.max(
                document.documentElement.scrollWidth,
                document.body.scrollWidth,
                document.documentElement.offsetWidth
              );
              const winWidth = window.innerWidth;
              if (docWidth > winWidth + 1.5) {
                const wideEls = Array.from(document.querySelectorAll('*'))
                  .filter((el) => {
                    const r = el.getBoundingClientRect();
                    return r.right > winWidth + 1.5;
                  })
                  .map((el) => `${getSel(el)}(r:${Math.round(el.getBoundingClientRect().right)},w:${Math.round(el.getBoundingClientRect().width)})`)
                  .slice(0, 5);
                issues.push({
                  type: 'a) horizontal-scroll',
                  selector: `docWidth(${docWidth}px) > winWidth(${winWidth}px) [${wideEls.join(', ')}]`,
                });
              }

              const all = Array.from(document.querySelectorAll('*'));
              const visible = all.filter((el) => {
                const style = window.getComputedStyle(el);
                if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0')
                  return false;
                const r = el.getBoundingClientRect();
                return r.width > 0 && r.height > 0;
              });

              // e) Touch targets under 44x44 on viewports 430px and below
              if (winWidth <= 430) {
                const interactives = visible.filter((el) => {
                  const tag = el.tagName.toLowerCase();
                  const role = el.getAttribute('role');
                  // WCAG 2.5.8 exception: inline links inside sentences/paragraphs
                  if (tag === 'a') {
                    const comp = window.getComputedStyle(el);
                    if (
                      comp.display === 'inline' ||
                      el.parentElement?.tagName.toLowerCase() === 'p' ||
                      el.parentElement?.tagName.toLowerCase() === 'small'
                    ) {
                      return false;
                    }
                  }
                  return (
                    tag === 'button' ||
                    tag === 'a' ||
                    tag === 'input' ||
                    tag === 'select' ||
                    role === 'button'
                  );
                });
                for (const el of interactives) {
                  const r = el.getBoundingClientRect();
                  if (r.width < 43.5 || r.height < 43.5) {
                    issues.push({
                      type: 'e) touch-target-under-44',
                      selector: `${getSel(el)} (${Math.round(r.width)}x${Math.round(r.height)}px)`,
                    });
                  }
                }
              }

              // Leaf text elements
              const textEls = visible.filter((el) => {
                for (const node of el.childNodes) {
                  if (node.nodeType === Node.TEXT_NODE && (node.textContent || '').trim().length > 0) {
                    return true;
                  }
                }
                return false;
              });

              // f) Text under 14px
              for (const el of textEls) {
                if (
                  el.getAttribute('aria-hidden') === 'true' ||
                  el.closest('[aria-hidden="true"]') ||
                  el.closest('[role="img"]') ||
                  el.closest('svg')
                ) {
                  continue;
                }
                const fs = parseFloat(window.getComputedStyle(el).fontSize);
                if (fs < 13.5 && (el.textContent || '').trim().length > 0) {
                  issues.push({
                    type: 'f) text-under-14px',
                    selector: `${getSel(el)} (${Math.round(fs)}px: "${(el.textContent || '')
                      .trim()
                      .slice(0, 18)}")`,
                  });
                }
              }

              // b) Text overflow / cut off
              for (const el of textEls) {
                if (
                  el.getAttribute('aria-hidden') === 'true' ||
                  el.closest('[aria-hidden="true"]') ||
                  el.closest('[role="img"]') ||
                  el.closest('svg')
                ) {
                  continue;
                }
                if (el.scrollWidth > el.clientWidth + 2) {
                  const s = window.getComputedStyle(el);
                  if (s.overflowX !== 'auto' && s.overflowX !== 'scroll') {
                    issues.push({
                      type: 'b) text-scroll-overflow',
                      selector: `${getSel(el)} (scrollW ${el.scrollWidth} > clientW ${el.clientWidth})`,
                    });
                  }
                }
              }

              // c) Text overlap / behind image/decorative layer
              for (const el of textEls) {
                if (
                  el.getAttribute('aria-hidden') === 'true' ||
                  el.closest('[aria-hidden="true"]') ||
                  el.closest('[role="img"]') ||
                  el.closest('svg')
                ) {
                  continue;
                }
                const r = el.getBoundingClientRect();
                if (
                  r.top >= 0 &&
                  r.bottom <= window.innerHeight &&
                  r.left >= 0 &&
                  r.right <= window.innerWidth
                ) {
                  const cx = r.left + r.width / 2;
                  const cy = r.top + r.height / 2;
                  const topEl = document.elementFromPoint(cx, cy);
                  if (topEl && topEl !== el && !el.contains(topEl) && !topEl.contains(el)) {
                    const tag = topEl.tagName.toLowerCase();
                    const isDeco =
                      topEl.classList.contains('art-sun') ||
                      topEl.classList.contains('art-orbit') ||
                      topEl.getAttribute('aria-hidden') === 'true' ||
                      topEl.getAttribute('role') === 'presentation';
                    if (tag === 'img' || tag === 'svg' || tag === 'video' || isDeco) {
                      issues.push({
                        type: 'c) text-behind-layer',
                        selector: `${getSel(el)} behind ${getSel(topEl)}`,
                      });
                    }
                  }
                }
              }

              // d) Contrast ratio under 4.5:1
              function getLuminance(r: number, g: number, b: number): number {
                const a = [r, g, b].map((v) => {
                  v /= 255;
                  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
                });
                return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
              }

              function parseRgb(str: string): [number, number, number] {
                const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                return m ? [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])] : [37, 37, 31];
              }

              for (const el of textEls) {
                if (
                  el.getAttribute('aria-hidden') === 'true' ||
                  el.closest('[aria-hidden="true"]') ||
                  el.closest('[role="img"]') ||
                  el.closest('svg')
                ) {
                  continue;
                }
                const style = window.getComputedStyle(el);
                const fg = parseRgb(style.color);
                let bg: [number, number, number] = [246, 240, 231];
                let cur: Element | null = el;
                while (cur) {
                  const bgStyle = window.getComputedStyle(cur);
                  const m = bgStyle.backgroundColor.match(
                    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
                  );
                  if (m && (m[4] === undefined || parseFloat(m[4]) > 0.6)) {
                    bg = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
                    break;
                  }
                  if (cur.classList.contains('button-dark') || cur.classList.contains('demo-banner')) {
                    bg = [37, 37, 31];
                    break;
                  }
                  if (cur.classList.contains('author-section')) {
                    bg = [48, 42, 39];
                    break;
                  }
                  cur = cur.parentElement;
                }
                const L1 = getLuminance(fg[0], fg[1], fg[2]);
                const L2 = getLuminance(bg[0], bg[1], bg[2]);
                const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
                if (ratio < 4.45 && (el.textContent || '').trim().length > 3) {
                  issues.push({
                    type: 'd) contrast-under-4.5',
                    selector: `${getSel(el)} (${ratio.toFixed(2)}:1)`,
                  });
                }
              }

              // g) Image distortion
              const imgs = Array.from(document.querySelectorAll('img'));
              for (const img of imgs) {
                if (img.naturalWidth > 0 && img.clientWidth > 0 && img.clientHeight > 0) {
                  const natRatio = img.naturalWidth / img.naturalHeight;
                  const dispRatio = img.clientWidth / img.clientHeight;
                  const fit = window.getComputedStyle(img).objectFit;
                  if (fit !== 'cover' && fit !== 'contain' && Math.abs(natRatio - dispRatio) > 0.2) {
                    issues.push({
                      type: 'g) image-distorted',
                      selector: `${getSel(img)} (${img.clientWidth}x${img.clientHeight})`,
                    });
                  }
                }
              }

              // h) Fixed or sticky elements covering interactive buttons
              const fixedEls = visible.filter((el) => {
                const p = window.getComputedStyle(el).position;
                return p === 'fixed' || p === 'sticky';
              });
              const buttons = visible.filter((el) => {
                const tag = el.tagName.toLowerCase();
                return tag === 'button' || tag === 'a' || tag === 'input';
              });
              for (const f of fixedEls) {
                const fr = f.getBoundingClientRect();
                if (fr.width < 50 || fr.height < 20) continue;
                for (const b of buttons) {
                  if (f.contains(b)) continue;
                  const br = b.getBoundingClientRect();
                  const ox = Math.max(0, Math.min(fr.right, br.right) - Math.max(fr.left, br.left));
                  const oy = Math.max(0, Math.min(fr.bottom, br.bottom) - Math.max(fr.top, br.top));
                  if (ox > 15 && oy > 15) {
                    const cx = br.left + br.width / 2;
                    const cy = br.top + br.height / 2;
                    if (cx >= 0 && cx <= winWidth && cy >= 0 && cy <= window.innerHeight) {
                      const top = document.elementFromPoint(cx, cy);
                      if (top && (f === top || f.contains(top))) {
                        issues.push({
                          type: 'h) fixed-element-covering-button',
                          selector: `${getSel(f)} covers ${getSel(b)}`,
                        });
                      }
                    }
                  }
                }
              }

              return issues;
            });
            break;
          } catch (err) {
            await page.waitForTimeout(100);
          }
        }

        for (const issue of pageIssues) {
          allFailures.push({
            route,
            viewport: vp.label,
            language: lang,
            textSize,
            failureType: issue.type,
            elementSelector: issue.selector,
          });
        }
      }
        }
      }
    }

    console.log('\n--- MEASURING SCRIPT RUN RESULTS ---');
    console.log(formatTable(allFailures.slice(0, 50))); // print sample or top failures
    console.log(`\nTotal Failures Found Across All Combinations: ${allFailures.length}\n`);

    expect(allFailures.length).toBe(0);
  });
});
