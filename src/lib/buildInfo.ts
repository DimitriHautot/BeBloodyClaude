/**
 * Build identity shown at the bottom of the app so a donor/tester can check
 * they're actually looking at the version they expect — useful on a PWA,
 * where an installed home-screen shortcut can silently keep serving a
 * stale cached build (see "PWA installée..." in AGENTS.md).
 *
 * `buildTime` arrives already formatted as "YYYY-MM-DD hh:mm:ss.SSS UTC"
 * from vite.config.ts (not reformatted here via toLocaleString()/Intl on
 * purpose — it must stay a fixed, locale/timezone-independent identifier).
 */
export interface BuildInfo {
  version: string;
  buildNumber: string;
  buildTime: string;
  buildType: 'debug' | 'production';
}

export const buildInfo: BuildInfo = {
  version: __APP_VERSION__,
  buildNumber: __BUILD_NUMBER__,
  buildTime: __BUILD_TIME__,
  buildType: import.meta.env.DEV ? 'debug' : 'production'
};
