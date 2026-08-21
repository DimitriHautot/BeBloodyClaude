// Requires a dev server already running at http://127.0.0.1:5175 (npx vite --port 5175).
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto('http://127.0.0.1:5175/');
await page.waitForTimeout(400);

const text = await page.locator('section', { hasText: 'Prochain don possible' }).innerText();
console.log(text);

assert.match(text, /Dès maintenant/, `expected "Dès maintenant" to be shown when eligible today, got:\n${text}`);
assert.equal(
  await page.locator('section li.eligible').count(),
  3,
  'expected all 3 donation types to be shown as eligible (green) with an empty history'
);

await browser.close();
console.log('OK: "Dès maintenant" shown in green for all types with no history.');
