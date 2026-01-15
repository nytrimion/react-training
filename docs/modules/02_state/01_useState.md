# useState en profondeur

## Introduction

`useState` est le hook fondamental de React pour gérer l'état local d'un composant. Contrairement à Vue.js où la réactivité est automatique via `ref()` et `reactive()`, React nécessite une mise à jour explicite de l'état.

---

## Syntaxe de base

```tsx
const [state, setState] = useState<T>(initialValue)
```

- `state` : la valeur actuelle
- `setState` : la fonction pour mettre à jour l'état
- `initialValue` : la valeur initiale (peut être une fonction)

### Exemple simple

```tsx
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  )
}
```

---

## Typage TypeScript

### Inférence automatique

```tsx
// TypeScript infère number
const [count, setCount] = useState(0)

// TypeScript infère string
const [name, setName] = useState('')
```

### Typage explicite

Nécessaire quand la valeur initiale ne représente pas tous les types possibles :

```tsx
// Peut être null initialement
const [user, setUser] = useState<User | null>(null)

// Array vide - TypeScript ne peut pas inférer le type des éléments
const [items, setItems] = useState<string[]>([])

// Union type
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
```

---

## Règle d'or : l'immutabilité

**React ne détecte pas les mutations.** Il compare les références pour savoir si l'état a changé.

### ❌ Mauvais : mutation directe

```tsx
const [user, setUser] = useState({ name: 'Alice', age: 30 })

// NE FONCTIONNE PAS - même référence, React ne re-render pas
user.age = 31
setUser(user)
```

### ✅ Bon : créer un nouvel objet

```tsx
// Spread operator pour créer une copie
setUser({ ...user, age: 31 })

// Ou avec une fonction
setUser(prev => ({ ...prev, age: prev.age + 1 }))
```

### Arrays : les opérations courantes

```tsx
const [items, setItems] = useState<string[]>([])

// Ajouter un élément
setItems([...items, newItem])           // à la fin
setItems([newItem, ...items])           // au début

// Supprimer un élément
setItems(items.filter(item => item !== toRemove))
setItems(items.filter((_, index) => index !== indexToRemove))

// Modifier un élément
setItems(items.map(item =>
  item.id === targetId ? { ...item, updated: true } : item
))

// Trier (ATTENTION : sort() mute !)
setItems([...items].sort())             // copier avant de trier
```

---

## Lazy initialization

Quand la valeur initiale nécessite un calcul coûteux, passe une **fonction** au lieu d'une valeur :

### ❌ Calcul exécuté à chaque render

```tsx
// getExpensiveValue() est appelé à CHAQUE render
const [data, setData] = useState(getExpensiveValue())
```

### ✅ Calcul exécuté une seule fois

```tsx
// La fonction n'est appelée qu'au premier render
const [data, setData] = useState(() => getExpensiveValue())
```

### Cas d'usage typiques

```tsx
// Lecture du localStorage
const [theme, setTheme] = useState(() => {
  const saved = localStorage.getItem('theme')
  return saved ?? 'light'
})

// Calcul initial complexe
const [matrix, setMatrix] = useState(() => createInitialMatrix(size))

// Parsing de données
const [config, setConfig] = useState(() => JSON.parse(configString))
```

---

## Functional updates (mises à jour fonctionnelles)

Quand le nouvel état dépend de l'ancien, utilise une fonction :

### Le problème des "stale closures"

```tsx
function Counter() {
  const [count, setCount] = useState(0)

  const handleClick = () => {
    // Ces 3 appels utilisent la MÊME valeur de count (0)
    setCount(count + 1)  // 0 + 1 = 1
    setCount(count + 1)  // 0 + 1 = 1
    setCount(count + 1)  // 0 + 1 = 1
    // Résultat final : 1 (pas 3 !)
  }
}
```

### La solution : functional update

```tsx
const handleClick = () => {
  // Chaque appel reçoit la valeur la plus récente
  setCount(prev => prev + 1)  // 0 → 1
  setCount(prev => prev + 1)  // 1 → 2
  setCount(prev => prev + 1)  // 2 → 3
  // Résultat final : 3
}
```

### Règle simple

> Si le nouvel état dépend de l'ancien → utilise `prev =>`

