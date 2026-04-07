# AGENTS.md

Ce dépôt contient deux axes principaux:

- un mini langage d'algorithmique interprété dans le navigateur
- une interface React/Vite pour afficher des exercices, éditer du code et voir la sortie

Le but de ce document est de donner aux agents et contributeurs une vue rapide de la structure du projet, des conventions et des points de vigilance.

## Stack

- `Vite` + `React 18` + `TypeScript`
- `@tanstack/react-router` pour le routing
- `Tailwind CSS v4`
- `shadcn/ui` avec primitives `Base UI`
- `Monaco Editor` pour l'édition de code
- `@maverick-js/signals` pour une partie de l'état UI local
- `Vitest` pour les tests
- `Bun` comme gestionnaire de paquets de référence

## Commandes utiles

- `bun run dev` : démarrage local
- `bun run check` : vérification TypeScript
- `bun run test:run` : tests

N'utilise jamais `bun run build`.

## Structure du projet

### Racine

- `public/challenges/*.json` : données d'exercices chargées par le front
- `challenge.schema.json` : schéma source des exercices
- `src/type.challenge.ts` : types générés pour les exercices

### `src/lang`

Contient le moteur du langage.

- `lexer.ts` : tokenisation
- `ast.ts` : structure syntaxique
- `interpreter.ts` : exécution
- `errors.ts` : erreurs et positionnement
- `stdlib.ts`, `callable.ts`, `memory.ts`, `type.ts` : runtime

Règle:

- toute évolution du langage doit rester découplée de l'UI

### `src/ui`

Contient l'application front spécifique au produit.

- `routes.tsx` : shell principal et routes
- `pages/ChallengePage.tsx` : écran d'exercice
- `components/` : composants métier de l'interface
- `signals/editor.ts` : état et actions liés à Monaco, exécution, sortie
- `monaco.ts` : configuration de l'éditeur et du langage

Règle:

- l'état d'exécution et de sortie doit rester centralisé dans `src/ui/signals/editor.ts`

### `src/components/ui`

Composants UI génériques issus de `shadcn/ui`.

Exemples actuels:

- `button.tsx`
- `card.tsx`
- `badge.tsx`
- `scroll-area.tsx`
- `separator.tsx`

Règles:

- privilégier ces primitives avant de recréer des composants visuels custom
- conserver le style `shadcn` / `Base UI`
- éviter de réintroduire des classes CSS globales métier

### `src/lib`

- `utils.ts` : helpers transverses, notamment `cn()`

### `src/tools`

Scripts utilitaires de génération.

Règle:

- ces scripts ne sont pas le runtime applicatif
- éviter de coupler le `tsc` de l'app à des besoins Node/Bun spécifiques

## Conventions UI

- Le thème visuel passe par `src/main.css` et les tokens Tailwind/shadcn.
- Les pages utilisent des utilitaires Tailwind directement dans les composants.
- Les composants métiers vivent dans `src/ui/components`.
- Les primitives réutilisables et agnostiques vivent dans `src/components/ui`.
- Pour les icônes, utiliser `lucide-react`.
- Pour les overlays et interactions avancées, privilégier `Base UI`.

## Conventions de données

- Les exercices sont décrits via `public/challenges/*.json`.
- Le loader de route charge les exercices côté client.
- `description` est du markdown.
- `tests` contient les cas visibles utilisés par l'interface.

Si le schéma change:

- modifier `challenge.schema.json`
- régénérer `src/type.challenge.ts`
- mettre à jour l'UI qui lit ces champs

## Règles de modification

- Ne pas recréer un ancien système de CSS global basé sur des classes métier.
- Ne pas mélanger plusieurs systèmes de composants visuels concurrents.
- Ne pas déplacer la logique du langage dans les composants React.
- Ne pas dupliquer l'état de sortie ailleurs que dans `src/ui/signals/editor.ts`.
- Préserver la séparation entre:
  - moteur de langage
  - état d'exécution UI
  - composants de présentation

## Points d'attention

- `Monaco Editor` pèse lourd dans le bundle; éviter d'alourdir encore la page d'exercice sans raison.
- Les composants `shadcn` générés peuvent être modifiés localement, mais il faut garder leur API cohérente.
- Le fichier `src/main.css` sert de fondation; éviter d'y remettre du layout applicatif spécifique à une page.
- Le projet peut contenir des modifications locales non commitées; ne pas les écraser sans demande explicite.

## Quand vous ajoutez une fonctionnalité

Suivre en général cet ordre:

1. vérifier si le besoin relève du moteur (`src/lang`) ou de l'interface (`src/ui`)
2. réutiliser une primitive `src/components/ui` si elle existe
3. placer l'état partagé dans un module dédié plutôt que dans plusieurs composants
4. vérifier `bun run check`
5. vérifier `bun run build`

## Fichiers d'entrée importants

- `src/main.tsx`
- `src/main.css`
- `src/ui/App.tsx`
- `src/ui/routes.tsx`
- `src/ui/pages/ChallengePage.tsx`
- `src/ui/signals/editor.ts`
