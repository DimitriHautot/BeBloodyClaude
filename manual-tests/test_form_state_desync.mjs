// Requires a dev server already running at http://127.0.0.1:5176 (npx vite --port 5176).
// Reproduces the reported bug: a browser can leave a form field's visual
// state out of sync with what Svelte's bound variable thinks is selected
// (e.g. Firefox restoring previous form state after a full page reload, or
// the Firefox/Linux native <select> popup bug that motivated switching the
// donation type picker to radio buttons). Simulated here by checking a
// radio button directly via the native DOM setter, bypassing Svelte's
// binding — no change/input event fired.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto('http://127.0.0.1:5176/');
await page.waitForTimeout(400);

await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await page.locator('.dialog label:has-text("Mode debug") input[type=checkbox]').check();
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

// Check the "plasma" radio directly via the native property setter (no
// 'change'/'input' event dispatched), simulating the DOM ending up in a
// state Svelte's bound variable never learned about.
await page.evaluate(() => {
  const radios = document.querySelectorAll('input[name="donation-type"]');
  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'checked').set;
  for (const radio of radios) {
    nativeSetter.call(radio, radio.value === 'plasma');
  }
  // Deliberately NOT dispatching a change/input event here.
});

const checkedValue = await page.evaluate(
  () => document.querySelector('input[name="donation-type"]:checked')?.value
);
assert.equal(checkedValue, 'plasma', 'expected the "plasma" radio to visually show as checked');

await page.click('button[type=submit]');
await page.waitForTimeout(200);

const stored = JSON.parse(await page.evaluate(() => localStorage.getItem('donations')));
assert.equal(stored.length, 1, 'expected exactly one donation to be recorded');
assert.equal(
  stored[0].type,
  'plasma',
  `expected the recorded donation to match what was visually selected ("plasma"), got "${stored[0].type}"`
);

await browser.close();
console.log('OK: the recorded donation type matches the DOM-displayed selection, even without a change event.');
