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

La marche à suivre est documentée dans
[`.claude/donation-rules/modular-rules.md`](./.claude/donation-rules/modular-rules.md).
En plus de l'implémentation TypeScript qui y est décrite, toute proposition
de nouveau pays doit être accompagnée d'un fichier
`.claude/donation-rules/<country-name>.md` expliquant les règles retenues
(sources officielles citées) et incluant la matrice complète des délais
« dernier don / prochain don » (sang total, plasma, plaquettes), sur le
modèle de [`belgium.md`](./.claude/donation-rules/belgium.md) et
[`france.md`](./.claude/donation-rules/france.md).
