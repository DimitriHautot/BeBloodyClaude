// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 375, height: 700 } });
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);
await page.waitForTimeout(400);

await page.click('button[aria-label="Menu"]');
await page.waitForTimeout(150);

const menuBox = await page.locator('.menu').boundingBox();
const mainBox = await page.locator('main').boundingBox();
assert.ok(menuBox && mainBox, 'expected both the dropdown and main to be visible');

assert.ok(
  menuBox.x >= mainBox.x - 1,
  `expected the dropdown's left edge (${menuBox.x}) to stay within main's left edge (${mainBox.x})`
);
assert.ok(
  menuBox.x + menuBox.width <= mainBox.x + mainBox.width + 1,
  `expected the dropdown's right edge (${menuBox.x + menuBox.width}) to stay within main's right edge (${mainBox.x + mainBox.width})`
);

await browser.close();
console.log('OK: the dropdown menu stays within the same safe margin as the main window on a narrow viewport.');
