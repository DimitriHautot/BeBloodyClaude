# BeBloody

PWA de suivi des dons de sang total, plasma et plaquettes.

Toute la documentation destinée aux développeurs (stack, architecture,
conventions de code, de branches et de changelog) vit dans
[`AGENTS.md`](./AGENTS.md) — merci de le lire avant de contribuer, ce
README ne le duplique pas.

## Démarrage rapide

```sh
npm install
npm run dev
```

Voir la section « Commandes » d'AGENTS.md pour `build`/`test`/`check`.

## Proposer les règles d'un nouveau pays

La marche à suivre est documentée dans la skill
[`.claude/skills/donation-rules/SKILL.md`](./.claude/skills/donation-rules/SKILL.md).
En plus de l'implémentation TypeScript qui y est décrite, toute proposition
de nouveau pays doit être accompagnée d'une nouvelle section dans ce même
fichier expliquant les règles retenues (sources officielles citées) et
incluant la matrice complète des délais « dernier don / prochain don »
(sang total, plasma, plaquettes), sur le modèle des sections Belgique et
France déjà présentes.
