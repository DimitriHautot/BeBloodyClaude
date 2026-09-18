<script lang="ts" context="module">
  // Shared across every instance (module scope, not per-component state) so
  // the body scroll lock survives one sheet closing while another is
  // already open or opens in the same tick (e.g. AboutPanel's
  // "open-references" swaps showAbout for showReferences synchronously) —
  // the lock only lifts once the last open sheet unmounts, instead of
  // relying on the order Svelte happens to run onMount/onDestroy in.
  let lockCount = 0;

  // Same reasoning applies to the synthetic history entry used to make the
  // Android hardware/gesture back button close a sheet instead of leaving
  // the app: it's pushed once when the first sheet opens and popped once
  // the last one closes, shared across a same-tick swap from one sheet to
  // another (e.g. AppMenu closing itself while opening SettingsPanel).
  let historyEntryPushed = false;
  // Set right before dispatching `close` from a popstate event, so the
  // resulting teardown knows the browser already consumed the history
  // entry itself and must not call history.back() a second time.
  let closingFromPopstate = false;
</script>

<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

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

  // Android (and Chrome's edge-swipe gesture) has no visible close affordance
  // of its own — the OS expects its back control to dismiss the topmost
  // sheet rather than navigate the PWA away/backward. We push a dummy
  // history entry while a sheet is open so that control fires `popstate`
  // instead, which we treat as a close request.
  //
  // `navigator.standalone` is true only for a Safari iOS home-screen app —
  // undefined everywhere else, including Firefox iOS (whose "Add to Home
  // Screen" isn't a true standalone WKWebView) and Android. iOS has no
  // hardware/gesture back control this replaces anyway, and pushing a
  // history entry there was the actual regression behind #42's fix
  // reappearing (reported 2026-09-18): tall sheets (Paramètres, Références,
  // À propos) lost their header/close button again, Safari-only, Firefox
  // iOS unaffected — matching Safari's own standalone-mode quirk where a
  // `history.pushState` call perturbs the `100dvh` viewport-height
  // computation #42 relied on to keep the header on screen. Skipping the
  // history entry entirely on this one platform avoids the trigger without
  // touching the Android behavior it exists for.
  const isIOSStandalone = typeof navigator !== 'undefined' && (navigator as unknown as { standalone?: boolean }).standalone === true;

  function handlePopState() {
    closingFromPopstate = true;
    close();
  }

  // Prevent the page behind the sheet from scrolling/rubber-banding while
  // it's open. A `position: fixed` body (tried previously) creates a
  // second fixed-position context alongside .overlay's own — a known
  // WebKit bug where Safari's standalone renderer can then fail to treat
  // the innermost fixed element as fixed at all. `overflow: hidden` plus
  // `overscroll-behavior` avoids that entirely.
  onMount(() => {
    lockCount += 1;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';

    if (!isIOSStandalone) {
      if (!historyEntryPushed) {
        history.pushState({ bottomSheet: true }, '');
        historyEntryPushed = true;
      }
      window.addEventListener('popstate', handlePopState);
    }
  });

  onDestroy(() => {
    lockCount -= 1;
    if (!isIOSStandalone) window.removeEventListener('popstate', handlePopState);
    if (lockCount === 0) {
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';

      if (isIOSStandalone) return;

      // Deferred a tick: a same-tick swap to another sheet (e.g. AppMenu ->
      // SettingsPanel) re-mounts a new BottomSheet before this microtask
      // runs, so `lockCount` is back above zero and the shared history
      // entry stays untouched instead of being popped and re-pushed.
      queueMicrotask(() => {
        if (lockCount > 0 || !historyEntryPushed) return;
        historyEntryPushed = false;
        if (closingFromPopstate) {
          closingFromPopstate = false;
        } else {
          history.back();
        }
      });
    }
  });
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

  @keyframes slide-up {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
</style>
