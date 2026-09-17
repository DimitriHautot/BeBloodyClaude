---
name: pwa-icons
description: Qui lit quelle icône/splash screen PWA sur quelle plateforme (Safari iOS, Chrome/Edge, Firefox iOS), pièges de cache d'icône iOS, et convention de génération des icônes et des splash screens iOS. À charger avant de toucher index.html, le manifest, public/icons/, public/splash/ ou public/apple-touch-icon.png, ou pour diagnostiquer un problème d'icône/splash "Ajouter à l'écran d'accueil".
---

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
  le même tracé SVG (`scripts/lib/icon-mark.mjs`) par
  `node scripts/generate-icons.mjs` — ne pas les éditer à la main, modifier
  le script (ou `icon-mark.mjs`) puis le relancer.

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

## Splash screen iOS (`apple-touch-startup-image`)

iOS ignore aussi le manifest pour l'écran de lancement affiché pendant le
chargement d'une PWA installée (contrairement à Android/Chrome, qui en
synthétise un tout seul depuis `background_color` + une icône du manifest) :
sans balise dédiée, iOS affiche un flash blanc uni avant que l'UI de l'app
ne s'affiche.

- Une paire d'images (portrait + paysage) par taille d'écran/ratio de pixels
  iPhone courant, déclarée dans `index.html` via
  `<link rel="apple-touch-startup-image" media="...">`. `device-width`/
  `device-height` utilisent toujours les valeurs en points de l'orientation
  portrait ; c'est `orientation: portrait|landscape` seul qui sélectionne la
  bonne image — convention Apple, pas une valeur qui varie avec la rotation.
- Images générées dans `public/splash/` par `node scripts/generate-splash.mjs`,
  réutilisant le même tracé (`scripts/lib/icon-mark.mjs`) que les icônes —
  ne pas éditer les PNG à la main, modifier le script puis le relancer.
- Rendu volontairement identique à ce qu'Android synthétise déjà (fond
  `background_color` du manifest + icône centrée), plutôt qu'un design
  propre à iOS.
- Ne couvre que les tailles d'écran iPhone courantes (voir la liste
  `DEVICES` dans `scripts/generate-splash.mjs`) ; un appareil non couvert
  garde simplement le flash blanc par défaut — pas de régression, juste pas
  de splash personnalisé pour lui. Si un appareil précis pose problème,
  ajouter son couple largeur/hauteur/ratio (points CSS, pas pixels) à cette
  liste et relancer le script.
