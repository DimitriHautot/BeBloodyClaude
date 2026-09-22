import { writable, type Writable } from 'svelte/store';
import { buildInfo } from '../buildInfo';

/** Shape of `/version.json`, emitted by the `versionJsonPlugin` in `vite.config.ts` — see the comment there for why it exists and how it's served. */
export interface VersionInfo {
  version: string;
  commitHash: string;
  buildNumber: string;
  buildTime: string;
}

/** True once a fetched `/version.json` reports a different build than the one currently running — drives `UpdateBanner.svelte`. */
export const updateAvailable: Writable<boolean> = writable(false);

/**
 * Pure comparison, kept separate from `checkForUpdate` so it can be unit
 * tested without mocking `fetch`. `buildNumber` is `Date.now()` at build
 * time (see `vite.config.ts`), so any difference — not just "newer" —
 * means a different build was deployed.
 */
export function isNewerBuild(currentBuildNumber: string, fetchedBuildNumber: string): boolean {
  return fetchedBuildNumber !== currentBuildNumber;
}

const VERSION_URL = '/version.json';

/**
 * Fetches `/version.json` and flips `updateAvailable` on if it reports a
 * different build. `cache: 'no-store'` skips the browser's HTTP cache
 * entirely (the point of this check is to see past it); a CDN/host still
 * serving a stale copy despite that is a hosting-side cache-header issue,
 * same caveat as `index.html`/`manifest.webmanifest` in AGENTS.md.
 *
 * Fails silently (offline, network hiccup, or the file missing entirely in
 * an environment that doesn't run the Vite dev middleware) — this is a
 * best-effort background check, retried on the next scheduled call, never
 * something worth surfacing as an error to the donor.
 */
export async function checkForUpdate(): Promise<void> {
  try {
    const response = await fetch(VERSION_URL, { cache: 'no-store' });
    if (!response.ok) return;
    const info = (await response.json()) as Partial<VersionInfo>;
    if (info.buildNumber && isNewerBuild(buildInfo.buildNumber, info.buildNumber)) {
      updateAvailable.set(true);
    }
  } catch {
    // See doc comment above — silently skip, next scheduled check retries.
  }
}

const CHECK_INTERVAL_MS = 15 * 60 * 1000;

/**
 * Starts polling for a newer deployed build: once immediately, then every
 * `CHECK_INTERVAL_MS` and whenever the tab/PWA regains foreground — the
 * moment a donor is most likely to actually see and act on the banner.
 * Call once from `App.svelte`'s `onMount`; returns a cleanup function for
 * its `onDestroy`.
 */
export function startUpdateChecks(): () => void {
  checkForUpdate();
  const interval = setInterval(checkForUpdate, CHECK_INTERVAL_MS);
  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') checkForUpdate();
  };
  document.addEventListener('visibilitychange', onVisibilityChange);
  return () => {
    clearInterval(interval);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}
