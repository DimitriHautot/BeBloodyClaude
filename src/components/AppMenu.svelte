<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import BottomSheet from './BottomSheet.svelte';

  const dispatch = createEventDispatcher<{
    'open-settings': void;
    'open-references': void;
    'open-about': void;
  }>();

  let open = false;

  function toggle() {
    open = !open;
  }

  function close() {
    open = false;
  }

  function openSettings() {
    open = false;
    dispatch('open-settings');
  }

  function openReferences() {
    open = false;
    dispatch('open-references');
  }

  function openAbout() {
    open = false;
    dispatch('open-about');
  }
</script>

<button class="menu-button" on:click={toggle} aria-haspopup="true" aria-expanded={open} aria-label="Menu">
  <span class="bar" />
  <span class="bar" />
  <span class="bar" />
</button>

{#if open}
  <BottomSheet ariaLabel="Menu" on:close={close} let:close>
    <button class="item" on:click={openSettings}>Paramètres</button>
    <button class="item" on:click={openReferences}>Références</button>
    <button class="item" on:click={openAbout}>À propos</button>
    <button class="item cancel" on:click={close}>Annuler</button>
  </BottomSheet>
{/if}

<style>
  .menu-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    cursor: pointer;
    background: var(--color-surface);
    border: none;
    border-radius: 50%;
    box-shadow: var(--shadow-sm);
  }

  .bar {
    width: 1.1rem;
    height: 2px;
    border-radius: 1px;
    background: var(--color-text);
  }

  .item {
    width: 100%;
    text-align: left;
    padding: 1rem 0.5rem;
    background: none;
    border: none;
    border-top: 1px solid var(--color-border);
    cursor: pointer;
    font-size: 1.05rem;
    color: var(--color-text);
  }

  .item:first-of-type {
    border-top: none;
  }

  .item:active {
    background: var(--color-bg);
  }

  .cancel {
    margin-top: 0.5rem;
    text-align: center;
    font-weight: 600;
    color: var(--color-primary);
    border-top: none;
  }
</style>
