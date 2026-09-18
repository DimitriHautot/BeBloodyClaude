// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ locale: 'fr-FR' });
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);
// Simulate a returning user (settings already chosen) so the first-launch
// settings modal does not pop up and intercept clicks meant for this test.
await page.evaluate(() => {
  localStorage.setItem('donorSettings', JSON.stringify({ countryCode: 'BE', sex: 'male' }));
});
await page.reload();
await page.waitForTimeout(400);

const mainFont = await page.locator('main').evaluate((el) => getComputedStyle(el).fontFamily);

await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);

const dialogFont = await page.locator('.sheet').evaluate((el) => getComputedStyle(el).fontFamily);

assert.equal(
  dialogFont,
  mainFont,
  `expected the settings modal to use the same font as the main window ("${mainFont}"), got "${dialogFont}"`
);
assert.match(mainFont, /system-ui/, `expected the main window to use system-ui, got "${mainFont}"`);

await browser.close();
console.log(`OK: the settings modal uses the same font as the main window ("${mainFont}").`);
