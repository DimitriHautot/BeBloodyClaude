<script lang="ts">
  import { onDestroy } from 'svelte';
  import AppMenu from './components/AppMenu.svelte';
  import Modal from './components/Modal.svelte';
  import DonationForm from './components/DonationForm.svelte';
  import DonationList from './components/DonationList.svelte';
  import NextDonationSummary from './components/NextDonationSummary.svelte';
  import SettingsPanel from './components/SettingsPanel.svelte';
  import Toast from './components/Toast.svelte';
  import { donorSettings, getAllowedTypes } from './lib/settings/storage';
  import { DONATION_TYPE_LABELS, type DonationType } from './lib/donations/types';
  import {
    hasNotificationPermission,
    notificationsSupported,
    registerNotificationsServiceWorker,
    runDailyCheckIfDue
  } from './lib/notifications/runner';
  import { scheduleDailyChecks, isPast8amLocal } from './lib/notifications/scheduler';

  let showSettings = false;
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

  // Runs the daily 8am notification check for as long as the app stays open
  // (see scheduler.ts for why this can't reliably run while the app is
  // closed, absent a backend to push a wake-up) — active only once the
  // donor has opted in AND the browser actually granted permission (it can
  // be revoked externally after the donor enabled it, e.g. via browser
  // site settings).
  let cancelScheduler: (() => void) | null = null;

  $: notificationsActive = notificationsSupported() && $donorSettings.notificationsEnabled && hasNotificationPermission();

  $: if (notificationsActive) {
    startNotifications();
  } else {
    stopNotifications();
  }

  function startNotifications() {
    if (cancelScheduler) return;
    registerNotificationsServiceWorker();
    if (isPast8amLocal(new Date())) {
      // Catches a check that was still due for today but missed because the
      // app wasn't open at 8am — scheduleDailyChecks below only fires while
      // the app stays open across that moment.
      runDailyCheckIfDue();
    }
    cancelScheduler = scheduleDailyChecks(runDailyCheckIfDue);
  }

  function stopNotifications() {
    cancelScheduler?.();
    cancelScheduler = null;
  }

  onDestroy(stopNotifications);
</script>

<main>
  <div class="top-bar">
    <h1>Suivi des dons</h1>
    <AppMenu on:open-settings={() => (showSettings = true)} />
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
</main>

{#if showSettings}
  <Modal title="Paramètres" on:close={() => (showSettings = false)}>
    <SettingsPanel />
  </Modal>
{/if}

{#if quickAddType && quickAddMinDate}
  <Modal title={`Ajouter un don de ${DONATION_TYPE_LABELS[quickAddType]}`} on:close={closeQuickAdd}>
    <DonationForm fixedType={quickAddType} minDate={quickAddMinDate} on:added={closeQuickAdd} />
  </Modal>
{/if}

<Toast />

<style>
  :global(body) {
    font-family: system-ui, sans-serif;
  }

  main {
    max-width: 640px;
    margin: 0 auto;
    padding: 1.5rem 1rem 4rem;
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
</style>
