// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);
await page.waitForTimeout(400);

// Debug-mode inline form: type fieldset above the date field.
await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await page.locator('.dialog label:has-text("Mode debug") input[type=checkbox]').check();
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

const fieldsetBox = await page.locator('main form fieldset').boundingBox();
const dateLabelBox = await page.locator('main form input[type=date]').boundingBox();
assert.ok(
  dateLabelBox.y > fieldsetBox.y + fieldsetBox.height - 5,
  `expected the date field to be below the type fieldset, got fieldset bottom=${fieldsetBox.y + fieldsetBox.height}, date y=${dateLabelBox.y}`
);

// Quick-add modal: fixed-type block above the date field too.
await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await page.locator('.dialog label:has-text("Mode debug") input[type=checkbox]').uncheck();
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

const summary = page.locator('section', { hasText: 'Prochain don possible' });
await summary.locator('li', { hasText: 'Plasma' }).locator('button.quick-add').click();
await page.waitForTimeout(150);

const fixedTypeBox = await page.locator('.dialog .fixed-type').boundingBox();
const quickDateBox = await page.locator('.dialog input[type=date]').boundingBox();
assert.ok(
  quickDateBox.y > fixedTypeBox.y + fixedTypeBox.height - 5,
  `expected the date field to be below the fixed type in the quick-add modal too`
);

await browser.close();
console.log('OK: the date field is stacked below the donation type in both form layouts.');
