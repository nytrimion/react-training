# Module 2 : State & Events

**Durée estimée** : 7-10h
**Prérequis** : Module 1 complété

---

## Objectifs du module

À la fin de ce module, tu seras capable de :

- Utiliser `useState` avec tous ses patterns (lazy init, functional updates, batching)
- Gérer les événements React avec TypeScript (SyntheticEvent)
- Implémenter des formulaires contrôlés et non-contrôlés
- Appliquer le "lifting state up" et comprendre le state colocation
- Utiliser `useReducer` pour des états complexes avec des patterns CQRS-like
- Tester les interactions utilisateur avec Testing Library

---

## Structure du module

| Section | Contenu | Fichier |
|---------|---------|---------|
| 1. useState | Fondamentaux, lazy init, functional updates, batching | `01_useState.md` |
| 2. Événements | SyntheticEvent, types TS, event delegation | `02_events.md` |
| 3. Formulaires | Controlled vs uncontrolled, validation | `03_forms.md` |
| 4. State architecture | Lifting state up, colocation, derived state | `04_state_architecture.md` |
| 5. useReducer | Reducer pattern, actions typées, CQRS-like | `05_useReducer.md` |
| 6. Testing | Tester les interactions, userEvent avancé | `06_testing.md` |
| Exercices | Exercices pratiques progressifs | `exercises.md` |

---

## Analogies Vue.js → React

| Concept | Vue.js | React |
|---------|--------|-------|
| State local | `ref()` / `reactive()` | `useState()` |
| State complexe | Pinia store | `useReducer()` |
| v-model | Two-way binding automatique | Controlled component (value + onChange) |
| Événements | `@click`, `@input` | `onClick`, `onChange` |
| Event modifiers | `@click.stop`, `@submit.prevent` | `e.stopPropagation()`, `e.preventDefault()` |

---

## Points clés à aborder

### useState
- Immutabilité obligatoire (pas de mutation directe)
- Batching automatique (React 18+)
- Lazy initialization pour les calculs coûteux
- Functional updates pour éviter les stale closures

### Événements
- `SyntheticEvent` vs événements natifs
- Typage TypeScript des handlers
- Event pooling (legacy, supprimé en React 17+)
- Bubbling et delegation

### Formulaires
- Controlled : React est la "source of truth"
- Uncontrolled : le DOM garde la valeur (avec `ref`)
- Quand utiliser l'un ou l'autre
- Validation synchrone et asynchrone

### useReducer
- Pattern Redux-like sans Redux
- Actions typées avec discriminated unions
- Quand préférer useReducer à useState
- Parallèle avec CQRS (commands/queries)

---

## Checklist de validation

Avant de passer au module suivant :

- [ ] Créer un formulaire contrôlé complet avec validation
- [ ] Implémenter un composant avec useReducer et actions typées
- [ ] Comprendre quand lever le state vs le garder local
- [ ] Écrire des tests d'interaction avec userEvent

---

> **Note** : Le contenu détaillé de ce module sera rédigé quand tu seras prêt à l'aborder.

→ Retour à la [vue d'ensemble](../../00_overview.md)
