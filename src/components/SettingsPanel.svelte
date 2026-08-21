<script lang="ts">
  import { donorSettings } from '../lib/settings/storage';
  import { ruleSetRegistry } from '../lib/rules/registry';

  const countries = Object.values(ruleSetRegistry);
</script>

<section>
  <label>
    Pays (règles applicables)
    <select bind:value={$donorSettings.countryCode}>
      {#each countries as country}
        <option value={country.countryCode}>{country.countryName}</option>
      {/each}
    </select>
  </label>

  <label>
    Sexe
    <select bind:value={$donorSettings.sex}>
      <option value="male">Homme</option>
      <option value="female">Femme</option>
    </select>
  </label>
</section>

<style>
  section {
    display: flex;
    gap: 1.5rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.9rem;
  }

  select {
    padding: 0.4rem;
    font-size: 1rem;
  }
</style>
