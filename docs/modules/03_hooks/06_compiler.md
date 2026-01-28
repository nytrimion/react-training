# React Compiler

## Introduction

Le **React Compiler** (anciennement React Forget) est un compilateur qui transforme automatiquement ton code React pour l'optimiser. Il **mémoïse automatiquement** les composants, valeurs et callbacks.

> **Note** : Ce projet utilise déjà le React Compiler via `babel-plugin-react-compiler`.

---

## Qu'est-ce que le React Compiler ?

### Le problème qu'il résout

En React standard, les composants re-render quand leur parent re-render, même si leurs props n'ont pas changé :

```tsx
function Parent() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      <ExpensiveChild />  {/* Re-render à chaque click ! */}
    </div>
  )
}
```

### La solution manuelle

```tsx
// Sans React Compiler
const ExpensiveChild = memo(function ExpensiveChild() {
  return <HeavyContent />
})

function Parent() {
  const [count, setCount] = useState(0)

  // useCallback pour éviter de recréer handleClick
  const handleClick = useCallback(() => {
    doSomething()
  }, [])

  // useMemo pour éviter de recréer config
  const config = useMemo(() => ({ theme: 'dark' }), [])

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      <ExpensiveChild onClick={handleClick} config={config} />
    </div>
  )
}
```

### La solution avec React Compiler

```tsx
// Avec React Compiler - code simple, optimisations automatiques
function Parent() {
  const [count, setCount] = useState(0)

  const handleClick = () => {
    doSomething()
  }

  const config = { theme: 'dark' }

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      <ExpensiveChild onClick={handleClick} config={config} />
    </div>
  )
}

function ExpensiveChild({ onClick, config }) {
  return <HeavyContent onClick={onClick} config={config} />
}
```

Le compilateur ajoute automatiquement la mémoisation nécessaire.

---

## Comment ça fonctionne ?

### Analyse statique

Le compilateur analyse ton code et identifie :

1. **Les valeurs qui changent** (dépendent du state/props)
2. **Les valeurs stables** (ne dépendent de rien de réactif)
3. **Les dépendances** entre valeurs

### Transformation du code

Le compilateur transforme :

```tsx
// Code source
function Component({ items }) {
  const filtered = items.filter(i => i.active)
  const total = filtered.reduce((sum, i) => sum + i.value, 0)

  return <Display items={filtered} total={total} />
}
```

En quelque chose comme :

```tsx
// Code compilé (simplifié)
function Component({ items }) {
  const $cache = useMemoCache(4)

  let filtered
  if ($cache[0] !== items) {
    filtered = items.filter(i => i.active)
    $cache[0] = items
    $cache[1] = filtered
  } else {
    filtered = $cache[1]
  }

  let total
  if ($cache[2] !== filtered) {
    total = filtered.reduce((sum, i) => sum + i.value, 0)
    $cache[2] = filtered
    $cache[3] = total
  } else {
    total = $cache[3]
  }

  return <Display items={filtered} total={total} />
}
```

---

## Ce que le compilateur optimise

### ✅ Optimisé automatiquement

| Avant | Après |
|-------|-------|
| Valeurs calculées | Mémoïsées automatiquement |
| Callbacks inline | Stabilisés |
| Objets/arrays créés dans le render | Mémoïsés |
| Composants | Mémoïsés (équivalent à `memo()`) |

### Exemples

```tsx
// Le compilateur optimise TOUT cela automatiquement

function Component({ data, userId }) {
  // Valeur calculée → mémoïsée
  const processed = processData(data)

  // Callback → stabilisé
  const handleClick = () => {
    saveData(userId)
  }

  // Objet → mémoïsé
  const style = { color: 'red', fontSize: 16 }

  // Array → mémoïsé
  const items = [1, 2, 3]

  return (
    <Child
      data={processed}
      onClick={handleClick}
      style={style}
      items={items}
    />
  )
}
```

---

## Les règles à respecter

Le React Compiler suppose que ton code suit les **règles de React**. Si ce n'est pas le cas, les optimisations peuvent causer des bugs.

### Règle 1 : Composants purs

Les composants doivent être des **fonctions pures** par rapport à leurs props :

```tsx
// ✅ Pur - même props = même rendu
function Greeting({ name }) {
  return <h1>Hello, {name}</h1>
}

// ❌ Impur - dépend de quelque chose d'extérieur
let counter = 0
function Greeting({ name }) {
  counter++  // Side effect pendant le render !
  return <h1>Hello, {name} (render #{counter})</h1>
}
```

### Règle 2 : Pas de mutation de props/state

```tsx
// ❌ Mutation de props
function Component({ items }) {
  items.push(newItem)  // NE JAMAIS FAIRE ÇA
}

// ✅ Créer une nouvelle valeur
function Component({ items }) {
  const newItems = [...items, newItem]
}
```

### Règle 3 : Hooks au top level

```tsx
// ❌ Hook conditionnel
function Component({ condition }) {
  if (condition) {
    const [state, setState] = useState(0)  // Erreur !
  }
}

// ✅ Toujours au top level
function Component({ condition }) {
  const [state, setState] = useState(0)
}
```

### Règle 4 : Ne pas lire les refs pendant le render

