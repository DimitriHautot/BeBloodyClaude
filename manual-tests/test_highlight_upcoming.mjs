// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);
await page.waitForTimeout(200);

// Seed a blood donation from 74 days ago: blood->blood is 84 days, so next
// eligible blood is in 10 days — inside a 14-day highlight window (orange),
// but outside e.g. a 5-day window (gray).
const seventyFourDaysAgo = new Date(Date.now() - 74 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
await page.evaluate((date) => {
  localStorage.setItem('donations', JSON.stringify([{ id: '1', type: 'blood', date }]));
}, seventyFourDaysAgo);
await page.reload();
await page.waitForTimeout(400);

const summary = page.locator('section', { hasText: 'Prochain don possible' });
const bloodRow = summary.locator('li', { hasText: 'Sang total' });

// Highlighting off by default: row should be neither eligible (green) nor
// upcoming (orange) — just the default gray.
assert.equal(await bloodRow.evaluate((el) => el.classList.contains('eligible')), false);
assert.equal(await bloodRow.evaluate((el) => el.classList.contains('upcoming')), false);

// Enable highlighting with the default 14-day window via Settings.
await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await page.locator('.dialog label:has-text("Mise en évidence") input[type=checkbox]').check();
await page.waitForTimeout(100);

const daysInput = page.locator('.dialog input[type=number]');
assert.equal(await daysInput.inputValue(), '14', 'expected the default window to be 14 days');
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

assert.equal(
  await bloodRow.evaluate((el) => el.classList.contains('upcoming')),
  true,
  'expected the blood row to be highlighted orange (eligible in 10 days, within the 14-day window)'
);

// Narrow the window to 5 days: 10 days > 5, so it should fall back to gray.
await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await daysInput.fill('5');
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

assert.equal(await bloodRow.evaluate((el) => el.classList.contains('upcoming')), false);
assert.equal(await bloodRow.evaluate((el) => el.classList.contains('eligible')), false);

await browser.close();
console.log('OK: NextDonationSummary highlights upcoming-soon types in orange based on the configurable window.');
