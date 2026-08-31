// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
//
// Checking "Autoriser les notifications" asks the browser for permission.
// When denied, a "Refus de l'utilisateur" toast appears and the checkbox
// ends up unchecked.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const context = await browser.newContext();
const page = await context.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});

await page.addInitScript(() => {
  Object.defineProperty(window.Notification, 'requestPermission', {
    value: () => Promise.resolve('denied'),
    configurable: true
  });
});

await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);

await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);

const checkbox = page.locator('.notifications label:has-text("Autoriser les notifications") input[type=checkbox]');
// Not .check(): that asserts the box ends up checked, but denial is
// expected to leave it unchecked, so a plain click is used instead.
await checkbox.click();
await page.waitForTimeout(150);

const toastText = await page.locator('.toast').textContent();
assert.equal(toastText, "Refus de l'utilisateur", 'expected a "Refus de l\'utilisateur" toast');

assert.equal(await checkbox.isChecked(), false, 'expected the checkbox to end up unchecked after a denial');

const notificationsEnabled = await page.evaluate(() => JSON.parse(localStorage.getItem('donorSettings'))?.notificationsEnabled);
assert.notEqual(notificationsEnabled, true, 'expected notificationsEnabled not to be persisted as true');

await browser.close();
console.log('OK: denying notification permission shows a toast and leaves the checkbox unchecked.');
