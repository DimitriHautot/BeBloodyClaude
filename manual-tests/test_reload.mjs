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
await page.waitForTimeout(300);

await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await page.locator('.dialog label:has-text("Mode debug") input[type=checkbox]').check();
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

await page.click('form label:has-text("Plasma") input[type=radio]');
await page.click('button[type=submit]');
await page.waitForTimeout(200);

const beforeReload = await page.locator('main').innerText();
assert.match(beforeReload, /Plasma/, `expected the new plasma donation in the history before reload, got:\n${beforeReload}`);

await page.reload();
await page.waitForTimeout(300);

const afterReload = await page.locator('main').innerText();
assert.match(afterReload, /Plasma/, `expected the plasma donation to persist across reload, got:\n${afterReload}`);

await browser.close();
console.log('OK: a submitted donation persists in localStorage and survives a page reload.');
