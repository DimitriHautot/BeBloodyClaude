<script lang="ts">
  import { DONATION_TYPES, DONATION_TYPE_LABELS } from '../lib/donations/types';
  import { donations, removeDonation } from '../lib/donations/storage';
  import { formatDateLabel, parseISODate } from '../lib/dates';
  import { donorSettings } from '../lib/settings/storage';
  import { getFlag } from '../lib/flags';

  $: sortedDonations = [...$donations].sort((a, b) => b.date.localeCompare(a.date));
  $: countsByType = DONATION_TYPES.map((type) => ({
    type,
    count: $donations.filter((donation) => donation.type === type).length
  })).filter(({ count }) => count > 0);
</script>

<section>
  <h2>Historique</h2>

  {#if sortedDonations.length === 0}
    <p class="empty">Aucun don enregistré pour l'instant.</p>
  {:else}
    <p class="counts">
      <span class="counts-total">{$donations.length} don{$donations.length > 1 ? 's' : ''} au total</span>
      {#each countsByType as { type, count }}
        <span class="counts-item">{DONATION_TYPE_LABELS[type]} : {count}</span>
      {/each}
    </p>

    <ul>
      {#each sortedDonations as donation (donation.id)}
        <li>
          <span class="flag" aria-hidden="true">{getFlag(donation.countryCode)}</span>
          <span class="date">{formatDateLabel(parseISODate(donation.date))}</span>
          <span class="type">{DONATION_TYPE_LABELS[donation.type]}</span>
          {#if $donorSettings.debugMode}
            <button on:click={() => removeDonation(donation.id)} aria-label="Supprimer">✕</button>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  h2 {
    font-size: 1.15rem;
    font-weight: 700;
    margin: 0 0 0.75rem;
  }

  .empty {
    color: var(--color-text-secondary);
    background: var(--color-surface);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    padding: 1.25rem;
    text-align: center;
  }

  .counts {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem 0.75rem;
    margin: 0 0 0.75rem;
    font-size: 0.9rem;
    color: var(--color-text-secondary);
  }

  .counts-total {
    font-weight: 700;
    color: var(--color-text);
  }

  ul {
    list-style: none;
    padding: 0.25rem 1rem;
    margin: 0 0 2rem;
    background: var(--color-surface);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
  }

  li {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--color-border);
  }

  li:last-child {
    border-bottom: none;
  }

  .flag {
    font-size: 1.2rem;
  }

  .date {
    font-variant-numeric: tabular-nums;
  }

  .type {
    flex: 1;
    text-align: right;
    color: var(--color-text-secondary);
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    background: none;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    color: var(--color-text-secondary);
    font-size: 0.9rem;
  }

  button:active {
    background: var(--color-bg);
    color: var(--color-primary);
  }
</style>
