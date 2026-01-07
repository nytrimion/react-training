# Module 1 : Fondations React

**Durée estimée** : 6-9h
**Prérequis** : TypeScript, expérience Vue.js ou autre framework

---

## Objectifs du module

À la fin de ce module, tu seras capable de :

- Comprendre ce qu'est JSX et comment il est transformé en JavaScript
- Créer des composants fonctionnels avec un typage TypeScript rigoureux
- Maîtriser les props, children et les patterns de composition
- Expliquer le cycle de rendu React et l'algorithme de réconciliation
- Écrire des tests unitaires pour tes composants

---

## Structure du module

| Section | Contenu | Durée |
|---------|---------|-------|
| [1. JSX en profondeur](./01_jsx.md) | Transpilation, expressions, fragments, JSX vs templates | ~1h |
| [2. Composants typés](./02_components.md) | Props, children, generics, patterns de typage | ~1.5h |
| [3. Composition](./03_composition.md) | Children, slots, composition vs héritage | ~1h |
| [4. Cycle de rendu](./04_rendering.md) | Virtual DOM, réconciliation, keys, re-renders | ~1.5h |
| [5. Testing](./05_testing.md) | Testing Library, premiers tests, bonnes pratiques | ~1h |
| [Exercices](./exercises.md) | Exercices pratiques progressifs | ~2-3h |

---

## Analogies Vue.js → React

Pour faciliter ta transition, voici les équivalences clés :

| Concept | Vue.js | React |
|---------|--------|-------|
| Template | `<template>` avec directives | JSX (JavaScript + XML) |
| Composant | SFC `.vue` | Fonction qui retourne JSX |
| Props | `defineProps<T>()` | `function Comp(props: T)` |
| Slots | `<slot>` / `<slot name="x">` | `children` / props explicites |
| Rendu conditionnel | `v-if`, `v-show` | `{condition && <X/>}`, ternaire |
| Boucles | `v-for` | `.map()` dans le JSX |
| Binding attributs | `:class`, `:style` | `className`, `style={{}}` |
| Événements | `@click` | `onClick` |

---

## Points de vigilance

### Ce qui change vraiment par rapport à Vue

1. **Pas de réactivité implicite** : En React, le re-render est déclenché explicitement par `setState`. Pas de système de proxy comme Vue.

2. **JSX n'est pas un template** : C'est du JavaScript. Les conditions et boucles utilisent la syntaxe JS native.

3. **Immutabilité** : React attend que tu crées de nouveaux objets/arrays, jamais de mutation directe.

4. **Unidirectional data flow** : Les données descendent (props), les événements remontent (callbacks).

---

## Exercices du module

Les exercices sont dans [`exercises.md`](./exercises.md). Ils suivent une progression :

1. **Découverte** : Transformer du JSX, créer un composant simple
2. **Application** : Composant avec props typées, composition
3. **Consolidation** : Composant complexe avec tests

---

## Ressources complémentaires

- [React Docs - Describing the UI](https://react.dev/learn/describing-the-ui)
- [React Docs - Your First Component](https://react.dev/learn/your-first-component)
- [TypeScript + React Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

## Checklist de validation

Avant de passer au module suivant, assure-toi de pouvoir :

- [ ] Expliquer ce que fait Babel/SWC avec le JSX
- [ ] Créer un composant avec des props typées (y compris optionnelles)
- [ ] Utiliser `children` et comprendre ses différentes formes
- [ ] Expliquer pourquoi les `key` sont importantes dans les listes
- [ ] Écrire un test simple avec Testing Library

→ [Commencer avec JSX](./01_jsx.md)