<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { DonationType } from '../lib/donations/types';
  import { addDonation } from '../lib/donations/storage';
  import { donorSettings, getAllowedTypes, getSexSymbol } from '../lib/settings/storage';
  import { toISODate, today } from '../lib/dates';
  import { getFlag } from '../lib/flags';
  import { hapticTick } from '../lib/haptics';
  import { t } from '../lib/i18n';

  /** When set, the donation type is fixed to this value and not user-editable
   * (used by the "+" quick-add shortcut from NextDonationSummary). */
  export let fixedType: DonationType | null = null;
  /** Earliest date (ISO YYYY-MM-DD) selectable in the date field, i.e. the
   * lower bound complementing the upper bound (today — a donation can't be
   * in the future). Optional so the form still works without it. */
  export let minDate: string | null = null;

  const dispatch = createEventDispatcher<{ added: void }>();

  $: allowedTypes = getAllowedTypes($donorSettings);

  let type: DonationType = fixedType ?? getAllowedTypes($donorSettings)[0];
  let date = toISODate(today());
  let error: string | null = null;
  let formEl: HTMLFormElement;
  let dateInputEl: HTMLInputElement;

  function handleSubmit() {
    // Read the live DOM values rather than trusting the bound variables:
    // a browser can restore a form field's value (e.g. after a full page
    // reload restores previous form state) without firing a change event,
    // which would leave Svelte's bound state stale and silently out of
    // sync with what's actually displayed on screen. The donation type
    // uses radio buttons rather than a <select> — a native <select>'s
    // dropdown popup was found to be unreliable on Firefox/Linux (WSL),
    // where the element's own value could fail to update to match what
    // was visually selected.
    const checkedRadio = formEl.querySelector<HTMLInputElement>('input[name="donation-type"]:checked');
    const currentType = fixedType ?? ((checkedRadio?.value ?? type) as DonationType);
    const currentDate = dateInputEl.value;

    const result = addDonation({ type: currentType, date: currentDate }, $donorSettings);
    error = result.allowed ? null : (result.reason ?? null);
    if (result.allowed) {
      hapticTick();
      dispatch('added');
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit} bind:this={formEl}>
  <span class="donor-info" aria-hidden="true">
    <span class="country-flag">{getFlag($donorSettings.countryCode)}</span>
    <span class="sex-symbol">{getSexSymbol($donorSettings.sex)}</span>
  </span>

  {#if !fixedType}
    <h2>{$t('form.addDonation')}</h2>
  {/if}

  {#if fixedType}
    <div class="fixed-type">
      <span class="fixed-type-label">{$t('form.donationType')}</span>
      <span class="fixed-type-value">{$t(`donationTypes.${fixedType}`)}</span>
    </div>
  {:else}
    <fieldset>
      <legend>{$t('form.donationType')}</legend>
      {#each allowedTypes as donationType}
        <label class="radio">
          <input type="radio" name="donation-type" value={donationType} bind:group={type} />
          {$t(`donationTypes.${donationType}`)}
        </label>
      {/each}
    </fieldset>
  {/if}

  <label>
    {$t('form.date')}
    <input
      type="date"
      bind:value={date}
      bind:this={dateInputEl}
      autocomplete="off"
      max={toISODate(today())}
      min={minDate}
      required
    />
  </label>

  <button type="submit">{$t('form.submit')}</button>

  {#if error}
    <p class="error">{error}</p>
  {/if}
</form>

<style>
  form {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 1.25rem;
    background: var(--color-surface);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
  }

  .donor-info {
    position: absolute;
    top: 0.75rem;
    right: 1rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .country-flag,
  .sex-symbol {
    /* iOS (Firefox & Safari) renders these glyphs with extra leading
     * below the character, which pushes them down relative to text
     * rendered with `line-height: normal` even under flex
     * `align-items: center` — pin the line box to the glyph itself so
     * both platforms center identically. */
    line-height: 1;
  }

  .country-flag {
    font-size: 1.3rem;
  }

  .sex-symbol {
    font-size: 1.1rem;
    color: var(--color-text-secondary);
  }

  h2 {
    font-size: 1.15rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    width: 100%;
  }

  fieldset {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    border: none;
    padding: 0;
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-text-secondary);
  }

  legend {
    padding: 0;
    margin-bottom: 0.25rem;
  }

  .radio {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    font-weight: normal;
    color: var(--color-text);
  }

  .fixed-type {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.9rem;
  }

  .fixed-type-label {
    color: var(--color-text-secondary);
  }

  .fixed-type-value {
    font-weight: 600;
  }

  input[type='date'] {
    padding: 0.65rem 0.75rem;
    font-size: 1rem;
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-bg);
  }

  button[type='submit'] {
    align-self: stretch;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
  }

  button[type='submit']:active {
    background: var(--color-primary-dark);
  }

  .error {
    margin: 0;
    color: var(--color-primary);
    font-size: 0.9rem;
  }
</style>
