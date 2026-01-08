# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Formation React/Next.js - Instructions Claude Code

## Contexte de Formation

### Profil Apprenant

- Développeur senior avec 23 ans d'expérience (PHP, Go, Java, C)
- Expertise solide : DDD, Clean Architecture, SOLID, CQRS, Event-driven
- Niveau React : débutant (expérience Vue.js, React Native, Dart/Flutter)
- IDE : PHPStorm
- Environnement : Windows

### Objectifs

- Maîtrise approfondie de React et son écosystème
- Compréhension des patterns modernes (hooks, server components)
- Next.js App Router et rendu côté serveur
- TypeScript strict avec React

---

## Méthode Pédagogique

### Approche : Théorie → Pratique Guidée

1. **Expliquer le concept** avant tout code
2. **L'apprenant code lui-même** - Claude ne code jamais à sa place
3. **Claude challenge et corrige** - questions socratiques, revue de code
4. **Itérations courtes** - un concept à la fois

### Règles pour Claude

- **NE JAMAIS écrire le code à la place de l'apprenant**
- Poser des questions pour vérifier la compréhension
- Donner des indices progressifs, pas la solution directe
- Utiliser des analogies Vue.js/PHP quand pertinent
- Challenger les choix d'implémentation
- Corriger avec explications détaillées

### Langue

- Explications et discussions : **français**
- Code et commentaires : **anglais**
- Noms de variables/fonctions : anglais (camelCase JS)

---

## Conventions React/TypeScript

### Style et Formatage

- ESLint + Prettier strictement configurés
- Ligne max : 100 caractères
- Imports triés et groupés

### Typage

- TypeScript **strict mode** obligatoire
- Typage explicite des props avec `interface` ou `type`
- Éviter `any` - préférer `unknown` si nécessaire
- Generics pour les composants réutilisables

### Structure Composants

- Functional components uniquement (pas de classes)
- Hooks pour la logique stateful
- Props destructurées dans la signature
- Export nommé préféré (sauf page/layout Next.js)

### Conventions de Nommage

- Composants : `PascalCase` (fichier et nom)
- Hooks custom : `useCamelCase`
- Utilitaires : `camelCase`
- Types/Interfaces : `PascalCase`
- Constantes : `SCREAMING_SNAKE_CASE`

### Stack Technique

- **React 19.2.3** avec React Compiler (`babel-plugin-react-compiler`)
- **Next.js 16.1.1** (App Router)
- **TypeScript 5** (strict mode activé)
- **Tailwind CSS 4** (via `@tailwindcss/postcss`)
- **ESLint 9** avec `eslint-config-next`
- **pnpm** : gestionnaire de packages
- **Prettier** : formatting automatique
- **Jest** : framework de tests
- **Testing Library** : tests orientés utilisateur

### Path Alias

- `@/*` → `./src/*` (configuré dans tsconfig.json)

---

## Structure Projet

```
react-training/
├── docs/                    # Documentation formation
│   ├── 00_overview.md       # Vue d'ensemble + progression
│   ├── 01_setup.md          # Guide installation
│   └── modules/             # Contenu par module
│
├── src/                     # Code des exercices
│   ├── components/          # Composants réutilisables
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilitaires
│   └── app/                 # Pages Next.js (App Router)
│
├── __tests__/               # Tests
│
├── package.json             # Configuration projet
├── tsconfig.json            # Configuration TypeScript
├── eslint.config.mjs        # Configuration ESLint (flat config)
└── CLAUDE.md                # Ce fichier
```

### Workflow Type

1. Lire la documentation du module dans `docs/modules/`
2. Implémenter dans `src/`
3. Exécuter les tests avec Jest
4. Demander review à Claude

---

## Commandes Disponibles

```bash
# Installer les dépendances
pnpm install

# Lancer le serveur de développement
pnpm dev

# Build production
pnpm build

# Lancer en mode production
pnpm start

# Linter
pnpm lint

# Vérifier le typage
pnpm type-check

# Lancer les tests
pnpm test
pnpm test:watch

# Formater le code
pnpm format
```

---

## Progression

Voir `README.md` et `docs/00_overview.md` pour la vue d'ensemble et le suivi de progression.

### Modules (à définir)

1. **Fondations React** - JSX, composants, props, children, TypeScript
2. **State & Events** - useState, événements, formulaires contrôlés
3. **Hooks avancés** - useEffect, useCallback, useMemo, custom hooks
4. **Context & State global** - Context API, patterns de state management
5. **Next.js** - App Router, layouts, Server Components, data fetching

### Mise à jour automatique

Quand un objectif de module est **validé par l'apprenant** (exercice complété et compris) :

1. Mettre à jour le statut ⬜ → ✅ dans `docs/00_overview.md` et `README.md`
2. Mettre à jour la barre de progression globale
3. Informer l'apprenant de sa progression
