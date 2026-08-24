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
await page.waitForTimeout(400);

await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await page.locator('.dialog label:has-text("Mode debug") input[type=checkbox]').check();
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

// Try to force a future date directly on the DOM (bypassing the native
// date picker's own max constraint) to make sure the app-level validation
// also rejects it, not just the browser's UI affordance.
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
await page.evaluate((value) => {
  const form = document.querySelector('form');
  const input = document.querySelector('form input[type=date]');
  // Bypass the browser's own HTML5 constraint validation (the date input's
  // max attribute) so this test isolates the app-level JS validation.
  form.noValidate = true;
  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  nativeSetter.call(input, value);
}, tomorrow);

await page.click('button[type=submit]');
await page.waitForTimeout(200);

const errorText = await page.locator('.error').innerText();
assert.match(errorText, /futur/, `expected a future-date error message, got: "${errorText}"`);

const stored = JSON.parse(await page.evaluate(() => localStorage.getItem('donations')));
assert.equal(stored.length, 0, 'expected no donation to be recorded for a future date');

// The native date picker itself should also refuse to go past today.
const maxAttr = await page.locator('form input[type=date]').getAttribute('max');
const today = new Date().toISOString().slice(0, 10);
assert.equal(maxAttr, today, `expected the date input's max attribute to be today (${today}), got "${maxAttr}"`);

await browser.close();
console.log('OK: a future-dated donation is rejected both by the date input\'s max and by app-level validation.');
