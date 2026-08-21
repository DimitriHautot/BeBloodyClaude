<script lang="ts">
  import { DONATION_TYPES, DONATION_TYPE_LABELS } from '../lib/donations/types';
  import { donations } from '../lib/donations/storage';
  import { donorSettings } from '../lib/settings/storage';
  import { getRuleSet } from '../lib/rules/registry';

  $: ruleSet = getRuleSet($donorSettings.countryCode);
  $: today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00');
  $: nextDates = DONATION_TYPES.map((type) => ({
    type,
    date: ruleSet.computeNextEligibleDate(type, $donations, $donorSettings)
  }));

  function formatDate(date: Date): string {
    return date.toLocaleDateString('fr-BE', { year: 'numeric', month: 'long', day: 'numeric' });
  }

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
            {formatDate(date)}
          {/if}
        </span>
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
</style>
