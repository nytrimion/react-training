# Formation React/Next.js - De Senior Dev à React Expert

> Formation pratique assistée par Claude Code pour développeurs expérimentés

![React](https://img.shields.io/badge/React-19-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Claude Code](https://img.shields.io/badge/Claude%20Code-Learning%20Mode-purple)
![License](https://img.shields.io/badge/License-MIT-green)

## À propos

Cette formation a été conçue pour les **développeurs seniors** souhaitant maîtriser React et Next.js en capitalisant sur leur expertise existante (DDD, Clean Architecture, Vue.js, autres frameworks).

**Approche pédagogique :**

- Théorie → Pratique guidée
- Assistée par Claude Code (mode Learning)
- L'apprenant code lui-même, Claude guide et corrige
- Analogies Vue.js/autres frameworks pour faciliter la transition

Ce projet a été créé avec [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

---

## Comment utiliser cette formation

1. **Cloner le repo** et installer les dépendances avec pnpm
2. **Ouvrir avec Claude Code** (`claude` dans le terminal)
3. **Suivre les modules** dans l'ordre ([docs/00_overview.md](docs/00_overview.md))
4. **Coder les exercices** — Claude ne code pas à ta place !

## Prérequis

- Node.js 20+
- [pnpm](https://pnpm.io/) (gestionnaire de packages moderne)
- IDE JeetBrains ou VS Code, avec extensions React/TypeScript

---

## Installation rapide

```bash
# 1. Cloner le repo
git clone https://github.com/your-username/react-training.git
cd react-training

# 2. Installer pnpm (si nécessaire)
npm install -g pnpm

# 3. Installer les dépendances
pnpm install

# 4. Lancer le serveur de développement
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur pour voir le résultat.

La page `src/app/page.tsx` se met à jour automatiquement lors des modifications.

> **Note :** Ce projet utilise [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) pour optimiser et charger automatiquement [Geist](https://vercel.com/font).

---

## Structure du projet

```
react-training/
├── CLAUDE.md                 # Instructions Claude Code
├── package.json              # Configuration projet
├── tsconfig.json             # Configuration TypeScript
├── eslint.config.mjs         # Configuration ESLint (flat config)
│
├── docs/                     # Documentation
│   ├── 00_overview.md        # Vue d'ensemble + progression
│   ├── 01_setup.md           # Guide d'installation détaillé
│   └── modules/              # Contenu par module
│       ├── 01_fondations/    # JSX, composants, props
│       ├── 02_state/         # useState, events
│       ├── 03_hooks/         # useEffect, React 19
│       ├── 04_patterns/      # Context, architecture
│       ├── 05_forms/         # React Hook Form, Zod
│       └── 06_nextjs/        # App Router, RSC
│
├── src/
│   ├── app/                  # Pages Next.js (App Router)
│   ├── components/           # Composants réutilisables
│   ├── hooks/                # Custom hooks
│   └── lib/                  # Utilitaires
│
└── __tests__/                # Tests
```

---

## Modules de formation

**Durée totale estimée** : 50-70h

| Module                                                               | Thèmes                                                 | Durée  | Statut |
| -------------------------------------------------------------------- | ------------------------------------------------------ | ------ | ------ |
| [**1. Fondations**](docs/modules/01_fondations/README.md)            | JSX, composants, props, TypeScript, cycle de rendu     | 6-9h   | ✅     |
| [**2. State & Events**](docs/modules/02_state/README.md)             | useState, événements, formulaires, useReducer          | 7-10h  | 🔄     |
| [**3. Hooks & React 19**](docs/modules/03_hooks/README.md)           | useEffect, refs, mémoisation, Suspense, React Compiler | 10-13h | ⬜     |
| [**4. Patterns & Architecture**](docs/modules/04_patterns/README.md) | Context, Compound Components, Zustand, Clean Arch      | 9-12h  | ⬜     |
| [**5. Forms & Validation**](docs/modules/05_forms/README.md)         | React Hook Form, Zod, accessibilité                    | 7-10h  | ⬜     |
| [**6. Next.js App Router**](docs/modules/06_nextjs/README.md)        | RSC, data fetching, Server Actions, déploiement        | 12-18h | ⬜     |

---

## Commandes disponibles

```bash
# Serveur de développement
pnpm dev

# Build production
pnpm build

# Lancer en production
pnpm start

# Linter le code
pnpm lint

# Lancer les tests
pnpm test

# Tests en watch mode
pnpm test:watch

# Formater le code
pnpm format

# Vérifier les types
pnpm type-check
```

---

## Stack technique

| Outil          | Version | Rôle                              |
| -------------- | ------- | --------------------------------- |
| React          | 19.2.3  | Bibliothèque UI                   |
| Next.js        | 16.1.1  | Framework full-stack (App Router) |
| TypeScript     | 5.x     | Typage statique (strict mode)     |
| Tailwind CSS   | 4.x     | Styling utilitaire                |
| ESLint         | 9.x     | Linting (flat config)             |
| React Compiler | 1.0.0   | Optimisation automatique          |
| pnpm           | -       | Gestionnaire de packages          |

---

## Documentation

- [Vue d'ensemble et progression](docs/00_overview.md)
- [Guide d'installation complet](docs/01_setup.md)

## Ressources externes

- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn) - Tutoriel interactif
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Patterns.dev](https://www.patterns.dev/) - Design patterns React

---

## Déploiement

La façon la plus simple de déployer une app Next.js est d'utiliser [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Voir la [documentation de déploiement Next.js](https://nextjs.org/docs/app/building-your-application/deploying) pour plus de détails.

---

## Licence

Ce projet est sous licence MIT.
