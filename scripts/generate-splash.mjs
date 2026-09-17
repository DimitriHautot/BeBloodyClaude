// Generates public/splash/*.png — iOS launch-screen images — from the same
// blood-drop mark used for the app icons (scripts/lib/icon-mark.mjs).
//
// iOS ignores the web manifest for its launch screen and needs an explicit
// <link rel="apple-touch-startup-image" media="..."> per device size/pixel
// ratio/orientation (declared in index.html); without one, "Add to Home
// Screen" just flashes a plain white screen before the app's own UI paints.
// Android has no equivalent need: Chrome already synthesizes a splash from
// the manifest's `background_color` + icon on its own.
//
// The look matches that Android-synthesized splash on purpose (rather than
// inventing an iOS-only design): the manifest's background_color (white)
// filling the screen, with the app icon centered on top.
//
// Run with: node scripts/generate-splash.mjs
import { chromium } from 'playwright';
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { iconSVG } from './lib/icon-mark.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'splash');
await mkdir(outDir, { recursive: true });

// `.webmanifest` isn't a recognized JSON extension for Node's ESM loader
// (even with an import assertion), so read it as plain text instead of
// importing it.
const manifest = JSON.parse(
  await readFile(path.join(__dirname, '..', 'public', 'manifest.webmanifest'), 'utf8')
);
const BACKGROUND = manifest.background_color;

// Logical point size (`width`/`height`, portrait) and pixel ratio for each
// distinct iOS screen currently in common use. `device-width`/`device-height`
// in the matching <link media> query always use these portrait point values
// — orientation alone (see index.html) picks portrait vs landscape, per
// Apple's own convention, so there is one entry per physical screen here,
// not one per orientation.
const DEVICES = [
  { label: '375x667@2', width: 375, height: 667, ratio: 2 }, // SE (2nd/3rd gen), 6/6s/7/8
  { label: '414x736@3', width: 414, height: 736, ratio: 3 }, // 6/7/8 Plus
  { label: '375x812@3', width: 375, height: 812, ratio: 3 }, // X/XS/11 Pro, 12 mini/13 mini
  { label: '414x896@2', width: 414, height: 896, ratio: 2 }, // XR/11
  { label: '414x896@3', width: 414, height: 896, ratio: 3 }, // XS Max/11 Pro Max
  { label: '390x844@3', width: 390, height: 844, ratio: 3 }, // 12/12 Pro/13/13 Pro/14
  { label: '428x926@3', width: 428, height: 926, ratio: 3 }, // 12 Pro Max/13 Pro Max/14 Plus
  { label: '393x852@3', width: 393, height: 852, ratio: 3 }, // 14 Pro/15/15 Pro/16
  { label: '430x932@3', width: 430, height: 932, ratio: 3 } // 14 Pro Max/15 Pro Max/16 Plus
];

function splashSVG(pxWidth, pxHeight) {
  const iconSize = Math.round(Math.min(pxWidth, pxHeight) * 0.28);
  const x = Math.round((pxWidth - iconSize) / 2);
  const y = Math.round((pxHeight - iconSize) / 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${pxWidth}" height="${pxHeight}" viewBox="0 0 ${pxWidth} ${pxHeight}">
  <rect width="${pxWidth}" height="${pxHeight}" fill="${BACKGROUND}" />
  <g transform="translate(${x} ${y})">
    ${iconSVG(iconSize, 0.62)}
  </g>
</svg>`;
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();

async function renderPNG(svg, width, height, filePath) {
  await page.setViewportSize({ width, height });
  await page.setContent(`<!doctype html><html><body style="margin:0">${svg}</body></html>`);
  // `svg` alone also matches the icon mark nested inside (splashSVG embeds
  // iconSVG's own <svg>...</svg> as a child) — scope to the outer one.
  await page.locator('body > svg').screenshot({ path: filePath });
}

for (const { width, height, ratio } of DEVICES) {
  const portraitW = width * ratio;
  const portraitH = height * ratio;
  await renderPNG(
    splashSVG(portraitW, portraitH),
    portraitW,
    portraitH,
    path.join(outDir, `apple-splash-${portraitW}-${portraitH}.png`)
  );
  console.log(`wrote apple-splash-${portraitW}-${portraitH}.png`);

  // Landscape: same physical screen, dimensions swapped.
  const landscapeW = height * ratio;
  const landscapeH = width * ratio;
  await renderPNG(
    splashSVG(landscapeW, landscapeH),
    landscapeW,
    landscapeH,
    path.join(outDir, `apple-splash-${landscapeW}-${landscapeH}.png`)
  );
  console.log(`wrote apple-splash-${landscapeW}-${landscapeH}.png`);
}

await browser.close();
