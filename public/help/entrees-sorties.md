# Entrées / Sorties

Le langage permet d'afficher une valeur et de demander une saisie à l'utilisateur.

## AFFICHER

```txt
AFFICHER expression
```

Exemples :

```txt
AFFICHER "Bonjour"
```

```txt
VAR A = 3
AFFICHER A
```

## DEMANDER

```txt
VAR REPONSE = DEMANDER "Quel est votre prénom ?"
```

En interne, `DEMANDER` utilise `prompt()` côté JavaScript.

- si la réponse ressemble à un entier, elle est convertie en nombre
- sinon, elle reste une chaîne de caractères

Exemples :

```txt
VAR AGE = DEMANDER "Quel âge avez-vous ?"
AFFICHER AGE
```

```txt
VAR NOM = DEMANDER "Quel est votre prénom ?"
AFFICHER NOM
```
