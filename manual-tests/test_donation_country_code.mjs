// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via manual-tests/run.sh, or set the PORT env var yourself).
//
// Each donation now carries the ISO country code of the rule set that was
// active when it was recorded, so a donor's history stays meaningful even
// if they later switch countries. This checks two things:
//   1. A newly-added donation is stamped with the donor's current
//      countryCode.
//   2. A donation stored before this field existed (pre-feature shape) is
//      backfilled with 'BE', the only country this app has ever supported
//      until now, rather than left undefined.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);

await page.evaluate(() => {
  localStorage.setItem('donations', JSON.stringify([{ id: 'legacy', type: 'blood', date: '2020-01-01' }]));
});
await page.reload();
await page.waitForTimeout(300);

const legacyCountryCode = await page.evaluate(() => {
  const stored = JSON.parse(localStorage.getItem('donations'));
  return stored[0].countryCode;
});
assert.equal(legacyCountryCode, 'BE', 'expected a pre-feature donation to be backfilled with countryCode "BE"');

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

const newDonationCountryCode = await page.evaluate(() => {
  const stored = JSON.parse(localStorage.getItem('donations'));
  return stored.find((d) => d.id !== 'legacy')?.countryCode;
});
assert.equal(newDonationCountryCode, 'BE', "expected a newly-added donation to be stamped with the donor's current countryCode");

await browser.close();
console.log('OK: donations carry the country code of the rules active when they were recorded, with backfill for legacy entries.');
