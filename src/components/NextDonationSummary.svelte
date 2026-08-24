<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { DONATION_TYPES, DONATION_TYPE_LABELS, type DonationType } from '../lib/donations/types';
  import { donations } from '../lib/donations/storage';
  import { donorSettings } from '../lib/settings/storage';
  import { getRuleSet } from '../lib/rules/registry';
  import { today as todayDate, formatDateLabel, toISODate, daysBetween } from '../lib/dates';

  interface QuickAddDetail {
    type: DonationType;
    /** Earliest date (ISO YYYY-MM-DD) this type could be backdated to. */
    minDate: string;
  }

  const dispatch = createEventDispatcher<{ 'quick-add': QuickAddDetail }>();

  $: ruleSet = getRuleSet($donorSettings.countryCode);
  $: today = todayDate();
  $: nextDates = DONATION_TYPES.map((type) => {
    const date = ruleSet.computeNextEligibleDate(type, $donations, $donorSettings);
    return { type, date, status: status(date) };
  });

  function isEligibleNow(date: Date): boolean {
    return date.getTime() <= today.getTime();
  }

  /** 'eligible' (green, possible today), 'upcoming' (orange, possible within
   * the configured window), or 'later' (gray, beyond that window or
   * highlighting is off). */
  function status(date: Date): 'eligible' | 'upcoming' | 'later' {
    if (isEligibleNow(date)) return 'eligible';
    if ($donorSettings.highlightUpcoming) {
      const windowDays = $donorSettings.highlightUpcomingDays ?? 14;
      const daysUntil = daysBetween(today, date);
      if (daysUntil >= 1 && daysUntil <= windowDays) return 'upcoming';
    }
    return 'later';
  }

  function handleQuickAdd(type: DonationType) {
    const minDate = toISODate(ruleSet.earliestPossibleDate(type, $donations, $donorSettings));
    dispatch('quick-add', { type, minDate });
  }
</script>

<section>
  <h2>Prochain don possible</h2>
  <ul>
    {#each nextDates as { type, date, status }}
      <li class:eligible={status === 'eligible'} class:upcoming={status === 'upcoming'}>
        <span class="type">{DONATION_TYPE_LABELS[type]}</span>
        <span class="date">
          {#if status === 'eligible'}
            Dès maintenant
          {:else}
            {formatDateLabel(date)}
          {/if}
        </span>
        {#if status === 'eligible'}
          <button
            class="quick-add"
            on:click={() => handleQuickAdd(type)}
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

  li.upcoming {
    background: #fbe6cf;
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
