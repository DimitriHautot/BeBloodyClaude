// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
//
// DonationForm now shows the flag of the donor's currently selected country
// (DonorSettings.countryCode) in the frame's top-right corner, via getFlag()
// from src/lib/flags.ts.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);

// Turn on debug mode to reveal DonationForm directly.
await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await page.locator('.dialog label:has-text("Mode debug") input[type=checkbox]').check();
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

const flagText = await page.locator('main form .country-flag').textContent();
assert.equal(flagText, '🇧🇪', 'expected the form to show the Belgian flag for the default countryCode "BE"');

const box = await page.locator('main form .country-flag').boundingBox();
const formBox = await page.locator('main form').boundingBox();
assert.ok(
  box.x + box.width > formBox.x + formBox.width - 40,
  'expected the flag to sit in the top-right corner of the form'
);
assert.ok(box.y - formBox.y < 40, 'expected the flag to sit in the top-right corner of the form');

await browser.close();
console.log("OK: DonationForm shows the donor's current country flag in its top-right corner.");
