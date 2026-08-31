// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
//
// Checking "Autoriser les notifications" asks the browser for permission.
// When granted, the setting is persisted as enabled.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const context = await browser.newContext();
const page = await context.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});

// Stub the permission prompt to resolve as granted, deterministically —
// real browser permission-prompt automation is flaky/inconsistent across
// engines, and this is what the app itself branches on.
await page.addInitScript(() => {
  Object.defineProperty(window.Notification, 'requestPermission', {
    value: () => Promise.resolve('granted'),
    configurable: true
  });
});

await page.goto(`http://127.0.0.1:${process.env.PORT ?? 5176}/`);

await page.click('button[aria-label="Menu"]');
await page.click('button:has-text("Paramètres")');
await page.waitForTimeout(150);

const checkbox = page.locator('.notifications label:has-text("Autoriser les notifications") input[type=checkbox]');
await checkbox.check();
await page.waitForTimeout(150);

assert.equal(await checkbox.isChecked(), true, 'expected the checkbox to stay checked once permission is granted');

const notificationsEnabled = await page.evaluate(() => JSON.parse(localStorage.getItem('donorSettings')).notificationsEnabled);
assert.equal(notificationsEnabled, true, 'expected notificationsEnabled to be persisted as true');

await browser.close();
console.log('OK: granting notification permission checks the box and persists the setting.');
