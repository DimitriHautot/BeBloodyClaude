// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ locale: 'fr-FR' });
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);
// Simulate a returning user (settings already chosen) so the first-launch
// settings modal does not pop up and intercept clicks meant for this test.
await page.evaluate(() => {
  localStorage.setItem('donorSettings', JSON.stringify({ countryCode: 'BE', sex: 'male' }));
});
await page.reload();
await page.waitForTimeout(400);

// With an empty history all 3 types are eligible now, so all 3 "+" buttons show.
const summary = page.locator('section', { hasText: 'Prochain don possible' });
assert.equal(await summary.locator('button.quick-add').count(), 3, 'expected a "+" button for each eligible type');

// Click the Plasma "+" button.
const plasmaRow = summary.locator('li', { hasText: 'Plasma' });
await plasmaRow.locator('button.quick-add').click();
await page.waitForTimeout(150);

assert.equal(await page.locator('.sheet').count(), 1, 'expected the quick-add modal to open');
assert.match(
  await page.locator('.sheet h2').innerText(),
  // App.svelte deliberately lowercases the type name here (French sentence
  // case: only the sentence's first letter is capitalized).
  /Ajouter un don de plasma/,
  'expected the modal title to name the fixed type'
);

// The type must be shown but not be an editable radio group.
assert.equal(
  await page.locator('.sheet input[name="donation-type"]').count(),
  0,
  'expected no type radio buttons in the quick-add form (type is fixed)'
);
assert.match(await page.locator('.sheet .fixed-type-value').innerText(), /Plasma/);

// The date defaults to today but is editable — set it to yesterday.
const dateInput = page.locator('.sheet input[type=date]');
const todayISO = new Date().toISOString().slice(0, 10);
assert.equal(await dateInput.inputValue(), todayISO, 'expected the date to default to today');

const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
await dateInput.fill(yesterday);
await page.click('.sheet button[type=submit]');
await page.waitForTimeout(200);

// A successful add should close the modal automatically.
assert.equal(await page.locator('.sheet').count(), 0, 'expected the modal to close after a successful add');

const stored = JSON.parse(await page.evaluate(() => localStorage.getItem('donations')));
assert.equal(stored.length, 1);
assert.equal(stored[0].type, 'plasma');
assert.equal(stored[0].date, yesterday);

await browser.close();
console.log('OK: the "+" quick-add button opens a modal with a fixed type and an editable, validated date.');
