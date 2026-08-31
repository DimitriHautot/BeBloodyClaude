// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
//
// Each row in the donation history now shows the flag of the country whose
// rules governed that donation (donation.countryCode), via getFlag() from
// src/lib/flags.ts.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);

await page.evaluate(() => {
  localStorage.setItem(
    'donations',
    JSON.stringify([{ id: '1', type: 'blood', date: '2020-01-01', countryCode: 'BE' }])
  );
});
await page.reload();
await page.waitForTimeout(300);

const flagText = await page.locator('main ul li .flag').first().textContent();
assert.equal(flagText, '🇧🇪', 'expected the donation row to show the Belgian flag for countryCode "BE"');

await browser.close();
console.log('OK: each donation history row shows the flag of the country whose rules governed it.');
