<script lang="ts">
  import AppMenu from './components/AppMenu.svelte';
  import Modal from './components/Modal.svelte';
  import DonationForm from './components/DonationForm.svelte';
  import DonationList from './components/DonationList.svelte';
  import NextDonationSummary from './components/NextDonationSummary.svelte';
  import SettingsPanel from './components/SettingsPanel.svelte';
  import ReferencesPanel from './components/ReferencesPanel.svelte';
  import { donorSettings, getAllowedTypes, isFirstLaunch } from './lib/settings/storage';
  import { DONATION_TYPE_LABELS, type DonationType } from './lib/donations/types';
  import { buildInfo } from './lib/buildInfo';

  // First time the app is opened, show the settings modal right away so the
  // donor can set their country/sex before using the app.
  let showSettings = isFirstLaunch;
  let showReferences = false;
  let quickAddType: DonationType | null = null;
  let quickAddMinDate: string | null = null;

  function closeQuickAdd() {
    quickAddType = null;
    quickAddMinDate = null;
  }

  // With a single donation type allowed, there's no useful "choice" left, so
  // the debug-mode form (when shown) is fixed to it instead of offering a
  // free selection.
  $: allowedTypes = getAllowedTypes($donorSettings);
  $: soleAllowedType = allowedTypes.length === 1 ? allowedTypes[0] : null;
</script>

<main>
  <div class="top-bar">
    <h1>BeBloody</h1>
    <AppMenu
      on:open-settings={() => (showSettings = true)}
      on:open-references={() => (showReferences = true)}
    />
  </div>

  <NextDonationSummary
    on:quick-add={(event) => {
      quickAddType = event.detail.type;
      quickAddMinDate = event.detail.minDate;
    }}
  />
  {#if $donorSettings.debugMode}
    <DonationForm fixedType={soleAllowedType} />
  {/if}
  <DonationList />

  <footer>
    v{buildInfo.version} · build {buildInfo.buildNumber} · {buildInfo.buildTime} · {buildInfo.buildType}
  </footer>
</main>

{#if showSettings}
  <Modal title="Paramètres" on:close={() => (showSettings = false)}>
    <SettingsPanel />
  </Modal>
{/if}

{#if showReferences}
  <Modal title="Références" on:close={() => (showReferences = false)}>
    <ReferencesPanel />
  </Modal>
{/if}

{#if quickAddType && quickAddMinDate}
  <Modal
    title={`Ajouter un don de ${DONATION_TYPE_LABELS[quickAddType].toLowerCase()}`}
    on:close={closeQuickAdd}
  >
    <DonationForm fixedType={quickAddType} minDate={quickAddMinDate} on:added={closeQuickAdd} />
  </Modal>
{/if}

<style>
  /* No px font-size here on purpose: leaving the root at the browser's
     default (100%) is what lets `rem` sizes throughout the app follow the
     device's own text-size/accessibility setting instead of a fixed size
     we'd be imposing. Never override this with a px value. */
  :global(html) {
    font-size: 100%;
  }

  /* Shared design tokens, used across every component via `var(...)`. Kept
     here rather than duplicated per-component so the whole app's look can
     be tuned from one place. */
  :global(:root) {
    --color-primary: #c0392b;
    --color-primary-dark: #a53125;
    --color-success: #2e8b57;
    --color-success-dark: #256e46;
    --color-upcoming: #d97706;
    --color-bg: #f4f3f6;
    --color-surface: #ffffff;
    --color-border: #eceaef;
    --color-text: #1c1c1e;
    --color-text-secondary: #6e6e76;
    --radius-sm: 0.6rem;
    --radius-md: 1rem;
    --radius-lg: 1.375rem;
    --shadow-sm: 0 1px 2px rgba(20, 20, 30, 0.04), 0 1px 1px rgba(20, 20, 30, 0.03);
    --shadow-lg: 0 -8px 32px rgba(20, 20, 30, 0.16);
  }

  :global(body) {
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    background: var(--color-bg);
    color: var(--color-text);
  }

  main {
    max-width: 640px;
    margin: 0 auto;
    /* Keep content clear of notches/home indicators when installed as a
       standalone iOS/Android PWA (viewport-fit=cover in index.html makes
       these env() vars non-zero on devices with safe-area insets). */
    padding: calc(1.5rem + env(safe-area-inset-top)) calc(1rem + env(safe-area-inset-right))
      calc(4rem + env(safe-area-inset-bottom)) calc(1rem + env(safe-area-inset-left));
  }

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.75rem;
  }

  h1 {
    font-size: 1.85rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--color-primary);
    margin: 0;
  }

  footer {
    margin-top: 2.5rem;
    padding-top: 1rem;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    text-align: center;
    opacity: 0.7;
  }
</style>
