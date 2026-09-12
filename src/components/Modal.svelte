<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let title: string;
  /** Firefox refuses to render a native <input type="date"> (or
   * type="color") popup when any ancestor has a non-"visible" overflow —
   * the calendar silently fails to open at all, rather than merely being
   * clipped, even when the dialog doesn't actually need to scroll. The
   * quick-add donation modal (the only modal with a date field) must
   * therefore opt out of the scroll clipping below; SettingsPanel has no
   * date input and can keep it for its potentially long content. */
  export let scrollable = true;

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
  <div
    class="dialog"
    class:scrollable
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    on:click|stopPropagation
  >
    <div class="header">
      <h2 id="modal-title">{title}</h2>
      <button class="close" on:click={close} aria-label="Fermer">✕</button>
    </div>
    <slot />
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 100;
  }

  .dialog {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    width: 100%;
    max-width: 480px;
  }

  .dialog.scrollable {
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 1.1rem;
    margin: 0;
  }

  .close {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.1rem;
    color: #666;
    line-height: 1;
  }

  .close:hover {
    color: #000;
  }
</style>
