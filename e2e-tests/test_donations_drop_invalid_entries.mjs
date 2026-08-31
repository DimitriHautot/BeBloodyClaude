// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
//
// A Donation can only be constructed with id, type, date and countryCode
// all present (createDonation() throws otherwise). The donations store also
// filters out any stored entry missing one of those fields when loading
// from localStorage, so tampered-with or otherwise corrupt data can't crash
// downstream code that assumes every field is present — like the country
// flag rendered per donation in DonationList (getFlag(donation.countryCode)
// used to throw on `undefined` before this fix).
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);
await page.waitForTimeout(200);

// Seed one donation missing countryCode (the exact shape that used to crash
// the page) alongside one fully valid donation.
await page.evaluate(() => {
  localStorage.setItem(
    'donations',
    JSON.stringify([
      { id: '1', type: 'blood', date: '2020-01-01' },
      { id: '2', type: 'plasma', date: '2020-06-01', countryCode: 'BE' }
    ])
  );
});
await page.reload();
await page.waitForTimeout(300);

const storedAfterLoad = await page.evaluate(() => JSON.parse(localStorage.getItem('donations')));
assert.equal(storedAfterLoad.length, 1, 'expected the invalid entry to be dropped, keeping only the valid one');
assert.equal(storedAfterLoad[0].id, '2', 'expected the valid donation to survive');

const historySection = page.locator('main section', { hasText: 'Historique' });
assert.equal(await historySection.locator('li').count(), 1, 'expected only the valid donation to be rendered');
assert.equal(await historySection.locator('li .flag').first().textContent(), '🇧🇪');

await browser.close();
console.log('OK: a donation missing a required field is dropped on load instead of crashing the app.');
