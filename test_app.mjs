import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
page.on('pageerror', err => console.log('PAGEERROR:', err.message));
await page.goto('http://127.0.0.1:5173/');
await page.waitForTimeout(500);

console.log('--- initial next donation summary ---');
console.log(await page.locator('main').innerText());

// add a blood donation dated today
await page.selectOption('select', { label: 'Sang total' });
await page.click('button[type=submit]');
await page.waitForTimeout(300);

console.log('--- after adding blood donation today ---');
console.log(await page.locator('main').innerText());

await browser.close();
