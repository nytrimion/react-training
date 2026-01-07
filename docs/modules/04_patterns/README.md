# Module 4 : Patterns & Architecture

**Durée estimée** : 9-12h
**Prérequis** : Modules 1-3 complétés

---

## Objectifs du module

À la fin de ce module, tu seras capable de :

- Implémenter Context API efficacement (création, optimisation, limites)
- Maîtriser le pattern Compound Components
- Comprendre Render Props et HOC (patterns legacy mais utiles)
- Appliquer la composition avancée (slots, inversion of control)
- Utiliser Zustand et Jotai comme alternatives à Context
- Structurer une application React avec Clean Architecture
- Écrire des tests d'intégration

---

## Structure du module

| Section                | Contenu                                           | Fichier                      |
| ---------------------- | ------------------------------------------------- | ---------------------------- |
| 1. Context API         | createContext, Provider, useContext, optimisation | `01_context.md`              |
| 2. Compound Components | Pattern, API implicite, React.Children            | `02_compound.md`             |
| 3. Render Props & HOC  | Patterns legacy, cas d'usage actuels              | `03_render_props_hoc.md`     |
| 4. Composition avancée | Slots pattern, IoC, headless components           | `04_advanced_composition.md` |
| 5. State management    | Zustand, Jotai, comparaison avec Context          | `05_state_management.md`     |
| 6. Clean Architecture  | Structure de projet, séparation des concerns      | `06_clean_architecture.md`   |
| 7. Testing             | Tests d'intégration, mocking de contexte          | `07_testing.md`              |
| Exercices              | Exercices pratiques progressifs                   | `exercises.md`               |

---

## Analogies avec ton expertise

| Concept React       | Équivalent Vue.js | Pattern connu     |
| ------------------- | ----------------- | ----------------- |
| Context API         | `provide/inject`  | DI Container      |
| Compound Components | -                 | Composite pattern |
| Render Props        | Scoped slots      | Strategy pattern  |
| HOC                 | -                 | Decorator pattern |
| Custom hooks        | Composables       | Domain Services   |
| Zustand/Jotai       | Pinia             | State management  |

---

## Points clés à aborder

### Context API

- Quand utiliser Context vs props
- Le problème du re-render (et solutions)
- Context splitting
- Provider composition pattern
- Limites : pas de selector, re-render de tout le subtree

### Compound Components

- API implicite via Context
- Exemple : Tabs, Accordion, Select
- Flexibilité vs simplicité d'usage
- Validation des children

### Render Props & HOC

- Pourquoi ces patterns existent
- Hooks ont (presque) remplacé ces patterns
- Cas où ils restent pertinents
- Migration vers les hooks

### State Management

- Zustand : simple, peu de boilerplate
- Jotai : atomic state, bottom-up
- Quand sortir de Context
- Devtools et debugging

### Clean Architecture avec React

- Séparation UI / Business Logic / Data
- Où placer les hooks, les services, les types
- Dependency injection en React
- Testing de chaque couche

---

## Checklist de validation

Avant de passer au module suivant :

- [ ] Créer un Context avec Provider et hook custom
- [ ] Implémenter un Compound Component (ex: Accordion)
- [ ] Utiliser Zustand pour un state global
- [ ] Structurer un feature avec Clean Architecture
- [ ] Écrire des tests d'intégration avec Context mocké

---

> **Note** : Le contenu détaillé de ce module sera rédigé quand tu seras prêt à l'aborder.

→ Retour à la [vue d'ensemble](../../00_overview.md)
