// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via manual-tests/run.sh, or set the PORT env var yourself).
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});
await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);
await page.waitForTimeout(400);

await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);
await page.locator('.dialog label:has-text("Mode debug") input[type=checkbox]').check();
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

// A whole blood donation today should push plasma to +14 days and
// platelets to +28 days — not +84 days like the old conservative rule.
await page.click('button[type=submit]'); // default: blood, today
await page.waitForTimeout(200);

const expectedPlasma = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-BE', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
const expectedPlatelets = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-BE', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
const expectedBlood = new Date(Date.now() + 84 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-BE', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const summaryText = await page.locator('section', { hasText: 'Prochain don possible' }).innerText();

assert.match(
  summaryText,
  new RegExp(`Sang total\\s*\\n${expectedBlood}`),
  `expected blood next eligible on ${expectedBlood}, got:\n${summaryText}`
);
assert.match(
  summaryText,
  new RegExp(`Plasma\\s*\\n${expectedPlasma}`),
  `expected plasma next eligible on ${expectedPlasma} (14-day cross delay), got:\n${summaryText}`
);
assert.match(
  summaryText,
  new RegExp(`Plaquettes\\s*\\n${expectedPlatelets}`),
  `expected platelets next eligible on ${expectedPlatelets} (28-day cross delay), got:\n${summaryText}`
);

await browser.close();
console.log('OK: the cross-type delay matrix (blood → plasma 14d, blood → platelets 28d) is reflected in the UI.');
