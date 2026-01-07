# Module 3 : Hooks Avancés & React 19

**Durée estimée** : 10-13h
**Prérequis** : Modules 1-2 complétés

---

## Objectifs du module

À la fin de ce module, tu seras capable de :

- Maîtriser `useEffect` (cleanup, dépendances, race conditions)
- Utiliser `useRef` pour le DOM et les valeurs mutables
- Appliquer `useMemo` et `useCallback` judicieusement (et savoir quand NE PAS les utiliser)
- Découvrir les nouvelles APIs React 19 : `use()`, Actions, `useTransition`, `useOptimistic`
- Implémenter Suspense et Error Boundaries
- Comprendre le React Compiler et ses optimisations automatiques
- Écrire des tests asynchrones avec mocking

---

## Structure du module

| Section | Contenu | Fichier |
|---------|---------|---------|
| 1. useEffect | Lifecycle, cleanup, dépendances, pièges courants | `01_useEffect.md` |
| 2. useRef | Références DOM, valeurs mutables, forwarding refs | `02_useRef.md` |
| 3. Mémoisation | useMemo, useCallback, quand optimiser | `03_memoization.md` |
| 4. React 19 | use(), Actions, useTransition, useOptimistic | `04_react19.md` |
| 5. Suspense & Errors | Suspense, Error Boundaries, fallbacks | `05_suspense.md` |
| 6. React Compiler | Fonctionnement, ce qu'il optimise, configuration | `06_compiler.md` |
| 7. Testing async | Mocking, act(), waitFor, async patterns | `07_testing.md` |
| Exercices | Exercices pratiques progressifs | `exercises.md` |

---

## Analogies Vue.js → React

| Concept | Vue.js | React |
|---------|--------|-------|
| Side effects | `watch()`, `watchEffect()` | `useEffect()` |
| Lifecycle mount | `onMounted()` | `useEffect(() => {}, [])` |
| Lifecycle unmount | `onUnmounted()` | `useEffect(() => { return cleanup }, [])` |
| Refs DOM | `ref()` + template ref | `useRef()` |
| Computed | `computed()` | `useMemo()` |
| Method caching | Automatique | `useCallback()` |

---

## Points clés à aborder

### useEffect
- Ce n'est PAS un lifecycle hook (mental model différent)
- Synchronisation avec des systèmes externes
- Array de dépendances : exhaustive-deps
- Race conditions et cleanup
- Fetching data (et pourquoi préférer des librairies)

### useRef
- Deux usages : DOM refs et valeurs mutables
- Ne déclenche PAS de re-render
- forwardRef et useImperativeHandle
- Quand utiliser ref vs state

### Mémoisation (useMemo/useCallback)
- Le coût de la mémoisation
- "Premature optimization is the root of all evil"
- Cas d'usage légitimes (referential equality, calculs coûteux)
- Avec React Compiler : souvent inutile

### React 19
- `use()` : nouvelle façon de consommer les Promises et Context
- Server Actions : mutations côté serveur
- `useTransition` : marquer les updates comme non-urgentes
- `useOptimistic` : optimistic UI patterns
- `useFormStatus` : état des formulaires

### React Compiler
- Mémoisation automatique
- Pourquoi il rend useMemo/useCallback moins nécessaires
- Comment vérifier qu'il fonctionne
- Règles à respecter (pureté des composants)

---

## Checklist de validation

Avant de passer au module suivant :

- [ ] Créer un custom hook qui fetch des données avec cleanup
- [ ] Utiliser useRef pour un focus automatique
- [ ] Implémenter un Suspense boundary avec fallback
- [ ] Créer un Error Boundary
- [ ] Écrire des tests async avec mocking de fetch

---

> **Note** : Le contenu détaillé de ce module sera rédigé quand tu seras prêt à l'aborder.

→ Retour à la [vue d'ensemble](../../00_overview.md)
