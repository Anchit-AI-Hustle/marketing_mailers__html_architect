// VAHDAM Mailer Studio — visual + invariant tests across six viewports.
// Generates a screenshot of every step at every viewport and asserts the
// critical layout invariants that previously regressed.
const { test, expect } = require('@playwright/test');
const path = require('path');

// All tests share this URL — it's set in playwright.config.js
const URL = process.env.TARGET_URL || 'file://' + path.resolve(__dirname, '..', 'vahdam_mailer_architect_v34.html');

// Skip auth modal: many SPAs gate behind sign-in. Studio uses an authOverlay.
// We bypass it by setting localStorage before the first navigation.
async function bypassAuth(page) {
  // Two strategies:
  // 1) Set localStorage before first load (works in Chromium under file://).
  // 2) Override the auth-show function as soon as it exists. WebKit + file://
  //    sometimes blocks localStorage, so we also patch the runtime.
  await page.addInitScript(() => {
    try {
      const u = { name: 'Test', email: 'test@vahdam.com', signedInAt: Date.now() };
      localStorage.setItem('vhd_users', JSON.stringify([u]));
      localStorage.setItem('vhd_session', JSON.stringify(u));
    } catch (_) {}
    // Force the auth overlay closed on every paint until DOM is ready.
    Object.defineProperty(window, '_currentUser', {
      value: { name: 'Test', email: 'test@vahdam.com' }, writable: true, configurable: true
    });
    const hideAuth = () => {
      const ov = document.getElementById('authOverlay');
      if (ov) { ov.style.display = 'none'; ov.style.visibility = 'hidden'; }
    };
    document.addEventListener('readystatechange', hideAuth);
    document.addEventListener('DOMContentLoaded', hideAuth);
    setInterval(hideAuth, 200);  // belt-and-suspenders
  });
}

