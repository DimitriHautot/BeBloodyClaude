// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via manual-tests/run.sh, or set the PORT env var yourself).
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);
await page.waitForTimeout(200);

// Seed a blood donation from 100 days ago — well past the 84-day blood
// interval, so blood is eligible again today — but picking a nearby past
// date in the quick-add form should still be rejected by the validation
// rules (only 10 days after that donation, far short of 84).
const hundredDaysAgo = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
await page.evaluate((date) => {
  localStorage.setItem('donations', JSON.stringify([{ id: '1', type: 'blood', date }]));
}, hundredDaysAgo);
await page.reload();
await page.waitForTimeout(400);

// Today, blood should be eligible (83 days ago + 84 days interval < today... actually
// verify via the "+" button presence, which only shows when eligible now).
const summary = page.locator('section', { hasText: 'Prochain don possible' });
const bloodRow = summary.locator('li', { hasText: 'Sang total' });
await bloodRow.locator('button.quick-add').click();
await page.waitForTimeout(150);

// Now pick a date only 10 days after the existing donation — well short of
// the 84-day blood interval — which the backend validation must still
// reject. The date field's own `min` (derived from the same rules) would
// normally block this natively before it even reaches JS; bypass it here
// (form.noValidate) to confirm the app-level validation is independently
// correct too, not just relying on the native constraint.
const tenDaysAfterPreviousDonation = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);
await page.evaluate((value) => {
  const form = document.querySelector('.dialog form');
  const input = document.querySelector('.dialog input[type=date]');
  form.noValidate = true;
  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  nativeSetter.call(input, value);
}, tenDaysAfterPreviousDonation);
await page.click('.dialog button[type=submit]');
await page.waitForTimeout(200);

assert.equal(await page.locator('.dialog').count(), 1, 'expected the modal to stay open after a rejected donation');
const errorText = await page.locator('.dialog .error').innerText();
assert.match(errorText, /Sang total/, `expected a validation error mentioning the type, got: "${errorText}"`);

const stored = JSON.parse(await page.evaluate(() => localStorage.getItem('donations')));
assert.equal(stored.length, 1, 'expected the invalid donation to not be recorded');

await browser.close();
console.log('OK: quick-add still enforces validation rules even though the date is user-editable.');
