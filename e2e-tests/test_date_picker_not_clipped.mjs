// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
//
// Firefox refuses to open the native <input type="date"> calendar popup at
// all when any ancestor has a non-"visible" overflow (even if the dialog
// never actually needs to scroll) — this is why the date picker didn't
// show up on Firefox/Linux and Firefox/Windows. The quick-add modal (the
// only modal containing a date field) must therefore render its dialog
// without overflow clipping, while the Paramètres modal (no date field,
// potentially long content) keeps it.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);
await page.waitForTimeout(400);

const summary = page.locator('section', { hasText: 'Prochain don possible' });
await summary.locator('li', { hasText: 'Plasma' }).locator('button.quick-add').click();
await page.waitForTimeout(150);

const quickAddDialog = page.locator('.dialog');
assert.equal(await quickAddDialog.count(), 1, 'expected the quick-add modal to open');
assert.equal(await quickAddDialog.locator('input[type=date]').count(), 1, 'expected a date field in the quick-add modal');

const quickAddOverflowY = await quickAddDialog.evaluate((el) => getComputedStyle(el).overflowY);
assert.equal(
  quickAddOverflowY,
  'visible',
  `expected the quick-add dialog to have no overflow clipping (so Firefox's date picker can render), got "${quickAddOverflowY}"`
);

await page.keyboard.press('Escape');
await page.waitForTimeout(150);

// The Paramètres modal has no date field and can keep scrolling behavior.
await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);

const settingsDialog = page.locator('.dialog');
const settingsOverflowY = await settingsDialog.evaluate((el) => getComputedStyle(el).overflowY);
assert.equal(settingsOverflowY, 'auto', 'expected the Paramètres modal to keep its scrollable overflow');

await browser.close();
console.log('OK: the quick-add modal has no overflow clipping around its date field; Paramètres keeps scrolling.');
