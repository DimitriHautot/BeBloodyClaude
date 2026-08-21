# BeBloodyClaude

SPA sans backend pour suivre les dons de sang total, plasma et plaquettes,
et calculer la prochaine date de don possible pour chaque type. Tout l'état
est persisté dans le `localStorage` du navigateur — il n'y a ni serveur ni
base de données.

## Stack

- Svelte 4 + TypeScript + Vite (pas SvelteKit : pas besoin de routing
  serveur ni de SSR pour une SPA mono-page).
- CSS natif/scoped par composant Svelte, pas de librairie CSS.
- Vitest pour les tests unitaires (essentiellement la logique de calcul des
  dates, dans `src/lib/rules/`).

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
    settings/      # préférences du donneur (pays, sexe) + persistance
    storage.ts      # helper générique `persisted<T>` (store Svelte <-> localStorage)
  components/       # DonationForm, DonationList, NextDonationSummary, SettingsPanel
  App.svelte
  main.ts
```

## Règles de don modulaires par pays (`src/lib/rules/`)

Le calcul de la prochaine date éligible est isolé dans un module par pays
implémentant l'interface `DonationRuleSet` (`src/lib/rules/types.ts`). C'est
volontairement conçu pour supporter plusieurs pays : aujourd'hui seule la
Belgique (`belgium.ts`) est implémentée, mais l'utilisateur doit à terme
pouvoir choisir son pays et obtenir des règles différentes.

**Pour ajouter un nouveau pays** :
1. Créer `src/lib/rules/<pays>.ts` qui exporte un objet respectant
   `DonationRuleSet` (voir `belgium.ts` comme référence).
2. L'enregistrer dans `src/lib/rules/registry.ts`.
3. Rien d'autre à changer : `SettingsPanel.svelte` et
   `NextDonationSummary.svelte` lisent dynamiquement le registre.

**Point important sur la signature** : `computeNextEligibleDate(type,
allDonations, donorSettings)` reçoit **tout l'historique des dons, tous
types confondus** — pas seulement les dons du type demandé. C'est
nécessaire pour deux raisons, et toute nouvelle implémentation de pays doit
respecter cette même signature même si elle n'utilise pas les deux :
- **Contraintes croisées entre types** : un don de sang total peut retarder
  l'éligibilité à un don de plasma/plaquettes (et inversement), au-delà du
  simple délai propre à chaque type.
- **Quotas annuels glissants** : le nombre max de dons/an se calcule sur une
  fenêtre glissante de 365 jours, pas sur l'année calendaire, ce qui demande
  de regarder tout l'historique du type concerné.

**Validation à l'ajout d'un don** : `DonationRuleSet` expose aussi
`isDonationAllowed(type, date, allDonations, donorSettings)`, utilisé par
`src/lib/donations/validation.ts` (`validateNewDonation`) et appelé par
`addDonation` (`src/lib/donations/storage.ts`) avant tout ajout au store.
Contrairement à `computeNextEligibleDate` (qui est plafonné à aujourd'hui,
pour l'affichage de la prochaine date possible), `isDonationAllowed` n'a
pas ce plancher : il sert à valider une date de don passée ou présente en
ne tenant compte que des dons antérieurs ou du même jour (`date <=
candidat`) dans l'historique. Toute nouvelle implémentation de pays doit
aussi fournir cette méthode.

### Règles belges implémentées (`belgium.ts`) — à vérifier

Basées sur les informations publiques de la Croix-Rouge de Belgique
(donneurdesang.be, donneurdeplasma.be) :
- Sang total : intervalle minimum 60 jours, max 4 dons/an.
- Plasma : intervalle minimum 14 jours, max 23 dons/an.
- Plaquettes : intervalle minimum 14 jours, max 24 dons/an.

**Hypothèses non confirmées, à vérifier auprès de la Croix-Rouge avant de
s'y fier pour une vraie décision médicale** :
- Le délai *croisé* entre un don de sang total et un don de plasma/plaquettes
  (et vice-versa) n'est pas publié explicitement par la Croix-Rouge.
  L'implémentation actuelle applique par prudence le délai du type qui vient
  d'être donné à tous les types suivants (ex. un don de sang bloque tout
  autre don pendant 60 jours). Ce n'est qu'une approximation conservative.
- Les éventuelles différences de règles selon le sexe du donneur (ex. limite
  annuelle de dons de sang total parfois plus basse pour les femmes) ne sont
  pas encore implémentées ; le champ `sex` existe dans `DonorSettings` mais
  n'est pas encore utilisé par `belgium.ts`.
