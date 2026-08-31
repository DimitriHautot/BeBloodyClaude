// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
//
// SettingsPanel now lets the donor uncheck donation types they can't give.
// An unchecked type must disappear from NextDonationSummary.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);
await page.waitForTimeout(300);

assert.equal(
  await page.locator('main .type:has-text("Plasma")').count(),
  1,
  'expected Plasma to be listed in NextDonationSummary by default'
);

await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await page.locator('.allowed-types label:has-text("Plasma") input[type=checkbox]').uncheck();
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

assert.equal(
  await page.locator('main .type:has-text("Plasma")').count(),
  0,
  'expected Plasma to disappear from NextDonationSummary once unchecked in settings'
);
assert.equal(
  await page.locator('main .type:has-text("Sang total")').count(),
  1,
  'expected the still-allowed types to remain listed'
);

await browser.close();
console.log('OK: unchecking a donation type in settings hides it from NextDonationSummary.');
