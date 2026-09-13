### Règles françaises implémentées (`france.ts`)

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
