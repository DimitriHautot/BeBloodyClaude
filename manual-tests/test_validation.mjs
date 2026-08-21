import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => console.log('PAGEERROR:', err.message));
await page.goto('http://127.0.0.1:5174/');
await page.waitForTimeout(400);

// First blood donation today: should succeed.
await page.selectOption('select', { label: 'Sang total' });
await page.click('button[type=submit]');
await page.waitForTimeout(200);
console.log('--- after 1st blood donation (should succeed, no error) ---');
console.log(await page.locator('form').first().innerText());

// Second blood donation today: should be rejected (60-day rule).
await page.click('button[type=submit]');
await page.waitForTimeout(200);
console.log('--- after 2nd blood donation same day (should show error) ---');
console.log(await page.locator('form').first().innerText());

console.log('--- history (should still contain only 1 donation) ---');
console.log(await page.locator('section', { hasText: 'Historique' }).innerText());

await browser.close();
