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

// Turn on debug mode, add a donation, then turn debug mode back off.
await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await page.locator('.dialog label:has-text("Mode debug") input[type=checkbox]').check();
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

await page.click('button[type=submit]');
await page.waitForTimeout(200);

assert.equal(
  await page.locator('section', { hasText: 'Historique' }).locator('button[aria-label="Supprimer"]').count(),
  1,
  'expected the delete button to be visible while debug mode is on'
);

await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await page.locator('.dialog label:has-text("Mode debug") input[type=checkbox]').uncheck();
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

assert.equal(
  await page.locator('section', { hasText: 'Historique' }).locator('button[aria-label="Supprimer"]').count(),
  0,
  'expected the delete button to be hidden once debug mode is off'
);
// The donation entry itself must still be shown, just without the delete button.
assert.match(
  await page.locator('section', { hasText: 'Historique' }).innerText(),
  /Sang total/,
  'expected the donation entry to remain visible in the history'
);

await browser.close();
console.log('OK: the delete button in the history is gated by the "Mode debug" setting.');
