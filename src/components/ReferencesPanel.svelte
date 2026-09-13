<script lang="ts">
  import { ruleSetRegistry } from '../lib/rules/registry';
  import { getLanguageName } from '../lib/languages';

  const countries = Object.values(ruleSetRegistry).map((ruleSet) => {
    const references = ruleSet.officialReferences();
    const languages = Array.from(references.entries())
      .map(([code, urls]) => ({ code, name: getLanguageName(code), urls }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return { countryName: ruleSet.countryName, languages };
  });
</script>

<p class="intro">
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
  labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
  laboris nisi ut aliquip ex ea commodo consequat.
</p>

{#each countries as country (country.countryName)}
  <section class="country">
    <h3>{country.countryName}</h3>
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
    color: #555;
    margin-top: 0;
  }

  .country {
    margin-top: 1rem;
  }

  .country h3 {
    margin: 0 0 0.5rem;
    font-size: 1rem;
  }

  .languages,
  .urls {
    list-style: none;
    margin: 0;
    padding: 0;
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
    color: #b3261e;
    word-break: break-all;
  }
</style>
