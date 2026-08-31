// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via manual-tests/run.sh, or set the PORT env var yourself).
//
// Each donation is stamped with the ISO country code of the rule set that
// was active when it was recorded (the donor's current DonorSettings.countryCode),
// so a donor's history stays meaningful if they later switch countries.
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

await page.locator('main form input[name="donation-type"][value="platelets"]').check();
await page.locator('main form input[type=date]').fill('2020-06-01');
await page.click('main form button[type=submit]');
await page.waitForTimeout(200);

const countryCode = await page.evaluate(() => {
  const stored = JSON.parse(localStorage.getItem('donations'));
  return stored[0]?.countryCode;
});
assert.equal(countryCode, 'BE', "expected the new donation to be stamped with the donor's current countryCode");

await browser.close();
console.log('OK: a new donation is stamped with the country code of the rules active when it was recorded.');
