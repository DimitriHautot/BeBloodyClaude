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

**Borne minimale pour un sélecteur de date** : `DonationRuleSet` expose
aussi `earliestPossibleDate(type, allDonations, donorSettings)`, utilisé
par le bouton « + » (`NextDonationSummary.svelte` → `App.svelte` →
`DonationForm.svelte`, prop `minDate`) pour donner à l'input de date une
borne `min` en plus de la borne `max` (aujourd'hui). C'est la même logique
que `computeNextEligibleDate` mais **sans le plancher à aujourd'hui** : si
le délai est déjà écoulé, elle peut renvoyer une date passée (ex. « il y a
16 jours ») plutôt qu'aujourd'hui, ce qui permet de restreindre le picker
aux seules dates passées valides. Toute nouvelle implémentation de pays
doit aussi fournir cette méthode.

## Règles par pays
@.claude/donation-rules/belgium.md
