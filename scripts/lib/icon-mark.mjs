// The blood-drop mark shared by scripts/generate-icons.mjs (app icons) and
// scripts/generate-splash.mjs (iOS launch screens), kept in one place so
// both always render the exact same drop rather than two copies drifting
// apart. Side-effect-free on purpose (no file I/O, no browser launch) so
// importing it never triggers icon/splash generation as a side effect.
export const RED = '#c0392b';
export const WHITE = '#ffffff';

/**
 * A simple blood-drop mark, in a solid-colour square.
 * `dropScale` controls how much of the square the drop fills — kept smaller
 * for maskable icons so the drop survives an aggressive circular crop (the
 * "safe zone" is roughly the central 80% of a maskable icon).
 */
export function iconSVG(size, dropScale) {
  const w = 24;
  const h = 24;
  const dropPath = 'M12 2C8 8 4 12.5 4 16.5A8 8 0 0 0 20 16.5C20 12.5 16 8 12 2Z';
  const scale = (size / w) * dropScale;
  const offset = (size - w * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${RED}" />
  <g transform="translate(${offset} ${offset}) scale(${scale})">
    <path d="${dropPath}" fill="${WHITE}" />
  </g>
</svg>`;
}
