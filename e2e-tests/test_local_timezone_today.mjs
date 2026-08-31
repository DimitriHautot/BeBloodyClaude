// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
//
// Regression test for the reported bug: a donor in Belgium at 00:12 local
// time on 2026-08-25 (CEST, UTC+2 — so still 2026-08-24T22:12:00Z) saw a
// plasma donation eligible "today" shown as orange (upcoming) instead of
// green (eligible), because today() used the UTC calendar day (still
// 2026-08-24) instead of the donor's local calendar day (already
// 2026-08-25).
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const context = await browser.newContext({ timezoneId: 'Europe/Brussels' });
const page = await context.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});

// 2026-08-25T00:12:00 in Europe/Brussels (CEST, UTC+2) = 2026-08-24T22:12:00Z.
await page.clock.install({ time: new Date('2026-08-24T22:12:00.000Z') });

// Plasma->plasma delay is 14 days: a plasma donation 14 days before the
// donor's local "today" (2026-08-25) makes plasma eligible exactly today.
await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);
await page.evaluate(() => {
  localStorage.setItem('donations', JSON.stringify([{ id: '1', type: 'plasma', date: '2026-08-11', countryCode: 'BE' }]));
});
await page.reload();
await page.waitForTimeout(300);

// Enable highlighting (default 14-day window), matching the reported setup.
await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await page.locator('.dialog label:has-text("Mise en évidence") input[type=checkbox]').check();
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

const summary = page.locator('section', { hasText: 'Prochain don possible' });
const plasmaRow = summary.locator('li', { hasText: 'Plasma' });

assert.equal(
  await plasmaRow.evaluate((el) => el.classList.contains('eligible')),
  true,
  'expected plasma to show eligible (green) for a Brussels donor whose local day is already the eligible date, even though it is still the previous day in UTC'
);
assert.equal(await plasmaRow.evaluate((el) => el.classList.contains('upcoming')), false);
assert.match(await plasmaRow.innerText(), /Dès maintenant/);

await browser.close();
console.log('OK: today() uses the donor\'s local calendar day, not the UTC one, for eligibility display.');