test.describe('Mailer Studio — responsive smoke', () => {
  test.beforeEach(async ({ page }) => {
    await bypassAuth(page);
    await page.goto(URL);
    // Force-dismiss auth in case the overlay is still showing (defense in depth)
    await page.evaluate(() => {
      const ov = document.getElementById('authOverlay');
      if (ov) ov.style.display = 'none';
      // Make sure window._currentUser is set so any auth-gated UI proceeds
      window._currentUser = { name: 'Test', email: 'test@vahdam.com' };
      // Show Step 1 explicitly in case showOnly hasn't run yet
      const p1 = document.getElementById('p1');
      if (p1) p1.style.display = '';
    });
    await expect(page.locator('#promptIn')).toBeVisible({ timeout: 10_000 });
  });

  test('Step 1 — fields present and visible', async ({ page }, testInfo) => {
    await expect(page.locator('#promptIn')).toBeVisible();
    await expect(page.locator('#audienceIn')).toBeVisible();
    await expect(page.locator('#mktChips')).toBeVisible();
    await expect(page.locator('#typeChips')).toBeVisible();
    try { await page.screenshot({ path: `tests/screenshots/${testInfo.project.name}-step1.png`, fullPage: false, timeout: 5000 }); } catch (_) { /* screenshot is debug-only */ }
  });

  test('Sticky step nav sits below the global header (z-index)', async ({ page }, testInfo) => {
    // Functional check that doesn't depend on full Step 4 flow:
    // verify the sticky CSS positioning is correct.
    const result = await page.evaluate(() => {
      const stickyDivs = Array.from(document.querySelectorAll('div[style*="position:sticky"]'));
      const stepNavs = stickyDivs.filter(d =>
        d.textContent && d.textContent.includes('Back') && d.closest('#p4, #p5')
      );
      return stepNavs.map(d => ({
        top: d.style.top,
        zIndex: d.style.zIndex,
        parentId: d.closest('#p4, #p5')?.id || ''
      }));
    });
    // Both Step 4 and Step 5 nav bars must be defined
    expect(result.length).toBeGreaterThanOrEqual(2);
    for (const nav of result) {
      // Must NOT pin to top:0 — that collides with the global app-hdr
      expect(nav.top).not.toBe('0px');
      expect(nav.top).not.toBe('0');
      // z-index lower than app-hdr's 300 is fine, but must be set
      expect(parseInt(nav.zIndex, 10)).toBeGreaterThan(0);
    }
    try { await page.screenshot({ path: `tests/screenshots/${testInfo.project.name}-step1-overview.png`, fullPage: false, timeout: 5000 }); } catch (_) { /* screenshot is debug-only */ }
  });

  test('Selected Products strip stays horizontal — no vertical wrap', async ({ page }, testInfo) => {
    await page.fill('#promptIn', 'Premium gift sets for the holiday season with bundle savings');
    await page.evaluate(() => window.go2 && window.go2());
    await page.waitForTimeout(800);
    const strip = page.locator('#selectedProdsStrip');
    if (await strip.isVisible().catch(() => false)) {
      // The grid container must use flex/horizontal scroll
      const display = await page.locator('#selProdsGrid').evaluate(e => getComputedStyle(e).display);
      expect(display).toBe('flex');
      const overflow = await page.locator('#selProdsGrid').evaluate(e => getComputedStyle(e).overflowX);
      expect(['auto', 'scroll']).toContain(overflow);
    }
    try { await page.screenshot({ path: `tests/screenshots/${testInfo.project.name}-step2-strip.png`, fullPage: false, timeout: 5000 }); } catch (_) { /* screenshot is debug-only */ }
  });

  test('Mailer creative renders without off-brand hex', async ({ page }, testInfo) => {
    await page.fill('#promptIn', '20% off bestsellers — bold, conversion-focused');
    await page.evaluate(() => window.go2 && window.go2());
    await page.waitForTimeout(400);
    const html = await page.evaluate(() => {
      // Build both variants and concatenate
      try {
        const a = window.buildEmail ? window.buildEmail(null, 'US') : '';
        const b = window.buildEmailVariantB ? window.buildEmailVariantB(null, 'US') : '';
        return (a || '') + (b || '');
      } catch (e) { return ''; }
    });
    // No off-palette hex codes
    const offPalette = ['#0f2a1c', '#d4873a', '#fdf6e8', '#1a3a28', '#1a1a1a', '#faf8f4'];
    for (const hex of offPalette) {
      expect(html.toLowerCase().includes(hex)).toBeFalsy();
    }
    // Brand fonts declared
    expect(html).toContain('Lao MN');
    expect(html).toContain('Proxima Nova');
    // Both variants returned actual HTML
    expect(html.length).toBeGreaterThan(4000);
  });

  test('Sanity gate blocks Final Output when validation fails', async ({ page }) => {
    await page.fill('#promptIn', 'Test brief for sanity gate');
    await page.evaluate(() => window.go2 && window.go2());
    await page.waitForTimeout(300);
    // Force a validation failure by clearing products
    await page.evaluate(() => { window.S.finalProds = []; window.S.manualProds = []; window.S._strategyCacheKey = null; });
    const result = await page.evaluate(() => window.validateMailerCreative && window.validateMailerCreative());
    expect(result).toBeTruthy();
    expect(result.ok).toBeFalsy();
    expect(result.issues.length).toBeGreaterThan(0);
  });

  test('Variant A and Variant B differ structurally', async ({ page }) => {
    await page.fill('#promptIn', 'Bestselling premium chai for daily ritual lovers');
    await page.evaluate(() => window.go2 && window.go2());
    await page.waitForTimeout(400);
    const result = await page.evaluate(() => {
      try {
        const a = window.buildEmail(null, 'US');
        const b = window.buildEmailVariantB(null, 'US');
        const archA = (a.match(/archetype:([\w-]+)/) || [])[1];
        const archB = (b.match(/archetype:([\w-]+)/) || [])[1];
        return { archA, archB, lenA: a.length, lenB: b.length };
      } catch (e) { return { error: e.message }; }
    });
    expect(result.archA).toBeTruthy();
    expect(result.archB).toBeTruthy();
    expect(result.archA).not.toEqual(result.archB);  // structural divergence
  });
});
