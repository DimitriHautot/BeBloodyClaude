<script lang="ts">
  import AppMenu from './components/AppMenu.svelte';
  import Modal from './components/Modal.svelte';
  import DonationForm from './components/DonationForm.svelte';
  import DonationList from './components/DonationList.svelte';
  import NextDonationSummary from './components/NextDonationSummary.svelte';
  import SettingsPanel from './components/SettingsPanel.svelte';

  let showSettings = false;
</script>

<main>
  <div class="top-bar">
    <h1>Suivi des dons</h1>
    <AppMenu on:open-settings={() => (showSettings = true)} />
  </div>

  <NextDonationSummary />
  <DonationForm />
  <DonationList />
</main>

{#if showSettings}
  <Modal title="Paramètres" on:close={() => (showSettings = false)}>
    <SettingsPanel />
  </Modal>
{/if}

<style>
  main {
    max-width: 640px;
    margin: 0 auto;
    padding: 1.5rem 1rem 4rem;
    font-family: system-ui, sans-serif;
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
