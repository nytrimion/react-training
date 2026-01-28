# Mémoisation : useMemo et useCallback

## Introduction

La mémoisation en React permet d'éviter des recalculs ou des récréations de fonctions inutiles. Mais attention : **la mémoisation a un coût**, et l'utiliser partout est une erreur courante.

> **Citation célèbre** : "Premature optimization is the root of all evil" – Donald Knuth

Ce chapitre couvre :
- `useMemo` : mémoriser une valeur calculée
- `useCallback` : mémoriser une fonction
- Quand les utiliser (et surtout quand NE PAS les utiliser)

---

## useMemo

### Syntaxe

```tsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b])
```

La valeur n'est recalculée que si `a` ou `b` changent.

### Exemple concret

```tsx
function ProductList({ products, filter }: Props) {
  // Recalculé seulement si products ou filter changent
  const filteredProducts = useMemo(
    () => products.filter(p => p.category === filter),
    [products, filter]
  )

  return (
    <ul>
      {filteredProducts.map(p => <ProductItem key={p.id} product={p} />)}
    </ul>
  )
}
```

### Analogie Vue.js

```vue
<script setup>
// Vue.js : computed()
const filteredProducts = computed(() =>
  products.value.filter(p => p.category === filter.value)
)
</script>
```

```tsx
// React : useMemo()
const filteredProducts = useMemo(
  () => products.filter(p => p.category === filter),
  [products, filter]
)
```

**Différence clé** : En Vue, `computed()` détecte automatiquement ses dépendances. En React, tu dois les lister explicitement.

---

## useCallback

### Syntaxe

```tsx
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b)
  },
  [a, b]
)
```

La fonction n'est recréée que si `a` ou `b` changent.

### Équivalence avec useMemo

`useCallback(fn, deps)` est équivalent à `useMemo(() => fn, deps)` :

```tsx
// Ces deux sont équivalents
const handleClick = useCallback(() => console.log(id), [id])
const handleClick = useMemo(() => () => console.log(id), [id])
```

---

## Quand utiliser useMemo ?

### ✅ Cas légitimes

#### 1. Calculs vraiment coûteux

```tsx
function DataGrid({ rows }: { rows: Row[] }) {
  // Tri de milliers de lignes = coûteux
  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => a.value - b.value),
    [rows]
  )
}
```

#### 2. Préserver l'identité référentielle pour les dépendances

```tsx
function Parent() {
  const [count, setCount] = useState(0)

  // Sans useMemo, config serait un nouvel objet à chaque render
  const config = useMemo(
    () => ({ theme: 'dark', locale: 'fr' }),
    []  // Jamais recréé
  )

  useEffect(() => {
    initializeWithConfig(config)
  }, [config])  // Ne se déclenche qu'une fois
}
```

#### 3. Éviter des re-renders d'enfants (avec memo())

```tsx
const ExpensiveChild = memo(function ExpensiveChild({ data }: { data: Data }) {
  // Render coûteux
})

function Parent() {
  const [unrelated, setUnrelated] = useState(0)

  // Sans useMemo, data serait recréé → ExpensiveChild re-render
  const data = useMemo(() => processData(rawData), [rawData])

  return <ExpensiveChild data={data} />
}
```

### ❌ Quand NE PAS utiliser useMemo

#### 1. Calculs triviaux

```tsx
// ❌ Inutile : la comparaison coûte plus que le calcul
const doubled = useMemo(() => count * 2, [count])

// ✅ Direct
const doubled = count * 2
```

#### 2. Valeurs primitives

```tsx
// ❌ Les primitives ont déjà une identité stable
const message = useMemo(() => `Hello ${name}`, [name])

// ✅ Pas besoin
const message = `Hello ${name}`
```

#### 3. Par réflexe "au cas où"

```tsx
// ❌ "Mémoisation défensive" inutile
function Component({ items }: { items: Item[] }) {
  const length = useMemo(() => items.length, [items])  // Ridicule
}
```

---

## Quand utiliser useCallback ?

### ✅ Cas légitimes

#### 1. Passer une fonction à un composant mémoïsé

```tsx
const MemoizedChild = memo(function Child({ onClick }: { onClick: () => void }) {
  console.log('Child rendered')
  return <button onClick={onClick}>Click</button>
})

function Parent() {
  const [count, setCount] = useState(0)

  // Sans useCallback, MemoizedChild re-render à chaque changement de count
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <MemoizedChild onClick={handleClick} />
    </>
  )
}
```

#### 2. Fonction dans les dépendances d'un effect

```tsx
function SearchComponent({ query }: { query: string }) {
  const fetchResults = useCallback(async () => {
    const response = await fetch(`/api/search?q=${query}`)
    return response.json()
  }, [query])

  useEffect(() => {
    fetchResults().then(setResults)
  }, [fetchResults])  // Ne se déclenche que si query change
}
```

### ❌ Quand NE PAS utiliser useCallback

#### 1. Fonctions passées à des éléments DOM natifs

```tsx
// ❌ Inutile : les éléments DOM ne se comparent pas
function Button() {
  const handleClick = useCallback(() => console.log('click'), [])
  return <button onClick={handleClick}>Click</button>
}

// ✅ Direct
function Button() {
  return <button onClick={() => console.log('click')}>Click</button>
}
```

#### 2. Sans enfant mémoïsé