```tsx
// ❌ Lecture de ref pendant le render
function Component() {
  const ref = useRef(0)
  return <div>{ref.current}</div>  // Problème !
}

// ✅ Lecture dans un effect ou event handler
function Component() {
  const ref = useRef(0)

  useEffect(() => {
    console.log(ref.current)  // OK
  })

  const handleClick = () => {
    console.log(ref.current)  // OK
  }

  return <div onClick={handleClick}>Click me</div>
}
```

---

## Vérifier que le compilateur fonctionne

### React DevTools

Les React DevTools montrent un badge "Memo ✨" sur les composants optimisés par le compilateur.

### Inspecting the output

Tu peux voir le code compilé avec :

```bash
npx babel src/components/MyComponent.tsx
```

### Directive d'exclusion

Si un composant ne suit pas les règles, tu peux le marquer :

```tsx
'use no memo'

function LegacyComponent() {
  // Ce composant n'est pas optimisé par le compilateur
}
```

---

## Quand utiliser useMemo/useCallback malgré le compilateur ?

Le compilateur gère **la plupart** des cas, mais parfois tu veux un contrôle explicite :

### 1. Dépendances intentionnellement réduites

```tsx
// Tu veux explicitement ignorer certaines deps
const handleClick = useCallback(() => {
  // Utilise latestValue.current pour éviter les recréations
  console.log(latestValue.current)
}, [])  // Aucune dépendance intentionnellement
```

### 2. Mémoisation avec comparaison personnalisée

```tsx
const memoizedValue = useMemo(() => {
  return expensiveCalculation(input)
}, [input?.id])  // Compare seulement l'ID, pas l'objet entier
```

### 3. Code legacy qui ne suit pas les règles

```tsx
'use no memo'

function LegacyComponent() {
  // Code qui mute des objets, etc.
  // Utilise useMemo/useCallback manuellement ici
}
```

---

## Impact sur les pratiques

### Ce qui change

| Avant (sans Compiler) | Après (avec Compiler) |
|-----------------------|-----------------------|
| `useMemo` partout | Écrire du code simple |
| `useCallback` partout | Écrire du code simple |
| `memo()` sur les composants | Pas nécessaire |
| Réfléchir aux dépendances | Le compilateur gère |

### Ce qui ne change PAS

| Concept | Toujours nécessaire ? |
|---------|----------------------|
| `useState` | ✅ Oui |
| `useReducer` | ✅ Oui |
| `useEffect` | ✅ Oui |
| `useRef` | ✅ Oui |
| Immutabilité | ✅ Plus que jamais ! |
| Règles des hooks | ✅ Plus que jamais ! |

---

## Configuration dans ce projet

Le React Compiler est configuré dans `next.config.ts` :

```ts
// next.config.ts
const nextConfig = {
  experimental: {
    reactCompiler: true,
  },
}
```

Et le plugin Babel est installé :

```json
// package.json
{
  "devDependencies": {
    "babel-plugin-react-compiler": "..."
  }
}
```

---

## Debugging du compilateur

### Console warnings

Le compilateur peut émettre des warnings s'il détecte du code problématique :

```
Warning: React Compiler has skipped optimizing this component
because it could not safely determine the dependencies of this hook call.
```

### ESLint plugin

Il existe un plugin ESLint pour détecter les violations :

```bash
pnpm add -D eslint-plugin-react-compiler
```

```js
// eslint.config.mjs
import reactCompiler from 'eslint-plugin-react-compiler'

export default [
  {
    plugins: {
      'react-compiler': reactCompiler,
    },
    rules: {
      'react-compiler/react-compiler': 'error',
    },
  },
]
```

---

## Comparaison Vue.js

| Aspect | Vue.js | React (avec Compiler) |
|--------|--------|----------------------|
| Réactivité | Fine-grained (Proxy) | Compilateur + mémoisation |
| Computed | Automatique | Automatique (compilateur) |
| Méthodes stables | Automatique | Automatique (compilateur) |
| Détection mutations | ✅ Runtime | ❌ Doit être immutable |

Vue.js utilise des **Proxies** pour détecter les mutations au runtime.
React Compiler utilise l'**analyse statique** au build time, donc il faut respecter l'immutabilité.

---

## Points clés à retenir

1. **Écris du code simple** - Le compilateur optimise pour toi
2. **Respecte les règles React** - Pureté, immutabilité, hooks au top level
3. **Ne mute jamais** - C'est encore plus important avec le compilateur
4. **Vérifie les DevTools** - Le badge "Memo ✨" confirme l'optimisation
5. **useMemo/useCallback** - Rarement nécessaires maintenant

---

## Exercice de compréhension

Avant de passer à la suite, assure-toi de pouvoir répondre à :

1. Qu'est-ce que le React Compiler optimise automatiquement ?
2. Pourquoi l'immutabilité est-elle encore plus importante avec le compilateur ?
3. Quand aurais-tu encore besoin d'utiliser `useMemo` explicitement ?
4. Comment vérifier qu'un composant est bien optimisé par le compilateur ?
5. Ce code fonctionnera-t-il correctement avec le compilateur ?
   ```tsx
   function Counter() {
     const ref = useRef(0)
     ref.current++
     return <div>{ref.current}</div>
   }
   ```

---

→ [Section suivante : Testing async](./07_testing.md)
