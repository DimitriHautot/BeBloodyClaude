// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
//
// When only one donation type remains allowed, DonationForm must always be
// shown in the main window — fixed to that type — even with debug mode off.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);
await page.waitForTimeout(300);

assert.equal(await page.locator('main form').count(), 0, 'expected no DonationForm with debug mode off and all types allowed');

await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await page.locator('.allowed-types label:has-text("Sang total") input[type=checkbox]').uncheck();
await page.locator('.allowed-types label:has-text("Plaquettes") input[type=checkbox]').uncheck();
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

assert.equal(
  await page.locator('main form').count(),
  1,
  'expected DonationForm to appear automatically once only one donation type is allowed'
);
assert.equal(
  await page.locator('main form .fixed-type-value').textContent(),
  'Plasma',
  'expected the form to be fixed to the sole remaining allowed type'
);
assert.equal(
  await page.locator('main form input[name="donation-type"]').count(),
  0,
  'expected no type radio buttons since the type is fixed'
);

await browser.close();
console.log('OK: DonationForm shows automatically, fixed to the sole allowed type, without debug mode.');
