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
                    # status.ts : calcul partagé du statut d'un don (eligible/upcoming/later)
    rules/         # règles de calcul de la prochaine date éligible, par pays
    settings/      # préférences du donneur (pays, sexe, mode debug, notifications) + persistance
    notifications/ # évaluation quotidienne des notifications + planification (voir plus bas)
    storage.ts      # helper générique `persisted<T>` (store Svelte <-> localStorage)
    dates.ts        # toutes les fonctions utilitaires de manipulation de dates (voir plus bas)
    toast.ts        # store + helper `showToast()` pour les messages transitoires
  components/       # AppMenu, Modal, Toast, DonationForm, DonationList, NextDonationSummary, SettingsPanel
  test-support/     # helpers partagés entre fichiers de test (ex. dateFixtures.ts)
  App.svelte
  main.ts
public/
  notifications-sw.js  # service worker minimal, uniquement pour showNotification()
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

## Notifications (`src/lib/notifications/`)

L'app n'a pas de backend, donc pas de push : le mécanisme est du
« best effort » — une vérification quotidienne à 8h heure locale ne peut
s'exécuter que tant que l'app reste ouverte (`scheduler.ts`, calqué sur le
pattern de rafraîchissement à minuit de `NextDonationSummary.svelte`), avec
un rattrapage au démarrage si 8h est déjà passée et qu'aucune vérification
n'a encore eu lieu aujourd'hui. `evaluate.ts` est une fonction pure qui
compare le statut de chaque type de don autorisé (via
`donations/status.ts`) à son statut de la veille (persisté dans
`notificationState`, `notifications/storage.ts`) et regroupe tous les
changements du jour en une seule notification. Le seuil « bientôt
possible » réutilise le réglage existant `highlightUpcoming*` : si ce
réglage est désactivé, seule la transition vers « possible dès maintenant »
peut déclencher une notification. `notifications-sw.js` (à la racine de
`public/`) sert uniquement à appeler `registration.showNotification()`
(requis sur certains navigateurs mobiles) — aucune gestion de push.

@.claude/donation-rules/modular-rules.md
