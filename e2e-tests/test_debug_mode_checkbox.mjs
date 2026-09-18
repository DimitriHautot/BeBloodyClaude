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

await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);

const checkbox = page.locator('.sheet label:has-text("Mode debug") input[type=checkbox]');
assert.equal(await checkbox.count(), 1, 'expected a "Mode debug" checkbox inside the settings modal');
assert.equal(await checkbox.isChecked(), false, 'expected debug mode to be off by default');

await checkbox.check();
await page.waitForTimeout(150);
assert.equal(await checkbox.isChecked(), true, 'expected the checkbox to become checked');

// Persists across reload.
await page.reload();
await page.waitForTimeout(400);
await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
assert.equal(
  await page.locator('.sheet label:has-text("Mode debug") input[type=checkbox]').isChecked(),
  true,
  'expected debug mode to persist across a reload'
);

await browser.close();
console.log('OK: "Mode debug" checkbox is present, toggles, and persists.');
