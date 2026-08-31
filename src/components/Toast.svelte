<script lang="ts">
  import { toastMessage } from '../lib/toast';
</script>

{#if $toastMessage}
  <div class="toast" role="status">{$toastMessage}</div>
{/if}

<style>
  .toast {
    position: fixed;
    left: 50%;
    bottom: 1.5rem;
    transform: translateX(-50%);
    background: #222;
    color: white;
    padding: 0.6rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    z-index: 200;
  }
</style>
