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

  <label class="checkbox">
    <input type="checkbox" bind:checked={$donorSettings.debugMode} />
    Mode debug
  </label>

  <div class="highlight-upcoming">
    <label class="checkbox">
      <input type="checkbox" bind:checked={$donorSettings.highlightUpcoming} />
      Mise en évidence des dons bientôt possibles
    </label>

    {#if $donorSettings.highlightUpcoming}
      <label>
        Nombre de jours avant le don possible
        <input type="number" min="1" step="1" bind:value={$donorSettings.highlightUpcomingDays} />
      </label>
    {/if}
  </div>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.9rem;
  }

  select,
  input[type='number'] {
    padding: 0.4rem;
    font-size: 1rem;
  }

  input[type='number'] {
    width: 5rem;
  }

  .checkbox {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  .highlight-upcoming {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #eee;
  }
</style>
