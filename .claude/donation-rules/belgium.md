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
