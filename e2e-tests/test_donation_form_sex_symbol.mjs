// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
//
// DonationForm now shows the donor's sex symbol (♂/♀) next to the country
// flag, via getSexSymbol() from src/lib/settings/storage.ts.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);

// Turn on debug mode to reveal DonationForm directly.
await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await page.locator('.dialog label:has-text("Mode debug") input[type=checkbox]').check();
await page.waitForTimeout(100);

// Default sex is male.
assert.equal(await page.locator('main form .sex-symbol').textContent(), '♂', 'expected the male symbol by default');

await page.locator('.dialog label:has-text("Sexe") select').selectOption('female');
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

assert.equal(
  await page.locator('main form .sex-symbol').textContent(),
  '♀',
  'expected the female symbol after switching sex in settings'
);

await browser.close();
console.log("OK: DonationForm shows the donor's sex symbol next to the country flag.");
