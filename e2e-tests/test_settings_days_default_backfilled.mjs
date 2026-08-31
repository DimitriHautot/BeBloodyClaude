// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
//
// Regression test: donorSettings stored before highlightUpcomingDays existed
// (e.g. from a pre-feature session) lacked that field entirely. persisted()
// used to return the stored object as-is, so $donorSettings.highlightUpcomingDays
// stayed undefined forever — the number input in SettingsPanel showed blank
// instead of the documented default of 14.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);

// Simulate settings persisted before highlightUpcoming/highlightUpcomingDays
// were introduced.
await page.evaluate(() => {
  localStorage.setItem('donorSettings', JSON.stringify({ countryCode: 'BE', sex: 'male', debugMode: false }));
});
await page.reload();
await page.waitForTimeout(300);

await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await page.locator('.dialog label:has-text("Mise en évidence") input[type=checkbox]').check();
await page.waitForTimeout(100);

const daysInput = page.locator('.dialog input[type=number]');
assert.equal(
  await daysInput.inputValue(),
  '14',
  'expected the days input to be backfilled with the default of 14, even though it was missing from previously-stored settings'
);

await browser.close();
console.log('OK: highlightUpcomingDays is backfilled with its default for settings stored before the field existed.');
