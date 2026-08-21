// Requires a dev server already running at http://127.0.0.1:5176 (npx vite --port 5176).
// Reproduces the reported Firefox bug: a browser can restore a <select>'s
// displayed value (e.g. after a page reload restores previous form state)
// WITHOUT firing a `change` event, leaving Svelte's bound state stale while
// the DOM shows something different. Simulated here by setting the select's
// value directly via the native DOM setter, bypassing Svelte's binding.
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
await page.locator('.dialog input[type=checkbox]').check();
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

// Set the select's DOM value to "plasma" using the native property setter
// directly (no 'change'/'input' event dispatched), simulating a browser
// silently restoring form state without going through user interaction.
await page.evaluate(() => {
  const select = document.querySelector('form select');
  const nativeSetter = Object.getOwnPropertyDescriptor(
    window.HTMLSelectElement.prototype,
    'value'
  ).set;
  nativeSetter.call(select, 'plasma');
  // Deliberately NOT dispatching a change/input event here.
});

const displayedValue = await page.locator('form select').inputValue();
assert.equal(displayedValue, 'plasma', 'expected the select to visually show "plasma"');

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
