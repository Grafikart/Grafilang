# Boucles

Les boucles servent à répéter plusieurs fois un traitement.

## TANTQUE

```txt
TANTQUE condition FAIRE
  ...
FIN
```

Exemple :

```txt
VAR A = 1
TANTQUE A <= 3 FAIRE
  AFFICHER A
  A = A + 1
FIN
```

## POUR ... ENTRE ... ET ...

```txt
POUR I ENTRE debut ET fin FAIRE
  ...
FIN
```

Exemple :

```txt
POUR K ENTRE 1 ET 3 FAIRE
  AFFICHER K
FIN
```

## POUR ... DANS ...

```txt
POUR ELEMENT DANS TABLEAU
  ...
FIN
```

Le mot-clé `FAIRE` est aussi accepté.

```txt
VAR NOTES = [10, 12, 14]

POUR NOTE DANS NOTES
  AFFICHER NOTE
FIN
```