```tsx
// ✅ Dépend de l'ancien état
setCount(prev => prev + 1)
setItems(prev => [...prev, newItem])
setUser(prev => ({ ...prev, age: prev.age + 1 }))

// ✅ Valeur indépendante de l'ancien état
setCount(0)
setItems(newItems)
setUser(null)
```

---

## Batching automatique (React 18+)

React 18 regroupe automatiquement plusieurs `setState` en un seul re-render :

```tsx
function handleClick() {
  setCount(c => c + 1)    // Ne déclenche pas de render
  setFlag(f => !f)        // Ne déclenche pas de render
  setName('Alice')        // Ne déclenche pas de render
  // Un SEUL render à la fin
}
```

### Ça fonctionne partout

```tsx
// ✅ Dans les event handlers
onClick={() => {
  setA(1)
  setB(2)  // Batched
}}

// ✅ Dans les Promises
fetch(url).then(() => {
  setA(1)
  setB(2)  // Batched (nouveau en React 18)
})

// ✅ Dans setTimeout
setTimeout(() => {
  setA(1)
  setB(2)  // Batched (nouveau en React 18)
}, 1000)
```

### Forcer un render immédiat (rare)

```tsx
import { flushSync } from 'react-dom'

function handleClick() {
  flushSync(() => {
    setCount(c => c + 1)
  })
  // Le DOM est mis à jour ICI

  flushSync(() => {
    setFlag(f => !f)
  })
  // Le DOM est mis à jour ICI
}
```

> ⚠️ `flushSync` est rarement nécessaire. Son usage principal : intégration avec du code non-React.

---

## Analogie Vue.js

| Vue.js | React | Notes |
|--------|-------|-------|
| `const count = ref(0)` | `const [count, setCount] = useState(0)` | |
| `count.value++` | `setCount(c => c + 1)` | Pas de `.value` en React |
| `count.value = 5` | `setCount(5)` | |
| Réactivité automatique | Re-render explicite | Philosophie différente |
| `watch()` | `useEffect()` (Module 3) | |

### Différence fondamentale

```vue
<!-- Vue : mutation directe -->
<script setup>
const user = reactive({ name: 'Alice', age: 30 })
user.age++  // Fonctionne, Vue détecte la mutation
</script>
```

```tsx
// React : immutabilité obligatoire
const [user, setUser] = useState({ name: 'Alice', age: 30 })
// user.age++  // ❌ Ne déclenche pas de re-render
setUser(prev => ({ ...prev, age: prev.age + 1 }))  // ✅
```

---

## Anti-patterns courants

### 1. État dérivé inutile

```tsx
// ❌ Mauvais : duplication de l'état
const [items, setItems] = useState<Item[]>([])
const [count, setCount] = useState(0)

// À chaque ajout, il faut maintenir les deux en sync
const addItem = (item: Item) => {
  setItems([...items, item])
  setCount(count + 1)  // Facile d'oublier !
}

// ✅ Bon : état dérivé calculé
const [items, setItems] = useState<Item[]>([])
const count = items.length  // Toujours synchronisé
```

### 2. État dans le mauvais composant

```tsx
// ❌ Mauvais : état trop haut
function App() {
  const [inputValue, setInputValue] = useState('')  // Utilisé que dans SearchBar
  return <SearchBar value={inputValue} onChange={setInputValue} />
}

// ✅ Bon : état colocalisé
function App() {
  return <SearchBar />  // L'état est DANS SearchBar
}

function SearchBar() {
  const [inputValue, setInputValue] = useState('')
  // ...
}
```

### 3. Oublier le functional update

```tsx
// ❌ Bug subtil avec événements rapides
const handleIncrement = () => setCount(count + 1)

// Si l'utilisateur clique très vite, certains clics sont "perdus"
// car count a toujours la même valeur dans la closure

// ✅ Toujours fiable
const handleIncrement = () => setCount(prev => prev + 1)
```

---

## Exercice de compréhension

Avant de passer à la suite, assure-toi de pouvoir répondre à :

1. Pourquoi `user.name = 'Bob'; setUser(user)` ne déclenche pas de re-render ?
2. Quelle est la différence entre `useState(getValue())` et `useState(() => getValue())` ?
3. Dans quel cas `setCount(count + 1)` et `setCount(c => c + 1)` donnent des résultats différents ?
4. Combien de re-renders sont déclenchés par ce code ?
   ```tsx
   setA(1)
   setB(2)
   setC(3)
   ```

---

→ [Section suivante : Événements](./02_events.md)
