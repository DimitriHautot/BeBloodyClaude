// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});

// First visit ever: no donorSettings in localStorage yet.
await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);
await page.waitForTimeout(400);

assert.equal(
  await page.locator('.sheet >> text=Pays (règles applicables)').count(),
  1,
  'expected the settings modal to open automatically on first launch'
);

await page.keyboard.press('Escape');
await page.waitForTimeout(150);
assert.equal(await page.locator('.sheet').count(), 0, 'expected Escape to close the modal');

// Reloading now that settings have been persisted must not reopen it.
await page.reload();
await page.waitForTimeout(400);
assert.equal(
  await page.locator('.sheet').count(),
  0,
  'expected the settings modal to stay closed once settings have already been persisted'
);

await browser.close();
console.log('OK: the settings modal opens automatically on first launch, and stays closed afterwards.');
