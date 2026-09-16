<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  /** At least one of these should be set so assistive tech has a name for
   * the sheet — `ariaLabel` for a sheet with no visible heading (the app
   * menu), `ariaLabelledby` pointing at a heading id otherwise (Modal). */
  export let ariaLabel: string | null = null;
  export let ariaLabelledby: string | null = null;

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
     callers are expected to provide their own keyboard-accessible close
     affordance (e.g. a close button) inside the slot. -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="overlay" on:click={close}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="sheet"
    role="dialog"
    aria-modal="true"
    aria-label={ariaLabel}
    aria-labelledby={ariaLabelledby}
    on:click|stopPropagation
  >
    <span class="grabber" aria-hidden="true" />
    <slot {close} />
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

  .sheet {
    width: 100%;
    max-width: 640px;
    max-height: calc(100vh - 3rem);
    max-height: calc(100dvh - 3rem);
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
    flex-shrink: 0;
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
