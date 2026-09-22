---
name: donation-rules
description: Convention et détails des règles d'éligibilité au don (sang, plasma, plaquettes) par pays, dans src/lib/rules/. À charger pour ajouter ou modifier un pays, faire évoluer une règle existante (Belgique/France), ou répondre à une question sur les délais/quotas de don implémentés.
---

## Règles de don modulaires par pays (`src/lib/rules/`)

Le calcul de la prochaine date éligible est isolé dans un module par pays
implémentant l'interface `DonationRuleSet` (`src/lib/rules/types.ts`). C'est
volontairement conçu pour supporter plusieurs pays : la Belgique
(`belgium.ts`) et la France (`france.ts`) sont implémentées, et l'utilisateur
peut choisir son pays dans les réglages pour obtenir des règles différentes.

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

Ceci dit, `earliestPossibleDate` et `isDonationAllowed` n'utilisent pas
forcément **le même délai** que `computeNextEligibleDate` : les deux
premières valident un don qui a (ou aurait) réellement eu lieu, donc
doivent utiliser le minimum *légal* quand il diffère d'une recommandation
plus stricte utilisée pour la guidance prospective — voir le cas
sang→sang de la Belgique ci-dessous (`VALIDATION_DELAY_DAYS` vs
`CROSS_DELAY_DAYS` dans `belgium.ts`).

## Règles belges implémentées (`belgium.ts`)

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
conservateur du reste". Le délai sang→sang (84 jours = 12 semaines = 3 mois)
est la recommandation *stricte* de la Croix-Rouge, plus longue que le
minimum légal de 2 mois également mentionné sur la page (« la loi autorise
le don après un délai de minimum 2 mois entre 2 dons. Cependant, la
Croix-Rouge préconise un délai de 3 mois. Dans les deux cas, vous pouvez
donner maximum 4 fois en 365 jours. », confirmé par Dimitri le 22/09/2026 ;
base légale : arrêté royal du 17 octobre 2006 modifiant l'arrêté royal du
4 avril 1996 relatif au prélèvement, à la préparation, à la conservation
et à la délivrance du sang et des dérivés du sang d'origine humaine
([refli.be/fr/lex/2006023038](https://refli.be/fr/lex/2006023038)) —
texte exact non consulté, les sites officiels étant bloqués par le proxy
réseau de cet environnement).

**Deux matrices sang→sang, pas une seule** : cette différence légal/recommandé
n'est utilisée que pour sang→sang (aucune autre case n'a de distinction
connue) et implique deux usages différents du délai :
- `CROSS_DELAY_DAYS` (84 jours sang→sang) — la recommandation Croix-Rouge,
  utilisée par `computeNextEligibleDate` pour suggérer la prochaine date de
  don au donneur (guidance prospective, orientée santé).
- `VALIDATION_DELAY_DAYS` (56 jours sang→sang, soit 8 semaines — interprétation
  de « 2 mois » alignée sur le minimum légal français déjà utilisé dans
  `france.ts`, et sur le plancher de 8 semaines entre deux dons de sang total
  fixé par la directive européenne 2004/33/CE (que les États membres
  peuvent allonger mais pas raccourcir). Base légale :
  [refli.be/fr/lex/2006023038](https://refli.be/fr/lex/2006023038) (arrêté
  royal du 17 octobre 2006, voir plus haut) — texte exact non consulté,
  `refli.be` étant bloqué par le proxy réseau de cet environnement.
  **La valeur de 56j reste à confirmer si une source précise en jours est
  trouvée**)
  — utilisée par `isDonationAllowed` et `earliestPossibleDate` pour valider
  la saisie d'un don réellement effectué dans le passé. Sans cette
  distinction, un don historique légalement valide mais espacé de moins de
  12 semaines d'un précédent don de sang total était refusé à la saisie —
  bug rapporté par Dimitri le 22/09/2026 (fil « Règles de don en Belgique »).

**Quotas annuels glissants (365 jours)** :
- Sang total : max 4 dons/an.
- Plasma : max 19 dons/an (la page mentionne aussi un plafond de 15 litres/an,
  non implémenté ici faute de donnée de volume par don).
- Plaquettes : max 24 dons/an — **ce quota est partagé avec les dons de
  sang total** (« incluant les éventuels dons de sang » selon la page) : ce
  n'est pas un quota plaquettes isolé, `nb_plaquettes + nb_sang` sur la
  fenêtre glissante doit rester < 24. Le quota sang (4/an) reste, lui,
  indépendant et n'est pas affecté par les dons de plaquettes.

**Texte exact de la page (transmis par Dimitri le 22/09/2026, le domaine
étant bloqué par le proxy réseau de cet environnement)** :
> Intervalle entre 2 dons
>
> Pour un don de sang total, la loi autorise le don après un délai de
> minimum 2 mois entre 2 dons. Cependant, la Croix-Rouge préconise un
> délai de 3 mois. Dans les deux cas, vous pouvez donner maximum 4 fois en
> 365 jours.
>
> Pour ce qui est du don de plasma, celui-ci peut s'effectuer tous les 15
> jours et vous pouvez donner maximum 15 litres de plasma par an (maximum
> 19 dons par an).
>
> En ce qui concerne les plaquettes, la Croix-Rouge applique un délai
> d'attente d'un mois entre 2 dons. Un délai de 2 semaines reste une
> exception. Le nombre maximum de dons de plaquettes (incluant les
> éventuels dons de sang) est de 24 par an (365 jours).

**Anomalie non résolue, à garder en tête** : le 22/09/2026, Dimitri a
signalé un export officiel de la Croix-Rouge listant 5 dons de sang total
en 351 jours (26/07/2021, 02/11/2021, 01/02/2022, 09/05/2022, 12/07/2022)
— ce qui dépasse le quota de 4/365 jours glissants tel qu'implémenté ici
(mais reste sous 4 par année civile : 2 en 2021, 3 en 2022). Le texte
officiel ci-dessus dit explicitement « 365 jours » (pas « par année
civile »), donc la fenêtre glissante reste l'implémentation retenue pour
l'instant ; Dimitri compte poser la question à la Croix-Rouge lors de son
prochain don (le texte mentionne aussi une « exception » à 2 semaines
pour les plaquettes, sans en préciser les conditions — peut-être un
mécanisme similaire existe pour ce quota). Ne pas changer ce comportement
sans nouvelle instruction de Dimitri.

Implémentation : `QUOTA[type].countedTypes` liste les types de dons qui
comptent dans le quota d'un type donné (`['blood']` pour le sang, `['plasma']`
pour le plasma, `['platelets', 'blood']` pour les plaquettes).

