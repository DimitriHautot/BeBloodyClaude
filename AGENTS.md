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

## Convention de branches Git

Une branche dédiée par fonctionnalité/correctif, pas une branche unique
réutilisée pour tout : chaque nouvelle tâche part de `main` sur une
branche fraîche (`git checkout -b <nom-descriptif> main`), qui devient la
tête d'une seule pull request. Une fois cette PR fusionnée, la branche est
terminée — elle n'est pas réutilisée pour une tâche suivante, même sans
rapport. Nommer la branche d'après ce qu'elle contient (ex.
`mobile-native-restyle`, `firefox-ios-icon-fix`), pas d'après un
identifiant de session.

Objectif : garder une correspondance stricte 1 branche ↔ 1 PR ↔ 1 sujet,
pour que l'historique et la revue restent lisibles — éviter qu'une branche
partagée accumule des commits sans rapport entre eux au fil des sessions.

Squash des commits avant de fusionner une PR. Suppression de la branche après fusion.

**Seule exception** à « pas de commit direct sur `main` » : la mise à jour
de `CHANGELOG.md` juste après un merge, voir « Journal des changements »
ci-dessous.

## Journal des changements (`CHANGELOG.md`)

Chaque PR fusionnée dans `main` doit avoir une entrée dans `CHANGELOG.md`,
sous forme `- <résumé> (`<hash court>`)`, groupée sous une section
`## <version>` ou `## Non publié` en haut du fichier.

Point important sur le moment où cette entrée est ajoutée : les PR de ce
dépôt sont fusionnées par squash-merge (voir plus haut), donc le hash final
du commit sur `main` n'existe qu'**après** la fusion — il est différent du
hash du dernier commit de la branche de la PR. L'entrée du changelog ne
peut donc pas être ajoutée dans la PR elle-même ; elle est ajoutée dans un
commit séparé, poussé directement sur `main` juste après chaque merge, une
fois le hash réel connu (`git log -1 --format=%h origin/main`).

## Identifier un build précisément (`buildInfo`, `CHANGELOG.md`)

En complément du numéro de version/build/date décrits plus bas
(« Vérifier la version déployée »), `buildInfo.commitHash` (aussi injecté
via `define` dans `vite.config.ts`, à partir de `git rev-parse --short
HEAD` au moment du build) donne le hash court exact du commit source d'un
build donné. Affiché dans le footer et au lancement de `npm run dev`/`npm
run build`, il permet de retrouver l'entrée correspondante dans
`CHANGELOG.md` pour savoir précisément ce qu'un build déployé contient.

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

## Taille de police : suivre les réglages du téléphone

Aucune taille de police fixe n'est imposée par l'app — elle doit suivre le
réglage d'accessibilité du système (ex. « Taille de police » sur
Android/Chrome). Deux règles à respecter pour que ça reste vrai :
- Toutes les `font-size` sont en `rem` (jamais en `px`) partout dans les
  composants, pour rester relatives à la taille par défaut du navigateur.
- `html` ne doit jamais fixer `font-size` en `px` (voir le
  `:global(html) { font-size: 100%; }` dans `App.svelte`) : c'est cette
  taille par défaut du navigateur, pilotée par l'OS, qui sert de base aux
  `rem`. La balise `viewport` dans `index.html` ne doit pas non plus
  contenir `user-scalable=no` ni `maximum-scale`, pour laisser le
  pinch-to-zoom disponible comme second levier d'accessibilité.

## Icônes PWA : qui lit quoi

Les navigateurs mobiles n'utilisent pas tous la même source pour l'icône
d'écran d'accueil, d'où plusieurs déclarations différentes dans
`index.html`/le manifest :
- Safari iOS lit `<link rel="apple-touch-icon">`, et ignore le manifest pour
  ça (voir commentaire dans `index.html`).
- Chrome/Edge (Android et desktop) lisent les `icons` du manifest.
- Firefox iOS : **confirmé fonctionnel** sur un appareil n'ayant jamais visité
  le site (voir « Piste à retenir » plus bas pour pourquoi ça n'apparaissait
  pas forcément sur un appareil déjà testé). Recette qui fonctionne :
  `apple-touch-icon.png` servi à la racine du site (`public/apple-touch-icon.png`,
  pas seulement sous `public/icons/...`) avec un `<link rel="apple-touch-icon"
  sizes="180x180">` déclarant explicitement sa taille. `public/favicon.png`,
  `public/apple-touch-icon.png` et `public/icons/` sont tous générés depuis
  le même tracé SVG par `node scripts/generate-icons.mjs` — ne pas les
  éditer à la main, modifier le script puis le relancer.

  **Comment ça marche** (lu dans le code source de
  `mozilla-mobile/firefox-ios`, fichiers `ShareManager.swift` et
  `HomePageActivity.swift`) : Firefox iOS n'implémente pas lui-même la
  génération de l'icône. Il délègue entièrement à la fonctionnalité système
  « Add to Home Screen » introduite par iOS 16.4 pour les navigateurs
  tiers, en passant à `UIActivityViewController` un objet `HomePageActivity`
  — une sous-classe de `WKWebView` **jamais chargée** (pas d'appel à
  `.load()`), qui se contente de retourner l'URL et le titre de l'onglet
  réel via des overrides de `url`/`title`. C'est donc le système
  (WebKit/iOS), pas Firefox, qui (re)fetche la page à cette URL et en
  extrait l'icône selon ses règles habituelles — les mêmes que celles de
  Safari (`apple-touch-icon`, avec `sizes`, prioritaire sur le manifest).

  **Piste à retenir pour la prochaine fois** : iOS met en cache l'icône
  « Add to Home Screen » par domaine à un niveau système, indépendamment de
  Firefox et de nos déploiements — un appareil ayant déjà tenté l'opération
  avant un correctif peut rester bloqué sur l'icône générée précédente. Pour
  vérifier un correctif sur ce point, toujours tester sur un appareil/
  simulateur n'ayant jamais fait « Ajouter à l'écran d'accueil » pour ce
  domaine plutôt que de réutiliser un appareil déjà testé.

## Vérifier la version déployée

En bas de la page principale (`<footer>` dans `App.svelte`), l'app affiche
son identité de build : numéro de version (`package.json`), numéro de build
unique, date + heure de build, et type (`debug` en dev, `production` en
build). Utile pour confirmer qu'un appareil donné (notamment une PWA
installée, cf. section cache plus haut) affiche bien la dernière version
déployée plutôt qu'une version en cache.

Ces valeurs sont calculées une seule fois par exécution de `vite`/`vite
build` (pas par requête) dans `vite.config.ts`, injectées via `define`
(`__APP_VERSION__`, `__BUILD_TIME__`, `__BUILD_NUMBER__`, déclarées dans
`src/vite-env.d.ts`) et mises en forme dans `src/lib/buildInfo.ts`. Le même
`vite.config.ts` les affiche aussi dans le terminal au lancement de
`npm run dev` ou `npm run build`, pour vérifier depuis les logs de
déploiement/CI sans avoir à ouvrir l'app.

## Règles de don par pays (`src/lib/rules/`)

Charger la skill `donation-rules` pour ajouter/modifier un pays, faire
évoluer une règle existante (Belgique/France), ou répondre à une question
sur les délais/quotas de don implémentés.
