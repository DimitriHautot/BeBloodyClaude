<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ 'open-settings': void }>();

  let open = false;
  let navEl: HTMLElement;

  function toggle() {
    open = !open;
  }

  function openSettings() {
    open = false;
    dispatch('open-settings');
  }

  function handleWindowClick(event: MouseEvent) {
    if (open && navEl && !navEl.contains(event.target as Node)) {
      open = false;
    }
  }
</script>

<svelte:window on:click={handleWindowClick} />

<nav bind:this={navEl}>
  <button class="menu-button" on:click={toggle} aria-haspopup="true" aria-expanded={open} aria-label="Menu">
    ☰
  </button>

  {#if open}
    <ul class="menu">
      <li>
        <button on:click={openSettings}>Paramètres</button>
      </li>
    </ul>
  {/if}
</nav>

<style>
  nav {
    position: relative;
    display: inline-block;
  }

  .menu-button {
    padding: 0.4rem 0.75rem;
    font-size: 0.95rem;
    cursor: pointer;
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 6px;
  }

  .menu {
    position: absolute;
    top: calc(100% + 0.25rem);
    left: 0;
    list-style: none;
    margin: 0;
    padding: 0.25rem;
    background: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    min-width: 140px;
    z-index: 10;
  }

  .menu li button {
    width: 100%;
    text-align: left;
    padding: 0.5rem 0.6rem;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.95rem;
    border-radius: 4px;
  }

  .menu li button:hover {
    background: #f0f0f0;
  }
</style>
