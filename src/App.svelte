<script lang="ts">
  import DonationForm from './components/DonationForm.svelte';
  import DonationList from './components/DonationList.svelte';
  import NextDonationSummary from './components/NextDonationSummary.svelte';
  import SettingsPanel from './components/SettingsPanel.svelte';
</script>

<main>
  <h1>Suivi des dons</h1>

  <NextDonationSummary />
  <DonationForm />
  <DonationList />
  <SettingsPanel />
</main>

<style>
  main {
    max-width: 640px;
    margin: 0 auto;
    padding: 1.5rem 1rem 4rem;
    font-family: system-ui, sans-serif;
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
</style>
