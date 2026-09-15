<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let title: string;

  const dispatch = createEventDispatcher<{ close: void }>();

  function close() {
    dispatch('close');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') close();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Backdrop click-to-close; Escape is handled via svelte:window above and
     the close button remains the keyboard-accessible affordance. -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="overlay" on:click={close}>
  <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title" on:click|stopPropagation>
    <span class="grabber" aria-hidden="true" />
    <div class="header">
      <h2 id="modal-title">{title}</h2>
      <button class="close" on:click={close} aria-label="Fermer">✕</button>
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
</div>

<style>
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

  .dialog {
    background: var(--color-surface);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    box-shadow: var(--shadow-lg);
    padding: 0.5rem 1.25rem calc(1.5rem + env(safe-area-inset-bottom));
    width: 100%;
    max-width: 640px;
    max-height: calc(100vh - 3rem);
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
    flex-shrink: 0;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    flex-shrink: 0;
  }

  .content {
    overflow-y: auto;
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
