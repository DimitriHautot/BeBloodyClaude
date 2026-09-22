import { defineConfig, type Plugin } from 'vite';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { execSync } from 'node:child_process';
import pkg from './package.json';

/** Short hash of the commit this build was made from — lets a deployed
 * build be traced back to the exact commit (see CHANGELOG.md, which
 * records this same short hash once a PR is merged to `main`). Falls back
 * to "unknown" rather than failing the build, e.g. in an environment
 * without a `.git` directory (some deploy pipelines only copy `dist/`). */
function getCommitHash(): string {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
}

const commitHash = getCommitHash();

// Computed once per `vite`/`vite build` process invocation, not per request:
// exactly what's needed to tell two builds/deploys apart at a glance (see
// "Comment vérifier la version déployée" in AGENTS.md).
//
// Formatted as a fixed "YYYY-MM-DD hh:mm:ss.SSS UTC" instead of via
// toLocaleString()/Intl.DateTimeFormat on purpose: this is a build/deploy
// identifier meant to be compared byte-for-byte across devices and CI logs,
// so it must not vary with the machine's or browser's locale/timezone.
function formatBuildTime(date: Date): string {
  const iso = date.toISOString(); // YYYY-MM-DDTHH:mm:ss.sssZ
  return `${iso.slice(0, 10)} ${iso.slice(11, 23)} UTC`;
}

const buildTime = formatBuildTime(new Date());
const buildNumber = String(Date.now());

/** Prints the same build identity baked into the app so it's visible in CI/deploy logs too. */
function buildInfoLogger(): Plugin {
  return {
    name: 'build-info-logger',
    configResolved(config) {
      // Skip for `vitest`/`svelte-check`, which also resolve this config but
      // aren't the "npm run dev"/"npm run build" commands this is for.
      if (config.mode === 'test') return;
      const buildType = config.command === 'serve' ? 'debug' : 'production';
      console.log(
        `\n[BeBloody] version ${pkg.version} (${commitHash}) · build ${buildNumber} · ${buildTime} · ${buildType}\n`
      );
    }
  };
}

/**
 * Serves/emits `/version.json`, carrying the same build identity as
 * `buildInfo.ts` (embedded in the JS bundle via `define` below). The app
 * (`src/lib/version/updateCheck.ts`) polls this file with a `no-store`
 * fetch and compares `buildNumber` against the one baked into the bundle
 * it's currently running, to detect that a newer build was deployed while
 * the PWA was open — see "PWA installée (standalone) et cache" in
 * AGENTS.md, which this file is also covered by (must not be served with a
 * long `Cache-Control`, or the update check would just keep re-reading a
 * stale cached copy).
 *
 * Served dynamically in dev (`configureServer`) rather than as a static
 * `public/version.json`, since a checked-in file couldn't carry a
 * different `buildNumber` per build/dev-server start. Emitted as a build
 * output asset (`generateBundle`) for `npm run build`, alongside the
 * hashed `assets/*` files but — unlike them — at a stable, unhashed path,
 * since the app needs to know where to fetch it from ahead of time.
 */
function versionJsonPlugin(): Plugin {
  const versionInfo = { version: pkg.version, commitHash, buildNumber, buildTime };
  const body = JSON.stringify(versionInfo);
  return {
    name: 'version-json',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== '/version.json') return next();
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(body);
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: body });
    }
  };
}

export default defineConfig({
  plugins: [svelte({ preprocess: vitePreprocess() }), buildInfoLogger(), versionJsonPlugin()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIME__: JSON.stringify(buildTime),
    __BUILD_NUMBER__: JSON.stringify(buildNumber),
    __COMMIT_HASH__: JSON.stringify(commitHash)
  },
  test: {
    environment: 'node'
  }
});
