# Guide d'Installation - React/Next.js

Ce guide te permettra de configurer un environnement React/Next.js moderne avec pnpm, TypeScript, ESLint, Prettier et Jest.

---

## 1. Installation de pnpm ✅

pnpm est un gestionnaire de packages rapide et économe en espace disque.

### Windows (PowerShell)

```powershell
# Installation de pnpm via npm (si Node.js déjà installé)
npm install -g pnpm

# Ou via PowerShell directement
iwr https://get.pnpm.io/install.ps1 -useb | iex

# Vérifier l'installation
pnpm --version
```

### Pourquoi pnpm ?

| Aspect            | npm                 | pnpm           |
| ----------------- | ------------------- | -------------- |
| Installation deps | ~30s                | ~5s            |
| Espace disque     | Dupliqué par projet | Store partagé  |
| node_modules      | Plat (hoisting)     | Strict (isolé) |
| Lock file         | package-lock.json   | pnpm-lock.yaml |

---

## 2. Création du Projet Next.js ✅

```powershell
# Créer un nouveau projet Next.js avec toutes les options recommandées
pnpm create next-app@latest react-training

# Options recommandées :
# ✔ Would you like to use TypeScript? Yes
# ✔ Would you like to use ESLint? Yes
# ✔ Would you like to use Tailwind CSS? Yes
# ✔ Would you like to use `src/` directory? Yes
# ✔ Would you like to use App Router? Yes
# ✔ Would you like to customize the default import alias? No

# Se placer dans le projet
cd react-training
```

---

## 3. Installation des Tests (Jest + Testing Library) ✅

### Dépendances de développement

```powershell
pnpm add -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @types/jest
```

### Configuration Jest

Créer `jest.config.mjs` à la racine :

```javascript
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
}

export default createJestConfig(customJestConfig)
```

Créer `jest.setup.ts` :

```typescript
import '@testing-library/jest-dom'
```

### Scripts package.json

Ajouter dans `package.json` :

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 4. Configuration TypeScript Strict ✅

Le mode `strict` est déjà activé. Pour renforcer davantage, ajouter dans `tsconfig.json` :

```json
{
  "compilerOptions": {
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## 5. Configuration ESLint ✅

Le projet utilise ESLint 9 avec le nouveau format **flat config** (`eslint.config.mjs`).

Pour ajouter des règles personnalisées, modifier `eslint.config.mjs` :

```javascript
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'prefer-const': 'error',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])

export default eslintConfig
```

---

## 6. Configuration Prettier ✅

### Installer Prettier

```powershell
pnpm add -D prettier eslint-config-prettier
```

### Créer `.prettierrc`

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Créer `.prettierignore`

```
node_modules
.next
dist
coverage
pnpm-lock.yaml
```

### Intégrer avec ESLint

Modifier `eslint.config.mjs` pour ajouter `eslint-config-prettier` (désactive les règles de formatage qui conflictent) :

```javascript
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier, // Doit être en dernier
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'prefer-const': 'error',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])

export default eslintConfig
```

### Scripts package.json

Ajouter dans `package.json` :

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 7. Configuration PHPStorm

### Configurer Node.js

1. **File → Settings → Languages & Frameworks → Node.js**
2. Vérifier que Node.js est détecté
3. Activer "Coding assistance for Node.js"

### Configurer ESLint

1. **File → Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint**
2. Sélectionner "Automatic ESLint configuration"
3. Cocher "Run eslint --fix on save"

### Configurer Prettier

1. **File → Settings → Languages & Frameworks → JavaScript → Prettier**
2. Sélectionner le package Prettier du projet
3. Cocher "On save" pour formatter automatiquement

### Raccourcis utiles

| Action                | Raccourci         |
| --------------------- | ----------------- |
| Reformatter           | `Ctrl+Alt+L`      |
| Fix ESLint            | `Alt+Shift+Enter` |
| Aller à la définition | `Ctrl+B`          |
| Renommer              | `Shift+F6`        |

---

## 8. Commandes Utiles

### Gestion des dépendances (pnpm)

```powershell
# Ajouter une dépendance
pnpm add <package>

# Ajouter une dépendance dev
pnpm add -D <package>

# Mettre à jour les dépendances
pnpm update

# Voir les dépendances outdated
pnpm outdated
```

### Développement

```powershell
# Lancer le serveur de développement
pnpm dev

# Build production
pnpm build

# Lancer en mode production
pnpm start
```

### Qualité du code (après installation complète)

```powershell
# Linter
pnpm lint

# Vérifier les types
pnpm type-check

# Formater le code
pnpm format

# Lancer les tests
pnpm test

# Tests avec watch
pnpm test:watch
```

---

## 9. Vérification de l'Installation

Créer `src/__tests__/setup.test.ts` :

```typescript
describe('Setup verification', () => {
  it('should run tests correctly', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have TypeScript working', () => {
    const greeting: string = 'Hello, React!'
    expect(greeting).toContain('React')
  })
})
```

Exécuter :

```powershell
pnpm test
```

---

## 10. Structure Finale du Projet

Après le setup complet, ton projet devrait ressembler à ceci :

```
react-training/
├── node_modules/           # Dépendances (géré par pnpm)
├── src/
│   ├── app/                # App Router Next.js
│   │   ├── layout.tsx      # Layout principal
│   │   ├── page.tsx        # Page d'accueil
│   │   └── globals.css     # Styles globaux
│   ├── components/         # Composants réutilisables
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilitaires
│   └── __tests__/          # Tests
├── docs/                   # Documentation formation
├── public/                 # Assets statiques
├── package.json            # Configuration projet
├── pnpm-lock.yaml          # Lock file
├── tsconfig.json           # Configuration TypeScript
├── next.config.ts          # Configuration Next.js
├── jest.config.mjs         # Configuration Jest
├── eslint.config.mjs       # Configuration ESLint (flat config)
├── .prettierrc             # Configuration Prettier
└── CLAUDE.md               # Instructions Claude Code
```

---

## Problèmes Courants

### pnpm non reconnu après installation

Ferme et rouvre PowerShell, ou ajoute pnpm au PATH :

```powershell
$env:Path += ";$env:LOCALAPPDATA\pnpm"
```

### Erreurs TypeScript dans les fichiers de test

Vérifier que `tsconfig.json` inclut les fichiers de test. Par défaut, `**/*.ts` devrait suffire.

### Conflit ESLint / Prettier

Si ESLint signale des erreurs de formatage, vérifier que `eslint-config-prettier` est bien ajouté dans la config ESLint.

### Hot reload ne fonctionne pas

Vérifier que le serveur de dev est lancé avec `pnpm dev` et non `pnpm start`.

### Jest ne trouve pas les modules `@/`

Vérifier que `moduleNameMapper` dans `jest.config.mjs` correspond au `paths` de `tsconfig.json`.
