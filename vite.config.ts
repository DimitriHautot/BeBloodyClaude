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

export default defineConfig({
  plugins: [svelte({ preprocess: vitePreprocess() }), buildInfoLogger()],
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
