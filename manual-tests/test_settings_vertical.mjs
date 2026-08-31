// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);
await page.waitForTimeout(400);
await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);

const labels = page.locator('.dialog section > label');
const count = await labels.count();
assert.equal(count, 3, `expected 3 settings labels, got ${count}`);

const boxes = [];
for (let i = 0; i < count; i++) {
  boxes.push(await labels.nth(i).boundingBox());
}

for (let i = 1; i < boxes.length; i++) {
  assert.ok(
    boxes[i].y > boxes[i - 1].y + boxes[i - 1].height - 5,
    `expected label ${i} to be below label ${i - 1} (vertical stacking), got y=${boxes[i].y} vs previous bottom=${boxes[i - 1].y + boxes[i - 1].height}`
  );
}

await browser.close();
console.log('OK: the 3 settings are stacked vertically.');
