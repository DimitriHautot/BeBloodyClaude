---
name: pwa-icons
description: Qui lit quelle icône PWA sur quelle plateforme (Safari iOS, Chrome/Edge, Firefox iOS), pièges de cache d'icône iOS, et convention de génération des icônes. À charger avant de toucher index.html, le manifest, public/icons/ ou public/apple-touch-icon.png, ou pour diagnostiquer un problème d'icône "Ajouter à l'écran d'accueil".
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
