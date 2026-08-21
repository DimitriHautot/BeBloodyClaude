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

await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await page.locator('.dialog input[type=checkbox]').check();
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

await page.click('button[type=submit]');
await page.waitForTimeout(200);

const typeEl = page.locator('section', { hasText: 'Historique' }).locator('li').first().locator('.type');
const textAlign = await typeEl.evaluate((el) => getComputedStyle(el).textAlign);
assert.equal(textAlign, 'right', `expected the type text to be right-aligned, got "${textAlign}"`);

await browser.close();
console.log('OK: the donation type in the history is right-aligned.');
