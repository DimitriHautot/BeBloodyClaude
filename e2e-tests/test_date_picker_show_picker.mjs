// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
//
// Since Firefox 109, clicking inside a native <input type="date">'s text
// area no longer opens the calendar popup on its own
// (https://bugzilla.mozilla.org/show_bug.cgi?id=1804879) — only clicking the
// calendar-icon affordance does, and that icon click already works fine on
// every browser without any help. DonationForm.svelte works around the text-
// area case by calling showPicker() explicitly on click, but only on
// Firefox and only when the click isn't on the icon — calling it more
// broadly was found (via real Firefox/Edge testing) to fight the browser's
// own native open/close toggle, causing the popup to flicker or fail to
// open depending on click parity.
//
// Chromium (used here) doesn't have the underlying bug, and the native
// popup itself isn't something Playwright can observe, so this test spoofs
// a Firefox user agent, stubs showPicker(), and asserts our code calls it
// only for a click on the text portion — not the icon area, and not at all
// under a non-Firefox user agent.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

async function countShowPickerCalls(userAgent, clickX) {
  const context = await browser.newContext({ userAgent });
  const page = await context.newPage();
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
  await dateInput.click({ position: { x: clickX, y: 10 } });
  await page.waitForTimeout(50);

  const calls = await page.evaluate(() => window.__showPickerCalls);
  await context.close();
  return calls;
}

const FIREFOX_UA =
  'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0';
const CHROME_UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const firefoxTextClick = await countShowPickerCalls(FIREFOX_UA, 5);
assert.equal(firefoxTextClick, 1, 'expected a Firefox click on the text portion to call showPicker()');

const firefoxIconClick = await countShowPickerCalls(FIREFOX_UA, 130);
assert.equal(
  firefoxIconClick,
  0,
  'expected a Firefox click on the icon area to NOT call showPicker() (the icon already toggles natively)'
);

const chromeTextClick = await countShowPickerCalls(CHROME_UA, 5);
assert.equal(
  chromeTextClick,
  0,
  'expected a non-Firefox click to never call showPicker() (Chrome/Edge already toggle correctly on their own)'
);

await browser.close();
console.log(
  'OK: showPicker() is called only for a Firefox click on the date field\'s text portion, never on the icon or on other browsers.'
);
