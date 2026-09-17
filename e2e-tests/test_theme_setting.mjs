// Requires a dev server already running at http://127.0.0.1:$PORT (defaults
// to 5176; run via e2e-tests/run.sh, or set the PORT env var yourself).
//
// Settings > Thème (Système/Clair/Sombre): defaults to "Système", persists
// across reloads without a flash of the wrong theme, and an explicit
// Clair/Sombre choice overrides the system's own color-scheme preference —
// both for the rendered palette and for <meta name="theme-color">.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const baseURL = `http://127.0.0.1:${process.env.PORT ?? 5176}`;

const LIGHT_BG = 'rgb(244, 243, 246)';
const DARK_BG = 'rgb(18, 18, 20)';
const LIGHT_THEME_COLOR = '#c0392b';
const DARK_THEME_COLOR = '#e2574a';

async function openSettings(page) {
  await page.click('button[aria-label="Menu"]');
  await page.click('button:has-text("Paramètres")');
  await page.waitForTimeout(150);
}

async function bodyBackground(page) {
  return page.evaluate(() => getComputedStyle(document.body).backgroundColor);
}

async function themeColor(page) {
  return page.locator('meta[name="theme-color"]').getAttribute('content');
}

// Default: no stored theme (a returning user from before this setting
// existed) is backfilled to "Système" and simply follows the system.
{
  const page = await browser.newPage({ colorScheme: 'light' });
  page.on('pageerror', (err) => {
    throw new Error(`Page error: ${err.message}`);
  });
  await page.goto(`${baseURL}/`);
  await page.evaluate(() => {
    localStorage.setItem('donorSettings', JSON.stringify({ countryCode: 'BE', sex: 'male' }));
  });
  await page.reload();
  await page.waitForTimeout(300);

  assert.equal(
    await page.evaluate(() => document.documentElement.getAttribute('data-theme')),
    null,
    'expected no data-theme override for a donor who never chose one'
  );
  assert.equal(await bodyBackground(page), LIGHT_BG, 'expected the light palette to apply under a light system preference');
  assert.equal(await themeColor(page), LIGHT_THEME_COLOR, 'expected the light theme-color under a light system preference');

  await openSettings(page);
  const select = page.locator('.sheet label:has-text("Thème") select');
  assert.equal(await select.count(), 1, 'expected a "Thème" select inside the settings modal');
  assert.equal(await select.inputValue(), 'system', 'expected "Système" to be selected by default');
  await page.close();
}

// Choosing "Sombre" sets data-theme, switches the rendered colors, and
// persists across a reload (checked before waitForTimeout, since the
// whole point of the inline script in index.html is to apply it before
// the app itself has had a chance to run).
{
  const page = await browser.newPage({ colorScheme: 'light' });
  page.on('pageerror', (err) => {
    throw new Error(`Page error: ${err.message}`);
  });
  await page.goto(`${baseURL}/`);
  await page.evaluate(() => {
    localStorage.setItem('donorSettings', JSON.stringify({ countryCode: 'BE', sex: 'male' }));
  });
  await page.reload();
  await page.waitForTimeout(300);

  await openSettings(page);
  await page.locator('.sheet label:has-text("Thème") select').selectOption('dark');
  await page.waitForTimeout(150);

  assert.equal(
    await page.evaluate(() => document.documentElement.getAttribute('data-theme')),
    'dark',
    'expected data-theme="dark" right after choosing "Sombre"'
  );
  assert.equal(await bodyBackground(page), DARK_BG, 'expected the dark palette to apply once "Sombre" is chosen');
  assert.equal(await themeColor(page), DARK_THEME_COLOR, 'expected the dark theme-color once "Sombre" is chosen');

  await page.reload();
  assert.equal(
    await page.evaluate(() => document.documentElement.getAttribute('data-theme')),
    'dark',
    'expected the inline anti-flash script to re-apply data-theme="dark" immediately on reload'
  );
  assert.equal(
    await themeColor(page),
    DARK_THEME_COLOR,
    'expected the inline anti-flash script to also re-apply the dark theme-color immediately on reload'
  );
  await page.waitForTimeout(300);
  await openSettings(page);
  assert.equal(
    await page.locator('.sheet label:has-text("Thème") select').inputValue(),
    'dark',
    'expected "Sombre" to still be selected after a reload'
  );
  await page.close();
}

// An explicit "Clair" choice overrides a dark system preference, and
// "Système" goes back to following it.
{
  const page = await browser.newPage({ colorScheme: 'dark' });
  page.on('pageerror', (err) => {
    throw new Error(`Page error: ${err.message}`);
  });
  await page.goto(`${baseURL}/`);
  await page.evaluate(() => {
    localStorage.setItem('donorSettings', JSON.stringify({ countryCode: 'BE', sex: 'male' }));
  });
  await page.reload();
  await page.waitForTimeout(300);

  assert.equal(await bodyBackground(page), DARK_BG, 'expected "Système" to follow a dark system preference');
  assert.equal(await themeColor(page), DARK_THEME_COLOR, 'expected the dark theme-color under a dark system preference');

  await openSettings(page);
  await page.locator('.sheet label:has-text("Thème") select').selectOption('light');
  await page.waitForTimeout(150);
  assert.equal(await bodyBackground(page), LIGHT_BG, 'expected "Clair" to override a dark system preference');
  assert.equal(await themeColor(page), LIGHT_THEME_COLOR, 'expected "Clair" to also override the theme-color');

  await page.locator('.sheet label:has-text("Thème") select').selectOption('system');
  await page.waitForTimeout(150);
  assert.equal(
    await page.evaluate(() => document.documentElement.getAttribute('data-theme')),
    null,
    'expected switching back to "Système" to remove the data-theme override'
  );
  assert.equal(await bodyBackground(page), DARK_BG, 'expected "Système" to follow the (still dark) system preference again');
  assert.equal(await themeColor(page), DARK_THEME_COLOR, 'expected "Système" to also follow it for the theme-color');

  // The theme-color meta is JS-managed (unlike the CSS palette, which a
  // plain media query keeps live on its own), so a live system-preference
  // change while following "Système" needs its own check that the
  // matchMedia listener in App.svelte actually re-applies it.
  await page.emulateMedia({ colorScheme: 'light' });
  await page.waitForTimeout(150);
  assert.equal(await themeColor(page), LIGHT_THEME_COLOR, 'expected the theme-color to follow a live system preference change');

  await page.close();
}

await browser.close();
console.log('OK: the "Thème" setting (palette and theme-color alike) defaults to "Système", persists without a flash, Clair/Sombre override the system preference, and "Système" tracks a live system preference change.');
