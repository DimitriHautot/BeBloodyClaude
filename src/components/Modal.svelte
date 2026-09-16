<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import BottomSheet from './BottomSheet.svelte';

  export let title: string;

  const dispatch = createEventDispatcher<{ close: void }>();

  function close() {
    dispatch('close');
  }
</script>

<BottomSheet ariaLabelledby="modal-title" on:close={close} let:close>
  <div class="header">
    <h2 id="modal-title">{title}</h2>
    <button class="close" on:click={close} aria-label="Fermer">✕</button>
  </div>
  <div class="content">
    <slot />
  </div>
</BottomSheet>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    flex-shrink: 0;
    padding: 0 0.25rem;
  }

  .content {
    min-height: 0;
    overflow-y: auto;
    padding: 0 0.25rem;
  }

  h2 {
    font-size: 1.3rem;
    font-weight: 700;
    margin: 0;
  }

  .close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background: var(--color-bg);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1rem;
    color: var(--color-text-secondary);
    line-height: 1;
  }

  .close:hover {
    color: var(--color-text);
  }
</style>
