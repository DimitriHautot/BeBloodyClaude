<script lang="ts">
  import AppMenu from './components/AppMenu.svelte';
  import Modal from './components/Modal.svelte';
  import DonationForm from './components/DonationForm.svelte';
  import DonationList from './components/DonationList.svelte';
  import NextDonationSummary from './components/NextDonationSummary.svelte';
  import SettingsPanel from './components/SettingsPanel.svelte';
  import { donorSettings } from './lib/settings/storage';
  import { DONATION_TYPE_LABELS, type DonationType } from './lib/donations/types';

  let showSettings = false;
  let quickAddType: DonationType | null = null;
</script>

<main>
  <div class="top-bar">
    <h1>Suivi des dons</h1>
    <AppMenu on:open-settings={() => (showSettings = true)} />
  </div>

  <NextDonationSummary on:quick-add={(event) => (quickAddType = event.detail)} />
  {#if $donorSettings.debugMode}
    <DonationForm />
  {/if}
  <DonationList />
</main>

{#if showSettings}
  <Modal title="Paramètres" on:close={() => (showSettings = false)}>
    <SettingsPanel />
  </Modal>
{/if}

{#if quickAddType}
  <Modal title={`Ajouter un don de ${DONATION_TYPE_LABELS[quickAddType]}`} on:close={() => (quickAddType = null)}>
    <DonationForm fixedType={quickAddType} on:added={() => (quickAddType = null)} />
  </Modal>
{/if}

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
