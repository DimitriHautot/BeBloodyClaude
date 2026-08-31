// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  throw new Error(`Page error: ${err.message}`);
});

const baseURL = `http://127.0.0.1:${process.env.PORT ?? 5176}`;
await page.goto(`${baseURL}/`);
await page.waitForTimeout(200);

const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
assert.equal(manifestHref, '/manifest.webmanifest', 'expected the page to link a web manifest');

const manifestResponse = await page.request.get(`${baseURL}${manifestHref}`);
assert.equal(manifestResponse.status(), 200, 'expected the manifest to be served');
const manifest = await manifestResponse.json();

assert.equal(manifest.display, 'standalone');
assert.ok(manifest.name, 'expected a name');
assert.ok(manifest.short_name, 'expected a short_name');
assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2, 'expected at least 2 icons');

for (const icon of manifest.icons) {
  const res = await page.request.get(`${baseURL}${icon.src}`);
  assert.equal(res.status(), 200, `expected icon ${icon.src} to be served`);
  assert.equal(res.headers()['content-type'], 'image/png');
}

assert.ok(
  manifest.icons.some((icon) => icon.purpose === 'maskable'),
  'expected at least one maskable icon, for a clean crop on Android home screens'
);

const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
assert.equal(themeColor, manifest.theme_color, 'expected the <meta theme-color> to match the manifest');

const appleTouchIconHref = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
const appleIconResponse = await page.request.get(`${baseURL}${appleTouchIconHref}`);
assert.equal(appleIconResponse.status(), 200, 'expected the apple-touch-icon to be served (iOS ignores the manifest for this)');

await browser.close();
console.log('OK: the app links a valid, fully-served web manifest with standalone display and icons for Android/iOS home screens.');
