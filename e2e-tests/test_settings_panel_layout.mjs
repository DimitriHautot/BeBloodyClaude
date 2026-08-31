// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
//
// SettingsPanel layout: an <hr> after the "Sexe" field, and another at the
// end of the panel with "Mode debug" placed after it (last field).
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);
await page.waitForTimeout(300);

await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);

assert.equal(await page.locator('.dialog section hr').count(), 2, 'expected 2 horizontal separators in the settings panel');

const fieldOrder = await page.locator('.dialog section > *').evaluateAll((nodes) =>
  nodes.map((n) => (n.tagName === 'HR' ? 'HR' : n.textContent?.trim().slice(0, 30)))
);

assert.equal(fieldOrder[fieldOrder.length - 1], 'Mode debug', 'expected "Mode debug" to be the last field in the panel');
assert.equal(fieldOrder[fieldOrder.length - 2], 'HR', 'expected the last separator to sit right before "Mode debug"');

const sexeIndex = fieldOrder.findIndex((label) => label?.startsWith('Sexe'));
assert.equal(fieldOrder[sexeIndex + 1], 'HR', 'expected a separator right after the "Sexe" field');

await browser.close();
console.log('OK: SettingsPanel has the expected separators, with "Mode debug" moved to the end.');
