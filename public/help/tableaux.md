# Tableaux

Un tableau permet de stocker plusieurs valeurs dans une même variable.

## Créer un tableau

```txt
VAR NOTES = [10, 20, 15]
```

Les tableaux peuvent contenir d'autres tableaux.

```txt
VAR DONNEES = [10, 20, [5, 12], 13]
```

## Accéder à une case

```txt
AFFICHER NOTES[0]
AFFICHER DONNEES[2][1]
```

## Parcourir un tableau

Avec les index :

```txt
POUR I ENTRE 0 ET taille(NOTES) - 1 FAIRE
  AFFICHER NOTES[I]
FIN
```

Directement avec les valeurs :

```txt
POUR NOTE DANS NOTES
  AFFICHER NOTE
FIN
```

## Fonction standard

```txt
AFFICHER taille(NOTES)
```
