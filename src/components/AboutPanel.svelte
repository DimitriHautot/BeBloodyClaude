<script lang="ts">
  import { buildInfo } from '../lib/buildInfo';

  const CONTACT_EMAIL = 'bebloody@hautot.be';
  const SOURCE_URL = 'https://github.com/DimitriHautot/BeBloodyClaude';
</script>

<p class="intro">
  BeBloody est une application qui calcule, pour le sang total, le plasma et
  les plaquettes, la prochaine date à laquelle un don est possible — sans
  backend, sans compte, ni traçage : toutes les données restent stockées
  localement sur cet appareil.
</p>

<dl>
  <div class="row">
    <dt>Contact</dt>
    <dd><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></dd>
  </div>
  <div class="row">
    <dt>Code source</dt>
    <dd>
      <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer">{SOURCE_URL}</a>
    </dd>
  </div>
</dl>

<p class="build-info">
  v{buildInfo.version} · build {buildInfo.buildNumber} · {buildInfo.buildTime} · {buildInfo.buildType}
</p>

<style>
  .intro {
    color: var(--color-text-secondary);
    margin-top: 0;
  }

  dl {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin: 1.25rem 0 0;
  }

  .row {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  dt {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
  }

  dd {
    margin: 0;
  }

  a {
    color: var(--color-primary);
    word-break: break-all;
  }

  .build-info {
    margin: 1.5rem 0 0;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    opacity: 0.7;
  }
</style>
