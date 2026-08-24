<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { DONATION_TYPES, DONATION_TYPE_LABELS, type DonationType } from '../lib/donations/types';
  import { donations } from '../lib/donations/storage';
  import { donorSettings } from '../lib/settings/storage';
  import { getRuleSet } from '../lib/rules/registry';
  import { today as todayDate, formatDateLabel } from '../lib/dates';

  const dispatch = createEventDispatcher<{ 'quick-add': DonationType }>();

  $: ruleSet = getRuleSet($donorSettings.countryCode);
  $: today = todayDate();
  $: nextDates = DONATION_TYPES.map((type) => ({
    type,
    date: ruleSet.computeNextEligibleDate(type, $donations, $donorSettings)
  }));

  function isEligibleNow(date: Date): boolean {
    return date.getTime() <= today.getTime();
  }
</script>

<section>
  <h2>Prochain don possible</h2>
  <ul>
    {#each nextDates as { type, date }}
      <li class:eligible={isEligibleNow(date)}>
        <span class="type">{DONATION_TYPE_LABELS[type]}</span>
        <span class="date">
          {#if isEligibleNow(date)}
            Dès maintenant
          {:else}
            {formatDateLabel(date)}
          {/if}
        </span>
        {#if isEligibleNow(date)}
          <button
            class="quick-add"
            on:click={() => dispatch('quick-add', type)}
            aria-label={`Ajouter un don de ${DONATION_TYPE_LABELS[type]}`}
          >
            +
          </button>
        {/if}
      </li>
    {/each}
  </ul>
</section>

<style>
  h2 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0 0 2rem;
    display: grid;
    gap: 0.5rem;
  }

  li {
    display: flex;
    justify-content: space-between;
    padding: 0.6rem 0.75rem;
    border-radius: 6px;
    background: #f5f5f5;
  }

  li.eligible {
    background: #e6f6ea;
  }

  .type {
    font-weight: 600;
  }

  .quick-add {
    width: 1.6rem;
    height: 1.6rem;
    padding: 0;
    margin-left: 0.5rem;
    border: none;
    border-radius: 50%;
    background: #2e8b57;
    color: white;
    font-size: 1.1rem;
    line-height: 1;
    cursor: pointer;
  }

  .quick-add:hover {
    background: #256e46;
  }
</style>
