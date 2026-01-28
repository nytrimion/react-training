# Formation React/Next.js - Vue d'ensemble

## Objectif

Maîtrise approfondie de React et Next.js, en capitalisant sur l'expertise existante (DDD, Clean Architecture, Vue.js) tout en adoptant les patterns modernes de l'écosystème React.

**Niveau visé** : Expertise professionnelle (50-70h de formation)

---

## Structure de la Formation

### Module 1 : Fondations React

**Durée estimée** : 6-9h | **Thèmes** : JSX, composants, props, TypeScript, cycle de rendu

| Objectif                                                             | Statut |
| -------------------------------------------------------------------- | ------ |
| Comprendre JSX en profondeur (transpilation, fragments, expressions) | ✅     |
| Créer des composants fonctionnels typés (props, children, generics)  | ✅     |
| Maîtriser la composition et les patterns de base                     | ✅     |
| Comprendre le cycle de rendu et la réconciliation                    | ✅     |
| Écrire ses premiers tests de composants                              | ✅     |

→ [Accéder au module](./modules/01_fondations/README.md)

---

### Module 2 : State & Events

**Durée estimée** : 7-10h | **Thèmes** : useState, événements, formulaires, useReducer

| Objectif                                                 | Statut |
| -------------------------------------------------------- | ------ |
| Maîtriser useState et ses patterns (lazy init, batching) | ✅     |
| Gérer les événements React (SyntheticEvent, TypeScript)  | ✅     |
| Implémenter des formulaires contrôlés vs non-contrôlés   | ✅     |
| Comprendre le lifting state up et state colocation       | ✅     |
| Utiliser useReducer avec des patterns CQRS-like          | ✅     |
| Tester les interactions utilisateur                      | ✅     |

→ [Accéder au module](./modules/02_state/README.md)

---

### Module 3 : Hooks Avancés & React 19

**Durée estimée** : 10-13h | **Thèmes** : useEffect, refs, mémoisation, React 19, Suspense

| Objectif                                                          | Statut |
| ----------------------------------------------------------------- | ------ |
| Maîtriser useEffect (cleanup, race conditions, dépendances)       | ⬜     |
| Utiliser useRef (DOM, valeurs mutables, forwarding refs)          | ⬜     |
| Appliquer useMemo/useCallback judicieusement                      | ⬜     |
| Découvrir React 19 : use(), Actions, useTransition, useOptimistic | ⬜     |
| Implémenter Suspense et Error Boundaries                          | ⬜     |
| Comprendre le React Compiler et ses optimisations                 | ⬜     |
| Écrire des tests asynchrones avec mocking                         | ⬜     |

→ [Accéder au module](./modules/03_hooks/README.md)

---

### Module 4 : Patterns & Architecture

**Durée estimée** : 9-12h | **Thèmes** : Context, patterns avancés, state management, Clean Architecture

| Objectif                                                       | Statut |
| -------------------------------------------------------------- | ------ |
| Implémenter Context API (création, optimisation, limites)      | ⬜     |
| Maîtriser le pattern Compound Components                       | ⬜     |
| Comprendre Render Props et HOC (legacy mais utiles)            | ⬜     |
| Appliquer la composition avancée (slots, inversion of control) | ⬜     |
| Découvrir Zustand et Jotai (alternatives à Context)            | ⬜     |
| Structurer une app React avec Clean Architecture               | ⬜     |
| Écrire des tests d'intégration                                 | ⬜     |

→ [Accéder au module](./modules/04_patterns/README.md)

---

### Module 5 : Forms Avancés & Validation

**Durée estimée** : 7-10h | **Thèmes** : React Hook Form, Zod, patterns complexes, accessibilité

| Objectif                                                       | Statut |
| -------------------------------------------------------------- | ------ |
| Maîtriser React Hook Form (useForm, Controller, performance)   | ⬜     |
| Valider avec Zod (schemas, inférence TypeScript)               | ⬜     |
| Implémenter des formulaires complexes (wizard, dynamic fields) | ⬜     |
| Assurer l'accessibilité des formulaires (a11y)                 | ⬜     |
| Tester les formulaires efficacement                            | ⬜     |

→ [Accéder au module](./modules/05_forms/README.md)

---

### Module 6 : Next.js App Router

**Durée estimée** : 12-18h | **Thèmes** : RSC, data fetching, Server Actions, déploiement

| Objectif                                                           | Statut |
| ------------------------------------------------------------------ | ------ |
| Comprendre l'architecture App Router (RSC, Client/Server boundary) | ⬜     |
| Maîtriser layouts, templates et groupes de routes                  | ⬜     |
| Distinguer Server Components vs Client Components                  | ⬜     |
| Gérer le data fetching (fetch, cache, revalidation)                | ⬜     |
| Implémenter Server Actions et mutations                            | ⬜     |
| Créer des API Routes et Route Handlers                             | ⬜     |
| Configurer middleware et authentification                          | ⬜     |
| Optimiser les performances et déployer                             | ⬜     |

→ [Accéder au module](./modules/06_nextjs/README.md)

---

## Progression Globale

```
Module 1 : Fondations      [✅✅✅✅✅] 100%
Module 2 : State           [✅✅✅✅✅✅] 100%
Module 3 : Hooks & R19     [⬜⬜⬜⬜⬜⬜⬜] 0%
Module 4 : Patterns        [⬜⬜⬜⬜⬜⬜⬜] 0%
Module 5 : Forms           [⬜⬜⬜⬜⬜] 0%
Module 6 : Next.js         [⬜⬜⬜⬜⬜⬜⬜⬜] 0%
───────────────────────────────────────────
Total                      [✅✅⬜⬜⬜⬜] ~29%
```

---

## Approche pédagogique

### Pour chaque module

1. **Théorie** : Explication des concepts avec analogies Vue.js/PHP
2. **Démonstration** : Exemples de code commentés
3. **Exercices** : Tu codes, Claude guide et corrige
4. **Tests** : Validation des acquis par les tests
5. **Challenge** : Exercice avancé pour consolider

### Analogies avec ton expertise

| Concept React     | Équivalent Vue.js   | Pattern connu          |
| ----------------- | ------------------- | ---------------------- |
| useState          | ref() / reactive()  | -                      |
| useEffect         | watch() / onMounted | -                      |
| useReducer        | Pinia actions       | CQRS (commands)        |
| Context           | provide/inject      | DI Container           |
| Custom Hooks      | Composables         | Domain Services        |
| Server Components | -                   | Clean Arch (Use Cases) |

---

## Ressources

### Documentation

- [Guide d'installation](./01_setup.md)

### Liens externes

- [React Official Docs](https://react.dev/) - Documentation officielle
- [Next.js Docs](https://nextjs.org/docs) - Documentation Next.js
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Patterns.dev](https://www.patterns.dev/) - Design patterns React
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### Livres recommandés

- "Fluent React" - Tejas Kumar
- "Learning React" - Eve Porcello & Alex Banks

---

## Comment utiliser cette formation

1. **Lire** la documentation du module dans `docs/modules/`
2. **Discuter** avec Claude pour clarifier les concepts
3. **Coder** les exercices dans `src/`
4. **Tester** avec `pnpm test`
5. **Review** avec Claude pour améliorer le code
6. **Valider** en cochant les objectifs ci-dessus
