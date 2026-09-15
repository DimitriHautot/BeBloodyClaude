<script lang="ts">
  import { buildInfo } from '../lib/buildInfo';

  const CONTACT_EMAIL = 'bebloody@hautot.be';
  const SOURCE_URL = 'https://github.com/DimitriHautot/BeBloodyClaude';
</script>

<p class="intro">
  BeBloody est une application qui calcule, pour le sang total, le plasma et
  les plaquettes, la prochaine date à laquelle un don est possible — sans
  backend, sans compte, ni traçage : toutes les données restent stockées
  localement sur cet appareil.<br>
  <br>
  Cette application est une initiative personnelle, développée par
  <a href="https://dimitri.hautot.be" target="_blank" rel="noopener noreferrer">Dimitri Hautot</a> dans
  son temps libre, bien aidé par <a href="https://claude.ai/code/" target="_blank" rel="noopener noreferrer">Claude Code</a>.<br>
  <br>
  Aucune validation par un organisme officiel n'est effectuée lors du processus de développement.<br>
  Toutefois, les calculs sont modélisés en utilisant des règles publiées sur Internet. (cf. TODO)<br>
  Malgré cela, il est possible que les résultats obtenus ne soient pas toujours identiques à ceux obtenus
  via un organisme officiel. Ces derniers peuvent être plus précis en raison de leur expertise et de
  leur accès à des données plus détaillées.<br>
  <br>
  L'application est fournie "telle quelle" sans garantie de quelque nature que ce soit.
  Dimitri Hautot ne sera en aucun cas responsable des dommages directs ou indirects, y compris les
  dommages spéciaux, consécutifs, accessoires ou punitifs, résultant de l'utilisation de l'application.<br>
  <br>
  L'installation et l'utilisation de l'application impliquent l'adhésion totale à cette clause de
  non-responsabilité.
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
