// Requires a dev server already running at http://127.0.0.1:5176 (npx vite --port 5176).
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto('http://127.0.0.1:5176/');
await page.waitForTimeout(400);

// Turn on debug mode so DonationForm is visible, then add a donation.
await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await page.locator('.dialog label:has-text("Mode debug") input[type=checkbox]').check();
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

await page.fill('form input[type=date]', '2026-08-05');
await page.click('button[type=submit]');
await page.waitForTimeout(200);

const historyText = await page.locator('section', { hasText: 'Historique' }).innerText();
assert.match(
  historyText,
  /5 août 2026/,
  `expected the history to show the formatted date "5 août 2026", got:\n${historyText}`
);
assert.doesNotMatch(historyText, /2026-08-05/, 'expected the raw ISO date to no longer be shown');

await browser.close();
console.log('OK: DonationList shows dates formatted via formatDateLabel.');