**Hypothèse non confirmée, à vérifier auprès de la Croix-Rouge avant de
s'y fier pour une vraie décision médicale** :
- Les éventuelles différences de règles selon le sexe du donneur (ex. limite
  annuelle de dons de sang total parfois plus basse pour les femmes) ne sont
  pas encore implémentées ; le champ `sex` existe dans `DonorSettings` mais
  n'est pas encore utilisé par `belgium.ts`.

## Règles françaises implémentées (`france.ts`)

Basées sur deux pages officielles, transmises par l'utilisateur le 13/09/2026
sous forme de capture d'écran (les domaines `legifrance.gouv.fr` et
`service-public.gouv.fr` étant bloqués par le proxy réseau de cet
environnement, comme `donneurdesang.be` l'était pour la Belgique) :

- Annexe 1 de l'arrêté du 17 décembre 2019 (tableau des intervalles entre
  deux dons) :
  [legifrance.gouv.fr/loda/article_lc/LEGIARTI000039704282](https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000039704282/)
- Fiche « Don du sang : quelles sont les modalités du don ? » :
  [service-public.gouv.fr/particuliers/vosdroits/F2376](https://www.service-public.gouv.fr/particuliers/vosdroits/F2376)

**Délai avant un prochain don, selon le don précédent** — matrice complète
`CROSS_DELAY_DAYS[typeDuDernierDon][typeDuProchainDon]`, en jours (issue de
l'annexe 1, colonnes/lignes restreintes à sang total, plasma et plaquettes
— cette app ne gère pas les autres types du tableau : granulocytes,
globules rouges, CSH) :

| Dernier don ↓ / Prochain don → | Sang | Plasma | Plaquettes |
|---|---|---|---|
| **Sang** | 56 (8 sem.) | 14 (2 sem.) | 28 (4 sem.) |
| **Plasma** | 14 (2 sem.) | 14 (2 sem.) | 14 (2 sem.) |
| **Plaquettes** | 28 (4 sem.) | 14 (2 sem.) | 28 (4 sem.) |

**Quotas annuels glissants (365 jours)**, d'après le tableau
« Limites et périodicité du don de sang, plasma ou plaquettes » de
service-public.gouv.fr :
- Sang total : max 6 dons/an pour un homme, **4 dons/an pour une femme**.
  C'est la première règle du projet qui dépend réellement du sexe du
  donneur (`DonorSettings.sex`) — jusqu'ici ce champ existait mais n'était
  pas utilisé (voir `belgium.ts`).
- Plasma : max 24 dons/an, quel que soit le sexe.
- Plaquettes : max 12 dons/an, quel que soit le sexe.

Contrairement à la Belgique (où seul le quota plaquettes est partagé avec
le sang), la page mentionne aussi un **plafond global, tous types de dons
confondus** : « Au cours d'une année, avec une tolérance de 15 jours, un
maximum de 24 prélèvements est autorisé par donneur, tout type de don
confondu. » Ce plafond de 24 est implémenté comme une contrainte
supplémentaire (`GLOBAL_QUOTA`, `countedTypes: ['blood', 'plasma',
'platelets']`), appliquée en plus du quota propre à chaque type — un
donneur peut par exemple être bloqué sur un don de plaquettes uniquement à
cause de dons de plasma déjà comptabilisés, même sans avoir jamais donné de
plaquettes.

**Hypothèse non confirmée, à vérifier avant de s'y fier pour une vraie
décision médicale** :
- La tolérance de 15 jours mentionnée pour le plafond global de 24
  prélèvements/an n'est pas implémentée (comportement exact de cette
  tolérance sur la fenêtre glissante non trouvé dans les sources
  disponibles) : seul le plafond de 24 sur 365 jours glissants est
  appliqué, sans les 15 jours de tolérance en plus.
