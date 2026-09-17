---
name: changelog-entry
description: Procédure pour ajouter l'entrée CHANGELOG.md juste après avoir fusionné (squash-merge) une pull request dans main. À charger dès qu'une PR vient d'être mergée, avant de committer quoi que ce soit sur main.
---

## Journal des changements (`CHANGELOG.md`)

Chaque PR fusionnée dans `main` doit avoir une entrée dans `CHANGELOG.md`,
sous forme `- <résumé> (`<hash court>`)`, groupée sous une section
`## <version>` ou `## Non publié` en haut du fichier.

Point important sur le moment où cette entrée est ajoutée : les PR de ce
dépôt sont fusionnées par squash-merge, donc le hash final du commit sur
`main` n'existe qu'**après** la fusion — il est différent du hash du
dernier commit de la branche de la PR. L'entrée du changelog ne peut donc
pas être ajoutée dans la PR elle-même ; elle est ajoutée dans un commit
séparé, poussé directement sur `main` juste après chaque merge, une fois
le hash réel connu.

**Étapes concrètes**, immédiatement après avoir mergé une PR :
1. Récupérer le hash réel du commit squashé sur `main` :
   `git fetch origin main && git log -1 --format=%h origin/main`.
2. Ajouter une ligne dans `CHANGELOG.md`, sous `## Non publié` (ou la
   section de version courante), résumant le changement et citant ce hash.
3. Committer ce seul changement directement sur `main` (c'est la **seule**
   exception à la règle "pas de commit direct sur `main`") et le pousser.

`buildInfo.commitHash` (`src/lib/buildInfo.ts`, injecté via `define` dans
`vite.config.ts` depuis `git rev-parse --short HEAD`) affiche ce même hash
dans le footer de l'app et au lancement de `npm run dev`/`npm run build` —
c'est ce qui permet de retrouver l'entrée correspondante dans
`CHANGELOG.md` pour un build déployé donné.
