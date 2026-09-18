<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  import type { DonationType } from '../lib/donations/types';
  import { donations } from '../lib/donations/storage';
  import { donorSettings, getAllowedTypes } from '../lib/settings/storage';
  import { getRuleSet } from '../lib/rules/registry';
  import { today as todayDate, formatDateLabel, toISODate, daysBetween } from '../lib/dates';
  import { t } from '../lib/i18n';

  interface QuickAddDetail {
    type: DonationType;
    /** Earliest date (ISO YYYY-MM-DD) this type could be backdated to. */
    minDate: string;
  }

  const dispatch = createEventDispatcher<{ 'quick-add': QuickAddDetail }>();

  // `todayDate()` has no reactive dependency of its own, so without this
  // tick it would only ever be evaluated once, at mount — if the app stays
  // open across a UTC midnight, `today` (and everything derived from it)
  // would silently go stale. Bumping this counter at each UTC midnight
  // forces a re-evaluation.
  let midnightTick = 0;
  let midnightTimer: ReturnType<typeof setTimeout> | undefined;

  function scheduleMidnightRefresh() {
    const now = new Date();
    const nextUTCMidnight = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0
    );
    midnightTimer = setTimeout(() => {
      midnightTick += 1;
      scheduleMidnightRefresh();
    }, nextUTCMidnight - now.getTime());
  }
  scheduleMidnightRefresh();
  onDestroy(() => clearTimeout(midnightTimer));

  /** Ignores `tick`; taking it as a parameter makes it a reactive
   * dependency so `today` (below) is re-evaluated when it changes. */
  function currentDate(tick: number): Date {
    void tick;
    return todayDate();
  }

  $: today = currentDate(midnightTick);
  $: ruleSet = getRuleSet($donorSettings.countryCode);
  $: nextDates = getAllowedTypes($donorSettings).map((type) => {
    const date = ruleSet.computeNextEligibleDate(type, $donations, $donorSettings);
    return { type, date, status: status(date, today) };
  });

  function isEligibleNow(date: Date, today: Date): boolean {
    return date.getTime() <= today.getTime();
  }

  /** 'eligible' (green, possible today), 'upcoming' (orange, possible within
   * the configured window), or 'later' (gray, beyond that window or
   * highlighting is off). */
  function status(date: Date, today: Date): 'eligible' | 'upcoming' | 'later' {
    if (isEligibleNow(date, today)) return 'eligible';
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
  <h2>{$t('summary.title')}</h2>
  <ul>
    {#each nextDates as { type, date, status }}
      <li class:eligible={status === 'eligible'} class:upcoming={status === 'upcoming'}>
        <span class="type">{$t(`donationTypes.${type}`)}</span>
        <span class="date">
          {#if status === 'eligible'}
            {$t('summary.now')}
          {:else}
            {formatDateLabel(date)}
          {/if}
        </span>
        <span class="quick-add-slot">
          {#if status === 'eligible'}
            <button
              class="quick-add"
              on:click={() => handleQuickAdd(type)}
              aria-label={$t('common.addDonationOf', { type: $t(`donationTypes.${type}`) })}
            >
              +
            </button>
          {/if}
        </span>
      </li>
    {/each}
  </ul>
</section>

<style>
  h2 {
    font-size: 1.15rem;
    font-weight: 700;
    margin: 0 0 0.75rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0 0 2rem;
    display: grid;
    gap: 0.6rem;
  }

  li {
    display: flex;
    align-items: center;
    padding: 0.9rem 1rem;
    border-radius: var(--radius-md);
    background: var(--color-surface);
    box-shadow: var(--shadow-sm);
    border-left: 0.3rem solid var(--color-border);
  }

  li.eligible {
    border-left-color: var(--color-success);
  }

  li.upcoming {
    border-left-color: var(--color-upcoming);
  }

  .type {
    font-weight: 600;
    min-width: 6rem;
    flex-shrink: 0;
  }

  .date {
    flex: 1;
    text-align: center;
    color: var(--color-text-secondary);
  }

  li.eligible .date {
    color: var(--color-success-dark);
    font-weight: 600;
  }

  li.upcoming .date {
    color: var(--color-upcoming);
    font-weight: 600;
  }

  .quick-add-slot {
    width: 1.9rem;
    flex-shrink: 0;
    margin-left: 0.5rem;
  }

  .quick-add {
    width: 1.9rem;
    height: 1.9rem;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: var(--color-success);
    color: white;
    font-size: 1.2rem;
    line-height: 1;
    cursor: pointer;
    box-shadow: var(--shadow-sm);
  }

  .quick-add:active {
    background: var(--color-success-dark);
    transform: scale(0.94);
  }
</style>
