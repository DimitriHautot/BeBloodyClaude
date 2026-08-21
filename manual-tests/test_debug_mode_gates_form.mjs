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

// Debug mode off by default: DonationForm must not be in the main window.
assert.equal(
  await page.locator('main form').count(),
  0,
  'expected DonationForm to be hidden when debug mode is off'
);

// Turn debug mode on via Settings.
await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await page.locator('.dialog input[type=checkbox]').check();
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

assert.equal(
  await page.locator('main form').count(),
  1,
  'expected DonationForm to appear once debug mode is on'
);

// Turn it back off: form should disappear again.
await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await page.locator('.dialog input[type=checkbox]').uncheck();
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

assert.equal(
  await page.locator('main form').count(),
  0,
  'expected DonationForm to be hidden again once debug mode is turned off'
);

await browser.close();
console.log('OK: DonationForm is gated by the "Mode debug" setting.');
