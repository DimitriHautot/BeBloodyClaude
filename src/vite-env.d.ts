/// <reference types="vite/client" />

// Injected at build/dev-server start time via `define` in vite.config.ts —
// see src/lib/buildInfo.ts for the formatted, app-facing version of these.
declare const __APP_VERSION__: string;
declare const __BUILD_TIME__: string;
declare const __BUILD_NUMBER__: string;
declare const __COMMIT_HASH__: string;
