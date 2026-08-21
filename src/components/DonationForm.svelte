<script lang="ts">
  import { DONATION_TYPES, DONATION_TYPE_LABELS, type DonationType } from '../lib/donations/types';
  import { addDonation } from '../lib/donations/storage';

  let type: DonationType = 'blood';
  let date = new Date().toISOString().slice(0, 10);

  function handleSubmit() {
    addDonation({
      id: crypto.randomUUID(),
      type,
      date
    });
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <h2>Ajouter un don</h2>

  <label>
    Type de don
    <select bind:value={type}>
      {#each DONATION_TYPES as t}
        <option value={t}>{DONATION_TYPE_LABELS[t]}</option>
      {/each}
    </select>
  </label>

  <label>
    Date
    <input type="date" bind:value={date} required />
  </label>

  <button type="submit">Ajouter</button>
</form>

<style>
  form {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  h2 {
    flex-basis: 100%;
    font-size: 1.1rem;
    margin: 0 0 0.5rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.9rem;
  }

  select,
  input {
    padding: 0.4rem;
    font-size: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    cursor: pointer;
  }
</style>
