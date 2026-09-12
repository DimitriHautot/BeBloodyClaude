// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
//
// On Firefox, clicking the date field — text portion or calendar icon
// alike — doesn't reliably open the native calendar popup on its own; it
// must be forced open via showPicker(). Edge/Chrome already handle every
// click correctly without help. DonationForm.svelte therefore calls
// showPicker() on every click, gated to Firefox only, detected via
// CSS.supports('-moz-appearance', 'none') rather than navigator.userAgent —
// a UA string is unreliable (some privacy settings/extensions override it),
// whereas CSS.supports queries the actual rendering engine and can't be
// spoofed the same way. Confirmed fixed on the app's actual target
// (Firefox on a real iPhone) — desktop DevTools device emulation doesn't
// faithfully reproduce a native date input's real behavior.
//
// Chromium (used here) doesn't support -moz-appearance and doesn't have the
// underlying bug, and the native popup itself isn't something Playwright
// can observe, so this test stubs CSS.supports() to simulate Firefox vs.
// Chrome and asserts our code calls showPicker() for every click only in
// the simulated-Firefox case.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

async function countShowPickerCalls(simulateFirefox) {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('pageerror', (err) => {
    throw new Error(`Page error: ${err.message}`);
  });

  await page.addInitScript((simulateFirefox) => {
    window.__showPickerCalls = 0;
    HTMLInputElement.prototype.showPicker = function () {
      window.__showPickerCalls += 1;
    };
    const realSupports = CSS.supports.bind(CSS);
    CSS.supports = (...args) => {
      if (args[0] === '-moz-appearance') return simulateFirefox;
      return realSupports(...args);
    };
  }, simulateFirefox);

  await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);
  await page.waitForTimeout(400);

  const summary = page.locator('section', { hasText: 'Prochain don possible' });
  await summary.locator('li', { hasText: 'Plasma' }).locator('button.quick-add').click();
  await page.waitForTimeout(150);

  const dateInput = page.locator('.dialog input[type=date]');
  await dateInput.click();
  await page.waitForTimeout(50);

  const calls = await page.evaluate(() => window.__showPickerCalls);
  await context.close();
  return calls;
}

const firefoxClick = await countShowPickerCalls(true);
assert.equal(firefoxClick, 1, 'expected a simulated-Firefox click on the date field to call showPicker()');

const chromeClick = await countShowPickerCalls(false);
assert.equal(
  chromeClick,
  0,
  'expected a non-Firefox click to never call showPicker() (Chrome/Edge already handle it on their own)'
);

await browser.close();
console.log('OK: showPicker() is called on every click when the engine is detected as Firefox, and never otherwise.');
