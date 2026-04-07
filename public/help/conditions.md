# Conditions

Les conditions permettent d'exécuter un bloc différent selon qu'une expression est vraie ou fausse.

## Syntaxe

```txt
SI condition ALORS
  ...
SINON
  ...
FIN
```

La partie `SINON` est facultative.

## Comparaisons

- `==`
- `!=`
- `<`
- `<=`
- `>`
- `>=`

## Logique booléenne

- `VRAI`
- `FAUX`
- `ET`
- `OU`
- `!`

## Exemples

```txt
VAR AGE = 18

SI AGE >= 18 ALORS
  AFFICHER "majeur"
SINON
  AFFICHER "mineur"
FIN
```

```txt
VAR A = VRAI
VAR B = FAUX

AFFICHER A ET !B
```
