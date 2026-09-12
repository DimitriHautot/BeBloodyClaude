<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { DONATION_TYPE_LABELS, type DonationType } from '../lib/donations/types';
  import { addDonation } from '../lib/donations/storage';
  import { donorSettings, getAllowedTypes, getSexSymbol } from '../lib/settings/storage';
  import { toISODate, today } from '../lib/dates';
  import { getFlag } from '../lib/flags';

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
      dispatch('added');
    }
  }

  // On real Firefox (both Ubuntu and Windows 11), clicking the date field —
  // neither the text portion nor the calendar icon — opens the native
  // calendar popup at all; it must be forced open via showPicker(). This
  // contradicts the assumption of an earlier version of this fix (that the
  // icon already worked natively per Mozilla bug 1804879), which turned out
  // to be wrong when actually tested by the user, so that assumption
  // (and the click-position heuristic built on it) has been dropped: call
  // showPicker() unconditionally on every click, on Firefox only (Edge and
  // Chrome already handle every click correctly on their own).
  //
  // Firefox detection via navigator.userAgent turned out unreliable in
  // practice (a privacy setting or extension in the user's real profile
  // reported a non-Firefox user agent on genuine Firefox). CSS.supports()
  // for a vendor-prefixed property queries the actual rendering engine
  // instead of a spoofable string: only Gecko (Firefox) recognizes
  // "-moz-appearance", so this can't be fooled by a UA override.
  //
  // TEMPORARY: logging every call/outcome to the console to diagnose,
  // directly from real-world testing, exactly what's failing — remove once
  // confirmed fixed.
  const isFirefox = typeof CSS !== 'undefined' && CSS.supports('-moz-appearance', 'none');

  function openDatePicker(event: MouseEvent) {
    console.log('[date-picker-debug] click', {
      isFirefox,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      offsetX: event.offsetX,
    });
    if (!isFirefox) return;
    const input = event.currentTarget as HTMLInputElement;
    if (typeof input.showPicker !== 'function') {
      console.log('[date-picker-debug] showPicker is not a function on this input');
      return;
    }
    try {
      input.showPicker();
      console.log('[date-picker-debug] showPicker() succeeded');
    } catch (err) {
      console.log('[date-picker-debug] showPicker() threw', err);
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit} bind:this={formEl}>
  <span class="donor-info" aria-hidden="true">
    <span class="country-flag">{getFlag($donorSettings.countryCode)}</span>
    <span class="sex-symbol">{getSexSymbol($donorSettings.sex)}</span>
  </span>

  {#if !fixedType}
    <h2>Ajouter un don</h2>
  {/if}

  {#if fixedType}
    <div class="fixed-type">
      <span class="fixed-type-label">Type de don</span>
      <span class="fixed-type-value">{DONATION_TYPE_LABELS[fixedType]}</span>
    </div>
  {:else}
    <fieldset>
      <legend>Type de don</legend>
      {#each allowedTypes as t}
        <label class="radio">
          <input type="radio" name="donation-type" value={t} bind:group={type} />
          {DONATION_TYPE_LABELS[t]}
        </label>
      {/each}
    </fieldset>
  {/if}

  <label>
    Date
    <input
      type="date"
      bind:value={date}
      bind:this={dateInputEl}
      autocomplete="off"
      max={toISODate(today())}
      min={minDate}
      required
      on:click={openDatePicker}
    />
  </label>

  <button type="submit">Ajouter</button>

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
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  .donor-info {
    position: absolute;
    top: 0.75rem;
    right: 1rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .country-flag {
    font-size: 1.3rem;
  }

  .sex-symbol {
    font-size: 1.1rem;
    color: #666;
  }

  h2 {
    font-size: 1.1rem;
    margin: 0 0 0.5rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.9rem;
  }

  fieldset {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    border: none;
    padding: 0;
    margin: 0;
    font-size: 0.9rem;
  }

  legend {
    padding: 0;
    margin-bottom: 0.25rem;
  }

  .radio {
    flex-direction: row;
    align-items: center;
    gap: 0.4rem;
    font-weight: normal;
  }

  .fixed-type {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.9rem;
  }

  .fixed-type-label {
    color: #666;
  }

  .fixed-type-value {
    font-weight: 600;
  }

  input[type='date'] {
    padding: 0.4rem;
    font-size: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    cursor: pointer;
  }

  .error {
    margin: 0;
    color: #c00;
    font-size: 0.9rem;
  }
</style>
