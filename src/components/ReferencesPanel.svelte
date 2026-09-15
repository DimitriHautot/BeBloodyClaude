<script lang="ts">
  import { ruleSetRegistry } from '../lib/rules/registry';
  import { getLanguageName } from '../lib/languages';
  import { getFlag } from '../lib/flags';

  const countries = Object.values(ruleSetRegistry).map((ruleSet) => {
    const references = ruleSet.officialReferences();
    const languages = Array.from(references.entries())
      .map(([code, urls]) => ({ code, name: getLanguageName(code), urls }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return { countryName: ruleSet.countryName, flag: getFlag(ruleSet.countryCode), languages };
  });
</script>

<p class="intro">
  Cette application a été développée par un particulier belge pour répondre à un besoin qu'il rencontrait
  depuis plusieurs années.<br><br>
  Elle n'est <b>en aucun cas</b> sponsorisée ou même revue par une quelconque instance officielle étatique.<br><br>
  Cependant, elle a été développée en utilisant des règles officielles pour chaque pays, listées ci-dessous.<br>
</p>

{#each countries as country (country.countryName)}
  <section class="country">
    <h3>{country.flag} {country.countryName}</h3>
    {#if country.languages.length === 1}
      <ul class="urls">
        {#each country.languages[0].urls as url (url)}
          <li><a href={url} target="_blank" rel="noopener noreferrer">{url}</a></li>
        {/each}
      </ul>
    {:else}
      <ul class="languages">
        {#each country.languages as language (language.code)}
          <li>
            <span class="language-name">{language.name}</span>
            <ul class="urls">
              {#each language.urls as url (url)}
                <li><a href={url} target="_blank" rel="noopener noreferrer">{url}</a></li>
              {/each}
            </ul>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
{/each}

<style>
  .intro {
    color: var(--color-text-secondary);
    margin-top: 0;
  }

  .country {
    margin-top: 1.25rem;
  }

  .country h3 {
    margin: 0 0 0.5rem;
    font-size: 1.05rem;
    font-weight: 700;
  }

  .languages,
  .urls {
    list-style: none;
    margin: 0;
    padding: 0 0 0 1.25rem;
  }

  .languages > li {
    margin-bottom: 0.5rem;
  }

  .language-name {
    display: block;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .urls li {
    margin-bottom: 0.25rem;
  }

  .urls a {
    color: var(--color-primary);
    word-break: break-all;
  }
</style>
