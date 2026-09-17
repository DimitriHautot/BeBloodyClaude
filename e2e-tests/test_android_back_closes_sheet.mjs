// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
//
// On Android (and with Chrome's edge-swipe back gesture), there is no
// visible close button on an open sheet — the OS expects its own back
// control to dismiss it instead of navigating the PWA away. BottomSheet.svelte
// pushes a history entry while a sheet is open so that `page.goBack()`
// (which is what that back control ultimately triggers, via `popstate`)
// closes it instead of leaving the app.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
const startUrl = `http://127.0.0.1:${process.env.PORT ?? 5176}/`;
await page.goto(startUrl);
// Simulate a returning user so the first-launch settings modal doesn't pop
// up on its own.
await page.evaluate(() => {
  localStorage.setItem('donorSettings', JSON.stringify({ countryCode: 'BE', sex: 'male' }));
});
await page.reload();
await page.waitForTimeout(300);

assert.equal(await page.locator('[role="dialog"]').count(), 0, 'expected no sheet open initially');

// The app menu itself is a BottomSheet with no Modal wrapper around it.
await page.click('button[aria-label="Menu"]');
await page.waitForTimeout(150);
assert.equal(await page.locator('[role="dialog"]').count(), 1, 'expected the app menu to be open');

await page.goBack();
await page.waitForTimeout(200);
assert.equal(await page.locator('[role="dialog"]').count(), 0, 'expected back to close the app menu');
assert.equal(page.url(), startUrl, 'expected back to close the sheet, not navigate away from the app');

// A Modal (Settings) is a BottomSheet wrapped with header/content chrome.
await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
assert.equal(await page.locator('[role="dialog"]').count(), 1, 'expected the settings modal to be open');

await page.goBack();
await page.waitForTimeout(200);
assert.equal(await page.locator('[role="dialog"]').count(), 0, 'expected back to close the settings modal');
assert.equal(page.url(), startUrl, 'expected back to close the modal, not navigate away from the app');

// The history entry must be reusable: opening and closing another sheet
// afterwards (via Escape this time) should still behave normally.
await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await page.keyboard.press('Escape');
await page.waitForTimeout(150);
assert.equal(
  await page.locator('[role="dialog"]').count(),
  0,
  'expected Escape to still close a sheet normally after a prior back-button close'
);

// Switching straight from one sheet to another (AppMenu -> Settings, in the
// same tick) must not leave an extra history entry behind: a single back
// press from there should close Settings and land back on the app, not on
// the app menu.
await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await page.goBack();
await page.waitForTimeout(200);
assert.equal(
  await page.locator('[role="dialog"]').count(),
  0,
  'expected a single back press to fully close a sheet reached via a same-tick swap'
);
assert.equal(page.url(), startUrl, 'expected a single back press not to leave a stray history entry');

await browser.close();
console.log(
  'OK: the Android/browser back button closes an open sheet (app menu and modal alike) instead of navigating away.'
);
