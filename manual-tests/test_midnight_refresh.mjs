// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via manual-tests/run.sh, or set the PORT env var yourself).
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});

// Pin the browser clock to just before UTC midnight.
const pinnedTime = new Date('2026-08-24T23:58:30.000Z');
await page.clock.install({ time: pinnedTime });

// Blood->blood delay is 84 days: a blood donation 83 days before the pinned
// "today" makes the next eligible blood donation exactly tomorrow (not
// eligible yet pre-midnight, eligible right after).
const eightyThreeDaysAgo = new Date(pinnedTime.getTime() - 83 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);

await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);
await page.evaluate((date) => {
  localStorage.setItem('donations', JSON.stringify([{ id: '1', type: 'blood', date }]));
}, eightyThreeDaysAgo);
await page.reload();
await page.waitForTimeout(300);

const summary = page.locator('section', { hasText: 'Prochain don possible' });
const bloodRow = summary.locator('li', { hasText: 'Sang total' });

assert.equal(
  await bloodRow.evaluate((el) => el.classList.contains('eligible')),
  false,
  'expected the blood row not to be eligible yet, just before midnight'
);

// Cross UTC midnight: fast-forward past it so the app's scheduled
// setTimeout (see NextDonationSummary's scheduleMidnightRefresh) fires.
await page.clock.fastForward('00:02:00');
await page.waitForTimeout(200);

assert.equal(
  await bloodRow.evaluate((el) => el.classList.contains('eligible')),
  true,
  'expected the blood row to become eligible right after the app crosses UTC midnight, without a reload'
);

await browser.close();
console.log(
  'OK: NextDonationSummary re-evaluates eligibility when the app is left open across UTC midnight.'
);
