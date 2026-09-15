<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ 'open-settings': void; 'open-references': void }>();

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

  function handleKeydown(event: KeyboardEvent) {
    if (open && event.key === 'Escape') close();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<button class="menu-button" on:click={toggle} aria-haspopup="true" aria-expanded={open} aria-label="Menu">
  <span class="bar" />
  <span class="bar" />
  <span class="bar" />
</button>

{#if open}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="overlay" on:click={close}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="sheet" role="dialog" aria-modal="true" aria-label="Menu" on:click|stopPropagation>
      <span class="grabber" aria-hidden="true" />
      <button class="item" on:click={openSettings}>Paramètres</button>
      <button class="item" on:click={openReferences}>Références</button>
      <button class="item cancel" on:click={close}>Annuler</button>
    </div>
  </div>
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

  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(20, 20, 30, 0.35);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 100;
    animation: fade-in 0.15s ease-out;
  }

  .sheet {
    width: 100%;
    max-width: 640px;
    background: var(--color-surface);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    box-shadow: var(--shadow-lg);
    padding: 0.5rem 1rem calc(1rem + env(safe-area-inset-bottom));
    display: flex;
    flex-direction: column;
    animation: slide-up 0.2s ease-out;
  }

  .grabber {
    width: 2.5rem;
    height: 0.3rem;
    border-radius: 0.15rem;
    background: var(--color-border);
    align-self: center;
    margin: 0.5rem 0 0.75rem;
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

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slide-up {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
</style>
