// Requires a dev server already running at http://127.0.0.1:5176 (npx vite --port 5176).
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto('http://127.0.0.1:5176/');
await page.waitForTimeout(400);

// SettingsPanel must no longer appear in the main window.
assert.equal(
  await page.locator('main >> text=Pays (règles applicables)').count(),
  0,
  'expected SettingsPanel to not be rendered in the main window'
);
assert.equal(await page.locator('.dialog').count(), 0, 'expected no modal to be open initially');

// Open the menu, click "Paramètres".
await page.click('button:has-text("Menu")');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);

assert.equal(await page.locator('.dialog').count(), 1, 'expected the settings modal to be open');
assert.equal(
  await page.locator('.dialog >> text=Pays (règles applicables)').count(),
  1,
  'expected SettingsPanel content inside the modal'
);

// Close via Escape.
await page.keyboard.press('Escape');
await page.waitForTimeout(150);
assert.equal(await page.locator('.dialog').count(), 0, 'expected Escape to close the modal');

// Re-open, close via backdrop click.
await page.click('button:has-text("Menu")');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await page.click('.overlay', { position: { x: 5, y: 5 } });
await page.waitForTimeout(150);
assert.equal(await page.locator('.dialog').count(), 0, 'expected a backdrop click to close the modal');

await browser.close();
console.log('OK: Paramètres menu entry opens a modal with SettingsPanel; Escape and backdrop click close it.');
