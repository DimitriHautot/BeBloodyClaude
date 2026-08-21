// Requires a dev server already running at http://127.0.0.1:5175 (npx vite --port 5175).
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto('http://127.0.0.1:5175/');
await page.waitForTimeout(400);

// Scenario 1: with no history, all 3 types should show "Dès maintenant" (green).
const emptyHistoryText = await page.locator('section', { hasText: 'Prochain don possible' }).innerText();
assert.match(
  emptyHistoryText,
  /Dès maintenant/,
  `expected "Dès maintenant" to be shown when eligible today, got:\n${emptyHistoryText}`
);
assert.equal(
  await page.locator('section li.eligible').count(),
  3,
  'expected all 3 donation types to be shown as eligible (green) with an empty history'
);

// Scenario 2: Belgian rules, male donor (both are the defaults — set explicitly
// so the test doesn't silently rely on default values), then a whole blood
// donation 10 days ago.
const countrySelect = page.locator('select').nth(1);
await countrySelect.selectOption({ label: 'Belgique' });
const sexSelect = page.locator('select').nth(2);
await sexSelect.selectOption({ label: 'Homme' });

const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
await page.selectOption('form select', { label: 'Sang total' });
await page.fill('form input[type=date]', tenDaysAgo);
await page.click('button[type=submit]');
await page.waitForTimeout(200);

// Whole blood: 60-day minimum interval since the last blood donation
// (10 days ago), so eligible again in 50 days — not today.
const expectedDate = new Date(Date.now() + 50 * 24 * 60 * 60 * 1000);
const expectedDateLabel = expectedDate.toLocaleDateString('fr-BE', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const afterBloodDonationText = await page
  .locator('section', { hasText: 'Prochain don possible' })
  .innerText();

assert.match(
  afterBloodDonationText,
  new RegExp(`Sang total\\s*\\n${expectedDateLabel}`),
  `expected whole blood to be next eligible on ${expectedDateLabel}, got:\n${afterBloodDonationText}`
);

// Cross-type constraint (see CLAUDE.md): a whole blood donation conservatively
// blocks ALL other types for its own 60-day interval too, so plasma and
// platelets are also pushed to +50 days — not available today.
assert.match(
  afterBloodDonationText,
  new RegExp(`Plasma\\s*\\n${expectedDateLabel}`),
  `expected plasma to also be blocked until ${expectedDateLabel} by the cross-type constraint, got:\n${afterBloodDonationText}`
);
assert.match(
  afterBloodDonationText,
  new RegExp(`Plaquettes\\s*\\n${expectedDateLabel}`),
  `expected platelets to also be blocked until ${expectedDateLabel} by the cross-type constraint, got:\n${afterBloodDonationText}`
);
assert.equal(
  await page.locator('section li.eligible').count(),
  0,
  'expected no donation type to show as eligible (green) right after a recent whole blood donation'
);

await browser.close();
console.log('OK: empty-history "Dès maintenant", and the cross-type constraint after a recent blood donation.');
