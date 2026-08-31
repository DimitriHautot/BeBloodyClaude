A la fin d'une demande de modification de code que je te demande, il faut vérifier que la qualité est maintenue.
Cela se fait en 4 étapes.

1. Exécuter les 2 suites de tests :
   1. D'abord les tests unitaires, via la commande `npm run test`.
   2. Si le code de retour est 0, tu peux lancer les tests "end-to-end", par le script `e2e-tests/run.sh`.
2. Lis ensuite les diff de code.
3. Vérifie qu’aucun test n’a été affaibli dans le seul but de faire passer les tests.
4. Signale la réussite ou l’échec, avec les preuves jointes.

