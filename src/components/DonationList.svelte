<script lang="ts">
  import { DONATION_TYPE_LABELS } from '../lib/donations/types';
  import { donations, removeDonation } from '../lib/donations/storage';
  import { formatDateLabel, parseISODate } from '../lib/dates';
  import { donorSettings } from '../lib/settings/storage';

  $: sortedDonations = [...$donations].sort((a, b) => b.date.localeCompare(a.date));
</script>

<section>
  <h2>Historique</h2>

  {#if sortedDonations.length === 0}
    <p class="empty">Aucun don enregistré pour l'instant.</p>
  {:else}
    <ul>
      {#each sortedDonations as donation (donation.id)}
        <li>
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
