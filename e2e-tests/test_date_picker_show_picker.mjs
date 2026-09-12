// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
//
// Since Firefox 109, clicking inside a native <input type="date">'s text
// area no longer opens the calendar popup on its own
// (https://bugzilla.mozilla.org/show_bug.cgi?id=1804879) — only clicking the
// calendar-icon affordance does. DonationForm.svelte works around this by
// calling showPicker() explicitly on click. Chromium (used here) doesn't
// have the bug, and the native popup itself isn't something Playwright can
// observe, so this test instead stubs showPicker() and asserts our code
// calls it when the date field is clicked.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});

await page.addInitScript(() => {
  window.__showPickerCalls = 0;
  HTMLInputElement.prototype.showPicker = function () {
    window.__showPickerCalls += 1;
  };
});

await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);
await page.waitForTimeout(400);

const summary = page.locator('section', { hasText: 'Prochain don possible' });
await summary.locator('li', { hasText: 'Plasma' }).locator('button.quick-add').click();
await page.waitForTimeout(150);

const dateInput = page.locator('.dialog input[type=date]');
assert.equal(await dateInput.count(), 1, 'expected a date field in the quick-add modal');

await dateInput.click();
await page.waitForTimeout(50);

const calls = await page.evaluate(() => window.__showPickerCalls);
assert.equal(calls, 1, 'expected clicking the date field to call showPicker()');

await browser.close();
console.log('OK: clicking the date field calls showPicker(), working around Firefox 109+ not opening the calendar on click.');
