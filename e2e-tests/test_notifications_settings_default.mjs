// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
//
// SettingsPanel has a new "notifications" section: a checkbox unchecked by
// default, followed by explanatory text.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);

await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);

const checkbox = page.locator('.notifications label:has-text("Autoriser les notifications") input[type=checkbox]');
assert.equal(await checkbox.isChecked(), false, 'expected the notifications checkbox to be unchecked by default');

const explanation = await page.locator('.notifications-explanation').textContent();
assert.ok(
  explanation && explanation.includes('notification') && explanation.includes('possible'),
  'expected an explanatory text mentioning notifications about donation possibility'
);

await browser.close();
console.log('OK: SettingsPanel shows the notifications checkbox (unchecked) with its explanation.');
