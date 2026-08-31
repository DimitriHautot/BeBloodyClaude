<script lang="ts">
  import { donorSettings, getAllowedTypes, getAllowedTypesRecord } from '../lib/settings/storage';
  import { ruleSetRegistry } from '../lib/rules/registry';
  import { DONATION_TYPES, DONATION_TYPE_LABELS, type DonationType } from '../lib/donations/types';

  const countries = Object.values(ruleSetRegistry);

  $: allowedCount = getAllowedTypes($donorSettings).length;

  function toggleAllowedType(type: DonationType, checked: boolean) {
    // Refuse to uncheck the last remaining type: with none allowed, nothing
    // could ever be shown in NextDonationSummary or added via DonationForm,
    // and there'd be no way back to a working state short of clearing
    // localStorage.
    if (!checked && allowedCount <= 1) return;

    donorSettings.update((settings) => ({
      ...settings,
      allowedDonationTypes: { ...getAllowedTypesRecord(settings), [type]: checked }
    }));
  }
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

  <hr />

  <div class="allowed-types">
    <span class="allowed-types-legend">Types de dons possibles</span>
    {#each DONATION_TYPES as type}
      {@const checked = $donorSettings.allowedDonationTypes?.[type] ?? true}
      <label class="checkbox">
        <input
          type="checkbox"
          {checked}
          disabled={checked && allowedCount <= 1}
          on:change={(event) => toggleAllowedType(type, event.currentTarget.checked)}
        />
        {DONATION_TYPE_LABELS[type]}
      </label>
    {/each}
  </div>

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

  <hr />

  <label class="checkbox">
    <input type="checkbox" bind:checked={$donorSettings.debugMode} />
    Mode debug
  </label>
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

  .allowed-types {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .allowed-types-legend {
    font-size: 0.9rem;
  }

  hr {
    width: 100%;
    border: none;
    border-top: 1px solid #eee;
    margin: 0;
  }
</style>
