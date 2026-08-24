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

### Règles belges implémentées (`belgium.ts`)

Basées sur la page officielle de la Croix-Rouge de Belgique
[donneurdesang.be/fr/qui-peut-donner/delai-entre-deux-dons](https://www.donneurdesang.be/fr/qui-peut-donner/delai-entre-deux-dons)
(consultée par l'utilisateur le 21/08/2026, le domaine étant bloqué par le
proxy réseau de cet environnement).

**Délai avant un prochain don, selon le don précédent** — matrice complète
`CROSS_DELAY_DAYS[typeDuDernierDon][typeDuProchainDon]`, en jours (issue du
tableau « dernier don / prochain don » du site, converti depuis des
semaines) :

| Dernier don ↓ / Prochain don → | Sang | Plasma | Plaquettes |
|---|---|---|---|
| **Sang** | 84 (12 sem.) | 14 (2 sem.) | 28 (4 sem.) |
| **Plasma** | 14 (2 sem.) | 14 (2 sem.) | 14 (2 sem.) |
| **Plaquettes** | 28 (4 sem.) | 14 (2 sem.) | 28 (4 sem.) |

Le délai dépend donc à la fois du type du don précédent **et** du type du
don suivant — ce n'est pas un simple "délai propre au type + blocage
conservateur du reste". Le délai sang→sang (84 jours = 12 semaines) est la
recommandation *stricte* de la Croix-Rouge, plus longue que le minimum
légal de 2 mois également mentionné sur la page.

**Quotas annuels glissants (365 jours)** :
- Sang total : max 4 dons/an.
- Plasma : max 19 dons/an (la page mentionne aussi un plafond de 15 litres/an,
  non implémenté ici faute de donnée de volume par don).
- Plaquettes : max 24 dons/an — **ce quota est partagé avec les dons de
  sang total** (« incluant les éventuels dons de sang » selon la page) : ce
  n'est pas un quota plaquettes isolé, `nb_plaquettes + nb_sang` sur la
  fenêtre glissante doit rester < 24. Le quota sang (4/an) reste, lui,
  indépendant et n'est pas affecté par les dons de plaquettes.

Implémentation : `QUOTA[type].countedTypes` liste les types de dons qui
comptent dans le quota d'un type donné (`['blood']` pour le sang, `['plasma']`
pour le plasma, `['platelets', 'blood']` pour les plaquettes).

**Hypothèse non confirmée, à vérifier auprès de la Croix-Rouge avant de
s'y fier pour une vraie décision médicale** :
- Les éventuelles différences de règles selon le sexe du donneur (ex. limite
  annuelle de dons de sang total parfois plus basse pour les femmes) ne sont
  pas encore implémentées ; le champ `sex` existe dans `DonorSettings` mais
  n'est pas encore utilisé par `belgium.ts`.
