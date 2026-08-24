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

// Seed a blood donation from 100 days ago: 100 - 84 = the earliest possible
// next blood donation is 16 days ago (still in the past, so blood shows as
// eligible today too).
const hundredDaysAgo = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
await page.evaluate((date) => {
  localStorage.setItem('donations', JSON.stringify([{ id: '1', type: 'blood', date }]));
}, hundredDaysAgo);
await page.reload();
await page.waitForTimeout(400);

const summary = page.locator('section', { hasText: 'Prochain don possible' });
await summary.locator('li', { hasText: 'Sang total' }).locator('button.quick-add').click();
await page.waitForTimeout(150);

const expectedMin = new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const minAttr = await page.locator('.dialog input[type=date]').getAttribute('min');
assert.equal(minAttr, expectedMin, `expected the date input's min to be ${expectedMin}, got "${minAttr}"`);

const maxAttr = await page.locator('.dialog input[type=date]').getAttribute('max');
const today = new Date().toISOString().slice(0, 10);
assert.equal(maxAttr, today, `expected the date input's max to still be today (${today}), got "${maxAttr}"`);

await browser.close();
console.log('OK: the quick-add date field has both a min (rule-derived) and max (today) bound.');
