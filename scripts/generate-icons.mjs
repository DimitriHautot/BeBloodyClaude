// Regenerates public/icons/*.png and public/favicon.png from the inline SVG
// blood-drop mark below, using Playwright as a headless SVG-to-PNG renderer
// (no ImageMagick/rsvg-convert/sharp available in this environment).
//
// Run with: node scripts/generate-icons.mjs
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { iconSVG } from './lib/icon-mark.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'icons');
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();

async function renderPNG(svg, size, filePath) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<!doctype html><html><body style="margin:0">${svg}</body></html>`
  );
  await page.locator('svg').screenshot({ path: filePath });
}

const targets = [
  { file: 'icon-192.png', size: 192, dropScale: 0.62 },
  { file: 'icon-512.png', size: 512, dropScale: 0.62 },
  { file: 'icon-maskable-512.png', size: 512, dropScale: 0.42 }
];

for (const { file, size, dropScale } of targets) {
  await renderPNG(iconSVG(size, dropScale), size, path.join(outDir, file));
  console.log(`wrote ${file}`);
}

const publicDir = path.join(__dirname, '..', 'public');

// apple-touch-icon.png must live at the site ROOT, not just be referenced by
// <link rel="apple-touch-icon"> in index.html: iOS/iPadOS (and third-party
// browsers using Apple's "Add to Home Screen" APIs, e.g. Firefox since iOS
// 16.4) also probe this well-known path directly, by convention, the same
// way /favicon.ico is probed — independently of whatever the HTML declares.
await renderPNG(iconSVG(180, 0.62), 180, path.join(publicDir, 'apple-touch-icon.png'));
console.log('wrote apple-touch-icon.png');

// Plain favicon (browser tab), same mark. Kept at 192px rather than a small
// tab-icon size (e.g. 48px): some mobile browsers (notably Firefox on iOS)
// use this favicon — not apple-touch-icon or the web manifest — for their
// "Add to Home Screen" icon, and fall back to a generated letter icon if it's
// too small to use there.
await renderPNG(iconSVG(192, 0.62), 192, path.join(publicDir, 'favicon.png'));
console.log('wrote favicon.png');

await browser.close();
