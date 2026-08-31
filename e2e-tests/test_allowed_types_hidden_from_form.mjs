// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
//
// With debug mode on and more than one donation type still allowed,
// DonationForm's radio buttons must only offer allowed types.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);
await page.waitForTimeout(300);

await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await page.locator('.dialog label:has-text("Mode debug") input[type=checkbox]').check();
await page.locator('.allowed-types label:has-text("Plaquettes") input[type=checkbox]').uncheck();
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

assert.equal(
  await page.locator('main form input[name="donation-type"][value="platelets"]').count(),
  0,
  'expected the unchecked type to be absent from the DonationForm radio buttons'
);
assert.equal(
  await page.locator('main form input[name="donation-type"][value="blood"]').count(),
  1,
  'expected still-allowed types to remain in the DonationForm radio buttons'
);
assert.equal(
  await page.locator('main form input[name="donation-type"][value="plasma"]').count(),
  1,
  'expected still-allowed types to remain in the DonationForm radio buttons'
);

await browser.close();
console.log("OK: DonationForm's free-selection radio buttons only offer allowed donation types.");