```tsx
// ❌ Child re-render quand même car il n'est pas memo()
function Parent() {
  const handleClick = useCallback(() => {}, [])
  return <Child onClick={handleClick} />  // Child pas mémoïsé
}
```

---

## Le coût de la mémoisation

### La mémoisation n'est pas gratuite

```tsx
// Sans mémoisation
const value = computeValue(a, b)

// Avec mémoisation
const value = useMemo(() => computeValue(a, b), [a, b])
```

Avec `useMemo`, React doit :
1. Stocker la valeur précédente
2. Stocker les dépendances précédentes
3. Comparer les dépendances à chaque render
4. Exécuter ou non le calcul

Si le calcul est trivial, la comparaison coûte plus cher que le calcul lui-même.

### Mesurer avant d'optimiser

```tsx
function Component() {
  console.time('calculation')
  const result = expensiveCalculation(data)
  console.timeEnd('calculation')
  // Si c'est < 1ms, pas besoin de useMemo
}
```

---

## memo() : Mémoïser un composant entier

`memo()` empêche un composant de re-render si ses props n'ont pas changé :

```tsx
import { memo } from 'react'

const ExpensiveList = memo(function ExpensiveList({ items }: { items: Item[] }) {
  return (
    <ul>
      {items.map(item => (
        <ExpensiveItem key={item.id} item={item} />
      ))}
    </ul>
  )
})
```

### Comparaison personnalisée

```tsx
const MemoizedComponent = memo(
  function Component({ user, onClick }: Props) {
    return <div onClick={onClick}>{user.name}</div>
  },
  (prevProps, nextProps) => {
    // Return true si les props sont "égales" (skip re-render)
    return prevProps.user.id === nextProps.user.id
  }
)
```

---

## React Compiler change la donne

Avec **React Compiler** (activé dans ce projet), beaucoup de mémoisation devient automatique :

```tsx
// Sans React Compiler
function TodoList({ todos, filter }) {
  const visibleTodos = useMemo(
    () => filterTodos(todos, filter),
    [todos, filter]
  )

  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])

  return <List items={visibleTodos} onClick={handleClick} />
}

// Avec React Compiler - même code, mémoisation automatique
function TodoList({ todos, filter }) {
  const visibleTodos = filterTodos(todos, filter)

  const handleClick = () => {
    console.log('clicked')
  }

  return <List items={visibleTodos} onClick={handleClick} />
}
```

> **Important** : Le React Compiler est activé dans ce projet. Tu peux souvent écrire du code simple sans useMemo/useCallback, et le compilateur l'optimisera pour toi.

---

## Règles pratiques

### Checklist avant d'ajouter useMemo/useCallback

1. ☐ Le calcul prend-il > 1ms ?
2. ☐ L'objet/fonction est-il passé à un composant `memo()` ?
3. ☐ L'objet/fonction est-il dans les dépendances d'un effect ?
4. ☐ As-tu mesuré un problème de performance réel ?

Si aucune case n'est cochée, **n'utilise pas la mémoisation**.

### Ordre de priorité pour optimiser

1. **Restructurer le code** : Déplacer le state plus bas, séparer en composants
2. **Éviter les renders inutiles** : Composition, children comme props
3. **memo()** sur les composants lents
4. **useMemo/useCallback** en dernier recours

---

## Anti-patterns

### ❌ Mémoïser partout "par sécurité"

```tsx
// ❌ Overkill
function Component({ name }: { name: string }) {
  const greeting = useMemo(() => `Hello, ${name}!`, [name])
  const handleClick = useCallback(() => alert(greeting), [greeting])

  return <button onClick={handleClick}>{greeting}</button>
}

// ✅ Simple et performant
function Component({ name }: { name: string }) {
  const greeting = `Hello, ${name}!`

  return <button onClick={() => alert(greeting)}>{greeting}</button>
}
```

### ❌ Oublier les dépendances

```tsx
// ❌ Bug : handleClick utilise une valeur stale de count
const handleClick = useCallback(() => {
  console.log(count)
}, [])  // count manque !

// ✅ Correct
const handleClick = useCallback(() => {
  console.log(count)
}, [count])
```

### ❌ useCallback sans memo()

```tsx
// ❌ Inutile si Child n'est pas memo()
function Parent() {
  const handleClick = useCallback(() => {}, [])
  return <Child onClick={handleClick} />
}

function Child({ onClick }) {
  return <button onClick={onClick}>Click</button>
}
```

---

## Comparaison Vue.js

| Concept | Vue.js | React |
|---------|--------|-------|
| Valeur calculée | `computed()` | `useMemo()` |
| Dépendances | Automatiques | Explicites |
| Fonction stable | Automatique* | `useCallback()` |
| Composant mémoïsé | Pas nécessaire** | `memo()` |

\* En Vue, les fonctions dans `<script setup>` sont stables par défaut.
\** Vue a un système de réactivité fine-grained qui évite les re-renders inutiles.

---

## Exercice de compréhension

Avant de passer à la suite, assure-toi de pouvoir répondre à :

1. Quelle est la différence entre `useMemo` et `useCallback` ?
2. Pourquoi la mémoisation peut-elle parfois **ralentir** l'application ?
3. Ce code a-t-il besoin de `useMemo` ?
   ```tsx
   const total = useMemo(() => items.length, [items])
   ```
4. Dans quel cas `useCallback` est-il vraiment utile ?
5. Comment React Compiler change-t-il l'utilisation de ces hooks ?

---

→ [Section suivante : React 19](./04_react19.md)
