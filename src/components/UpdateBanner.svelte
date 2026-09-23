<script lang="ts">
  import { t } from '../lib/i18n';
</script>

<!-- Shown when `updateAvailable` (src/lib/version/updateCheck.ts) flips on.
     Reload is manual, never forced automatically: an auto-reload could
     wipe an in-progress form entry (DonationForm). -->
<div class="update-banner" role="status">
  <span>{$t('update.available')}</span>
  <button type="button" on:click={() => location.reload()}>{$t('update.reload')}</button>
</div>

<style>
  .update-banner {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: calc(0.6rem + env(safe-area-inset-top)) calc(1rem + env(safe-area-inset-right)) 0.6rem
      calc(1rem + env(safe-area-inset-left));
    background: var(--color-primary);
    color: #fff;
    font-size: 0.85rem;
    text-align: center;
  }

  button {
    flex-shrink: 0;
    padding: 0.35rem 0.75rem;
    border: none;
    border-radius: var(--radius-sm);
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
  }
</style>
