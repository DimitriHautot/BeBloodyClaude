<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { buildInfo } from '../lib/buildInfo';
  import { t } from '../lib/i18n';

  const CONTACT_EMAIL = 'bebloody@hautot.be';
  const SOURCE_URL = 'https://github.com/DimitriHautot/BeBloodyClaude';

  const dispatch = createEventDispatcher<{ 'open-references': void }>();
</script>

<p class="intro">
  {$t('about.intro1')}<br>
  <br>
  {$t('about.introBy')}
  <a href="https://dimitri.hautot.be" target="_blank" rel="noopener noreferrer">Dimitri Hautot</a>
  {$t('about.introBy2')} <a href="https://claude.ai/code/" target="_blank" rel="noopener noreferrer">Claude Code</a>.<br>
  <br>
  {$t('about.intro2')}<br>
  {$t('about.intro3a')}
  (<button class="link inline" on:click={() => dispatch('open-references')}>{$t('about.intro3link')}</button>).<br>
  {$t('about.intro3b')}<br>
  <br>
  {$t('about.intro4')}<br>
  <br>
  <b>{$t('about.disclaimerBold')}</b>
</p>

<dl>
  <div class="row">
    <dt>{$t('about.contact')}</dt>
    <dd><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></dd>
  </div>
  <div class="row">
    <dt>{$t('about.sourceCode')}</dt>
    <dd>
      <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer">{SOURCE_URL}</a>
    </dd>
  </div>
</dl>

<p class="build-info">
  v{buildInfo.version} ({buildInfo.commitHash}) · build {buildInfo.buildNumber} ·
  {buildInfo.buildTime} · {buildInfo.buildType}
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

  a,
  .link {
    color: var(--color-primary);
    word-break: break-all;
  }

  .link {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .link.inline {
    display: inline;
    word-break: normal;
  }

  .build-info {
    margin: 1.5rem 0 0;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    opacity: 0.7;
  }
</style>
