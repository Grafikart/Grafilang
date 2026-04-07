# Fonctions

Les fonctions servent à regrouper des instructions réutilisables.

## Définir une fonction

```txt
FONCTION nom(parametre1, parametre2)
  ...
FIN
```

## Retourner une valeur

```txt
RETOURNER expression
```

## Exemples

```txt
FONCTION double(N)
  RETOURNER N * 2
FIN

AFFICHER double(3)
```

```txt
FONCTION compte(N)
  SI N > 1 ALORS
    compte(N - 1)
  FIN
  AFFICHER N
FIN

compte(3)
```
