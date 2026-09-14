import { defineConfig, type Plugin } from 'vite';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import pkg from './package.json';

// Computed once per `vite`/`vite build` process invocation, not per request:
// exactly what's needed to tell two builds/deploys apart at a glance (see
// "Comment vérifier la version déployée" in AGENTS.md).
const buildTime = new Date().toISOString();
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
        `\n[BeBloody] version ${pkg.version} · build ${buildNumber} · ${buildTime} · ${buildType}\n`
      );
    }
  };
}

export default defineConfig({
  plugins: [svelte({ preprocess: vitePreprocess() }), buildInfoLogger()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIME__: JSON.stringify(buildTime),
    __BUILD_NUMBER__: JSON.stringify(buildNumber)
  },
  test: {
    environment: 'node'
  }
});
