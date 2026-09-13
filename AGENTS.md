# BeBloody

PWA sans backend pour suivre les dons de sang total, plasma et plaquettes,
et calculer la prochaine date de don possible pour chaque type. Tout l'état
est persisté dans le `localStorage` du navigateur — il n'y a ni serveur ni
base de données.

## Stack

- Svelte 4 + TypeScript + Vite (pas SvelteKit : pas besoin de routing
  serveur ni de SSR pour une PWA mono-page).
- CSS natif/scoped par composant Svelte, pas de librairie CSS.
- Vitest pour les tests unitaires (essentiellement la logique de calcul des
  dates, dans `src/lib/rules/`).
- Playwright pour les tests end-to-end, dans `e2e-tests`.

## Commandes

- `npm run dev` — serveur de développement.
- `npm run build` — build de production statique dans `dist/`.
- `npm run test` — tests Vitest.
- `npm run check` — vérification des types (`svelte-check`).

## Architecture

```
src/
  lib/
    donations/    # Donation, DonationType + persistance localStorage de l'historique
    rules/         # règles de calcul de la prochaine date éligible, par pays
    settings/      # préférences du donneur (pays, sexe, mode debug) + persistance
    storage.ts      # helper générique `persisted<T>` (store Svelte <-> localStorage)
    dates.ts        # toutes les fonctions utilitaires de manipulation de dates (voir plus bas)
  components/       # AppMenu, Modal, DonationForm, DonationList, NextDonationSummary, SettingsPanel
  test-support/     # helpers partagés entre fichiers de test (ex. dateFixtures.ts)
  App.svelte
  main.ts
```

## Utilitaires de dates (`src/lib/dates.ts`)

Toute manipulation de date (parsing, formatage, arithmétique sur les jours)
doit passer par ce module unique — ne pas réintroduire de logique de date
ad hoc dans un composant ou une règle de pays. Fonctions exposées :
`parseISODate`, `toISODate`, `addDays`, `today`, `formatDateLabel`.

Point important : `parseISODate`/`today` traitent systématiquement les
dates en **UTC** (suffixe `Z`), jamais en heure locale. Mélanger les deux
a déjà causé un bug dépendant du fuseau horaire de la machine (les tests
passaient en UTC mais échouaient sur une machine dans un fuseau différent) ;
toute nouvelle fonction de date doit rester cohérente avec ce choix.

Les tests Vitest qui ont besoin de dates relatives (ex. « il y a 10 jours »)
utilisent `daysAgo`/`daysFromNow` depuis `src/test-support/dateFixtures.ts`
plutôt que de redéfinir leurs propres helpers.

## PWA installée ("standalone") et cache

Une fois ajoutée à l'écran d'accueil (iOS/Android), l'app tourne dans une
WebView "standalone" qui n'a pas de bouton de rechargement manuel visible
par l'utilisateur : contrairement à un onglet de navigateur classique, un
donneur ne peut pas facilement forcer un rafraîchissement s'il reste sur
une version en cache après un déploiement. iOS en particulier a tendance à
garder longtemps la version HTML/JS/CSS déjà chargée pour une PWA
standalone tant qu'elle n'est pas explicitement invalidée.

**Recommandation** : côté hébergement du build statique (`dist/`),
vérifier que les en-têtes `Cache-Control` sont adaptés à ce mode d'usage —
typiquement pas de cache long (`no-cache` ou une durée courte) sur
`index.html` et sur `manifest.webmanifest`, puisque ce sont eux qui
référencent les assets hashés (`assets/index-*.js/css`, qui eux peuvent
être mis en cache long terme sans risque grâce au hash dans leur nom).
Sans ça, un utilisateur ayant déjà installé l'app peut rester bloqué sur
une ancienne version après un déploiement.

@.claude/donation-rules/modular-rules.md
