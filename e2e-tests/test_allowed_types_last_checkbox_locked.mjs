// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
//
// The last remaining checked donation-type checkbox must be disabled: with
// zero allowed types, nothing could ever be shown in NextDonationSummary or
// added via DonationForm again.
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
await page.locator('.allowed-types label:has-text("Sang total") input[type=checkbox]').uncheck();
await page.locator('.allowed-types label:has-text("Plaquettes") input[type=checkbox]').uncheck();
await page.waitForTimeout(100);

const lastCheckbox = page.locator('.allowed-types label:has-text("Plasma") input[type=checkbox]');
assert.equal(await lastCheckbox.isChecked(), true, 'expected the sole remaining type to stay checked');
assert.equal(await lastCheckbox.isDisabled(), true, 'expected the sole remaining checked type to be disabled from unchecking');

await browser.close();
console.log('OK: the last remaining allowed donation type cannot be unchecked.');
