/**
 * Build identity shown at the bottom of the app so a donor/tester can check
 * they're actually looking at the version they expect — useful on a PWA,
 * where an installed home-screen shortcut can silently keep serving a
 * stale cached build (see "PWA installée..." in AGENTS.md).
 */
export interface BuildInfo {
  version: string;
  buildNumber: string;
  buildTime: string;
  buildType: 'debug' | 'production';
}

const BUILD_TIME_FORMATTER = new Intl.DateTimeFormat('fr-BE', {
  dateStyle: 'medium',
  timeStyle: 'medium'
});

export const buildInfo: BuildInfo = {
  version: __APP_VERSION__,
  buildNumber: __BUILD_NUMBER__,
  buildTime: BUILD_TIME_FORMATTER.format(new Date(__BUILD_TIME__)),
  buildType: import.meta.env.DEV ? 'debug' : 'production'
};
