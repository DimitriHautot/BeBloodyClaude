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

  :global(body) {
    font-family: system-ui, sans-serif;
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
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 1.5rem;
    margin: 0;
  }

  footer {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
    font-size: 0.75rem;
    color: #999;
    text-align: center;
  }
</style>
