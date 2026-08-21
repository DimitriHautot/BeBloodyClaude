// Requires a dev server already running at http://127.0.0.1:5174 (npx vite --port 5174).
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto('http://127.0.0.1:5174/');
await page.waitForTimeout(400);

// First blood donation today: should succeed, no error shown.
await page.selectOption('select', { label: 'Sang total' });
await page.click('button[type=submit]');
await page.waitForTimeout(200);
assert.equal(
  await page.locator('form .error').count(),
  0,
  'expected no error message after the first (valid) blood donation'
);

// Second blood donation the same day: should be rejected (60-day rule).
await page.click('button[type=submit]');
await page.waitForTimeout(200);
const errorText = await page.locator('form .error').innerText();
assert.match(
  errorText,
  /respecte pas les règles de don pour Sang total \(Belgique\)/,
  `expected a rule-violation error message, got: "${errorText}"`
);

// The rejected donation must not have been added to the history.
const historyText = await page.locator('section', { hasText: 'Historique' }).innerText();
assert.equal(
  (historyText.match(/Sang total/g) ?? []).length,
  1,
  `expected exactly 1 blood donation in history, got history:\n${historyText}`
);

await browser.close();
console.log('OK: validation error is shown and the rejected donation is not persisted.');
