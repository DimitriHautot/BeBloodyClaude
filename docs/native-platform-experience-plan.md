# Plan : expérience native selon la plateforme (iOS / Android)

Note de référence, pas encore implémentée. Objectif : faire en sorte que
l'app PWA se comporte/ressemble davantage à une app native selon qu'elle
est installée sur iOS ou Android, sans dupliquer l'UI ni s'écarter des
conventions du dépôt (pas de librairie CSS, voir AGENTS.md).

## 1. Détection de plateforme

- Créer `src/lib/platform.ts` : détection basée sur `navigator.userAgent`
  / `navigator.platform` + `window.matchMedia('(display-mode: standalone)')`
  pour distinguer web/PWA installée.
- Exposer une fonction simple (`getPlatform(): 'ios' | 'android' | 'other'`)
  plutôt que de disséminer des tests `userAgent.includes(...)` dans les
  composants.

## 2. Différences déjà pertinentes iOS vs Android en PWA

- **Barre de statut / couleurs système** : iOS lit
  `apple-mobile-web-app-status-bar-style` (déjà géré), Android lit
  `theme-color` (déjà présent) — pourrait devenir dynamique clair/sombre
  via plusieurs balises `media="(prefers-color-scheme: ...)"`.
- **Barre de navigation Android** : `theme-color` a aussi un effet sur la
  barre de navigation système, comportement absent côté iOS.
- **Icônes/splash screens** : Android supporte les *maskable icons* (zone
  de sécurité pour les formes adaptatives des launchers), iOS non — le
  manifest actuel ne déclare probablement qu'un seul type d'icône. iOS a
  besoin de balises `apple-touch-startup-image` pour un vrai splash
  screen custom (sinon iOS affiche l'icône sur fond blanc).

## 3. Composants d'UI adaptés au look natif

- Garder un seul design system neutre (choix actuel, cohérent avec
  AGENTS.md), mais ajouter des micro-adaptations conditionnelles : ex.
  `navigator.vibrate` pour un léger retour haptique Android sur les
  actions clés ("ajouter un don"), ignoré silencieusement sur iOS (non
  supporté par Safari).
- `BottomSheet.svelte` a déjà les conventions iOS (grabber). Pas de
  changement identifié nécessaire côté Android pour l'instant (pas de
  ripple/FAB/snackbar Material planifié — resterait cohérent avec le
  design neutre actuel).

## 4. Comportements spécifiques à activer conditionnellement

- **Pull-to-refresh** : sur Android Chrome standalone, peut déclencher un
  vrai rechargement de page natif ; comportement absent par défaut sur
  iOS standalone. À décider : le laisser, le bloquer
  (`overscroll-behavior-y: contain`, déjà partiellement en place), ou
  l'exploiter comme fonctionnalité.
- **Bouton retour matériel Android** : doit fermer une modale ouverte
  plutôt que quitter l'app — nécessite d'écouter `popstate`/`history` et
  de pousser un état d'historique factice à l'ouverture d'une
  `BottomSheet`, pour l'intercepter côté JS. N'a d'effet que sur Android
  (pas de bouton retour matériel sur iOS).
- **Partage** : `navigator.share` (Web Share API) pour un partage natif du
  lien de l'app plutôt qu'un bouton "copier le lien" — disponible sur les
  deux plateformes mais UX différente.

## 5. Ordre de priorité suggéré

1. Bouton retour Android → fermeture des modales (comportement natif
   attendu, absence actuelle = bug UX concret sur Android).
2. Icônes maskable Android + `apple-touch-startup-image` iOS (finitions
   visuelles à l'installation).
3. Module `platform.ts` centralisé pour éviter la duplication de
   détection entre les points ci-dessus.
4. Retour haptique Android sur actions clés (`navigator.vibrate`).
5. `theme-color` dynamique clair/sombre.

Chaque point ferait l'objet d'une branche/PR dédiée, conformément à la
convention 1 branche ↔ 1 PR ↔ 1 sujet du dépôt (voir AGENTS.md).
