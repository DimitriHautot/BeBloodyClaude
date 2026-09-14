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
- Firefox iOS reste **non confirmé** malgré plusieurs hypothèses déjà
  tentées sans succès observé sur appareil (voir historique git de cette
  section) : favicon agrandie en 192×192, `apple-touch-icon.png` aussi servi
  à la racine du site en plus de `public/icons/...`. `public/favicon.png`,
  `public/apple-touch-icon.png` et `public/icons/` restent générés depuis le
  même tracé SVG par `node scripts/generate-icons.mjs` — ne pas les éditer à
  la main, modifier le script puis le relancer.

  **Ce qu'on sait avec certitude** (lu dans le code source de
  `mozilla-mobile/firefox-ios`, fichiers `ShareManager.swift` et
  `HomePageActivity.swift`) : Firefox iOS n'implémente pas lui-même la
  génération de l'icône. Il délègue entièrement à la fonctionnalité système
  « Add to Home Screen » introduite par iOS 16.4 pour les navigateurs
  tiers, en passant à `UIActivityViewController` un objet `HomePageActivity`
  — une sous-classe de `WKWebView` **jamais chargée** (pas d'appel à
  `.load()`), qui se contente de retourner l'URL et le titre de l'onglet
  réel via des overrides de `url`/`title`. C'est donc le système
  (WebKit/iOS), pas Firefox, qui va (re)fetcher la page à cette URL et en
  extraire l'icône selon ses propres règles habituelles — les mêmes que
  celles de Safari en principe (`apple-touch-icon` prioritaire sur le
  manifest). Dernier ajustement tenté sur cette base : ajouter l'attribut
  `sizes="180x180"` manquant sur la balise `<link rel="apple-touch-icon">`
  (seule balise d'icône qui ne l'avait pas), toujours à confirmer sur
  appareil.

  **Piste à explorer si ça persiste** : iOS met en cache l'icône
  « Add to Home Screen » par domaine à un niveau système, pas seulement au
  niveau de l'app Firefox — un simple redéploiement peut ne pas suffire à
  invalider ce cache. Avant de conclure qu'un correctif ne fonctionne pas,
  tester sur un appareil/simulateur n'ayant jamais fait « Ajouter à l'écran
  d'accueil » pour ce domaine, ou après avoir effacé les données de site
  dans Firefox (Réglages → Firefox → Effacer les données de navigation, ou
  équivalent).

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

@.claude/donation-rules/modular-rules.md
