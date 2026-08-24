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
await page.waitForTimeout(400);

await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await page.locator('.dialog label:has-text("Mode debug") input[type=checkbox]').check();
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

for (const [label, value, date] of [
  ['Plasma', 'plasma', '2026-01-05'],
  ['Plaquettes', 'platelets', '2026-02-05'],
  ['Sang total', 'blood', '2026-03-05']
]) {
  await page.click(`form label:has-text("${label}") input[type=radio]`);
  await page.fill('form input[type=date]', date);
  await page.click('button[type=submit]');
  await page.waitForTimeout(150);

  const checked = await page.evaluate(
    () => document.querySelector('input[name="donation-type"]:checked')?.value
  );
  assert.equal(checked, value, `expected the "${label}" radio to be checked after clicking it`);
}

const stored = JSON.parse(await page.evaluate(() => localStorage.getItem('donations')));
assert.deepEqual(
  stored.map((d) => d.type).sort(),
  ['blood', 'plasma', 'platelets'],
  `expected all 3 types to be recorded correctly, got: ${JSON.stringify(stored)}`
);

await browser.close();
console.log('OK: clicking each radio button records the matching donation type.');
