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
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  .empty {
    color: #666;
  }

  .counts {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 0.75rem;
    margin: 0 0 1rem;
    font-size: 0.9rem;
    color: #333;
  }

  .counts-total {
    font-weight: 600;
  }

  .counts-item {
    color: #666;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0 0 2rem;
  }

  li {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
  }

  .flag {
    font-size: 1.1rem;
  }

  .date {
    font-variant-numeric: tabular-nums;
  }

  .type {
    flex: 1;
    text-align: right;
    color: #333;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    color: #999;
    font-size: 1rem;
  }

  button:hover {
    color: #c00;
  }
</style>
