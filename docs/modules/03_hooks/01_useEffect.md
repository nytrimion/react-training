# useEffect en profondeur

## Introduction

`useEffect` est probablement le hook le plus mal compris de React. Contrairement à ce que son nom suggère, ce n'est **pas** un hook de "lifecycle" comme `onMounted()` en Vue.js. C'est un hook de **synchronisation** avec des systèmes externes.

> **Mental model clé** : useEffect synchronise ton composant avec quelque chose en dehors de React (API, DOM, WebSocket, timer, etc.)

---

## Syntaxe de base

```tsx
useEffect(() => {
  // Effect code
  return () => {
    // Cleanup code (optionnel)
  }
}, [dependencies])
```

- **Effect** : le code à exécuter
- **Cleanup** : le code de nettoyage (optionnel)
- **Dependencies** : tableau des valeurs dont l'effect dépend

---

## Les trois cas d'usage

### 1. Effect à chaque render (rare)

```tsx
useEffect(() => {
  console.log('Après chaque render')
})
// Pas de tableau de dépendances = exécuté à chaque render
```

> ⚠️ Rarement utile. Si tu as besoin de ça, repense ton architecture.

### 2. Effect au montage uniquement

```tsx
useEffect(() => {
  console.log('Composant monté')

  return () => {
    console.log('Composant démonté')
  }
}, [])
// Tableau vide = exécuté une seule fois au montage
```

**Analogie Vue.js** :
```vue
<script setup>
onMounted(() => console.log('Composant monté'))
onUnmounted(() => console.log('Composant démonté'))
</script>
```

### 3. Effect quand des valeurs changent

```tsx
useEffect(() => {
  console.log(`L'utilisateur a changé : ${user.name}`)
}, [user])
// Exécuté au montage ET quand user change
```

**Analogie Vue.js** :
```vue
<script setup>
watch(user, (newUser) => {
  console.log(`L'utilisateur a changé : ${newUser.name}`)
}, { immediate: true })  // immediate = comme useEffect
</script>
```

---

## Le cleanup : pourquoi c'est crucial

Le cleanup est appelé :
1. **Avant** chaque ré-exécution de l'effect
2. **Au démontage** du composant

### Exemple : abonnement WebSocket

```tsx
function ChatRoom({ roomId }: { roomId: string }) {
  useEffect(() => {
    const connection = createConnection(roomId)
    connection.connect()

    return () => {
      connection.disconnect()  // Cleanup !
    }
  }, [roomId])
}
```

**Séquence d'événements** :
1. Mount avec `roomId = "general"` → connect to "general"
2. `roomId` change à `"random"` → **disconnect from "general"**, puis connect to "random"
3. Unmount → disconnect from "random"

### Exemple : timer

```tsx
function Timer() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCount(c => c + 1)
    }, 1000)

    return () => clearInterval(intervalId)  // CRUCIAL !
  }, [])
}
```

Sans cleanup, le timer continuerait même après le démontage → fuite mémoire.

---

## Le tableau de dépendances

### Règle d'or

> Toutes les valeurs réactives utilisées dans l'effect doivent être dans le tableau.

```tsx
useEffect(() => {
  // userId est utilisé → doit être dans les deps
  fetchUser(userId).then(setUser)
}, [userId])  // ✅
```

### ESLint exhaustive-deps

L'extension ESLint `react-hooks/exhaustive-deps` vérifie automatiquement :

```tsx
// ❌ ESLint warning : 'userId' is missing in the dependency array
useEffect(() => {
  fetchUser(userId)
}, [])

// ✅ Correct
useEffect(() => {
  fetchUser(userId)
}, [userId])
```

### Que mettre dans les dépendances ?

| Mettre | Ne pas mettre |
|--------|---------------|
| Props | Fonctions stables (setState, dispatch) |
| State | Refs (useRef) |
| Valeurs dérivées de props/state | Constantes hors du composant |
| Fonctions définies dans le composant | |

```tsx
function Component({ userId }: { userId: string }) {
  const [data, setData] = useState(null)
  const API_URL = 'https://api.example.com'  // Constante → pas besoin

  useEffect(() => {
    fetch(`${API_URL}/users/${userId}`)
      .then(res => res.json())
      .then(setData)  // setData est stable → pas besoin
  }, [userId])  // Seul userId est nécessaire
}
```

---

## Race conditions et fetch

### Le problème

```tsx
// ❌ Race condition possible
useEffect(() => {
  fetchUser(userId).then(setUser)
}, [userId])
```

**Scénario problématique** :
1. userId = 1 → fetch commence
2. userId = 2 → nouveau fetch commence
3. Réponse pour userId=2 arrive (rapide)
4. Réponse pour userId=1 arrive (lente) → **ÉCRASE la bonne donnée !**

### La solution : flag d'annulation

```tsx
useEffect(() => {
  let ignore = false

  fetchUser(userId).then(user => {
    if (!ignore) {
      setUser(user)
    }
  })

  return () => {
    ignore = true  // Ignore les réponses après cleanup
  }
}, [userId])
```

### La solution moderne : AbortController

```tsx
useEffect(() => {
  const controller = new AbortController()

  fetch(`/api/users/${userId}`, {
    signal: controller.signal
  })
    .then(res => res.json())
    .then(setUser)
    .catch(err => {
      if (err.name !== 'AbortError') {
        setError(err)
      }
    })

  return () => controller.abort()
}, [userId])
```

---

## Patterns courants

### 1. Synchroniser avec le titre du document

```tsx
function Page({ title }: { title: string }) {
  useEffect(() => {
    document.title = title
  }, [title])
}
```

### 2. Écouter des événements window

```tsx
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }

    handleResize()  // Valeur initiale
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}
```

### 3. Synchroniser avec localStorage

```tsx
function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : initialValue
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}
```

### 4. Focus automatique au montage

```tsx
function SearchInput() {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return <input ref={inputRef} />
}
```

---

## Anti-patterns à éviter

### 1. ❌ Mettre à jour le state basé sur props

```tsx
// ❌ Mauvais : synchronisation inutile
function Profile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(getUserById(userId))  // ❌ Effect pour calculer
  }, [userId])
}

// ✅ Bon : calcul direct
function Profile({ userId }: { userId: string }) {
  const user = getUserById(userId)  // Calculé à chaque render
}
```

### 2. ❌ Effect pour dériver du state

```tsx
// ❌ Mauvais : state dérivé dans un effect
const [items, setItems] = useState<Item[]>([])
const [total, setTotal] = useState(0)

useEffect(() => {
  setTotal(items.reduce((sum, item) => sum + item.price, 0))
}, [items])

// ✅ Bon : calcul direct
const [items, setItems] = useState<Item[]>([])
const total = items.reduce((sum, item) => sum + item.price, 0)
```

### 3. ❌ Effect pour transformer des props

```tsx
// ❌ Mauvais
function List({ items }: { items: Item[] }) {
  const [sortedItems, setSortedItems] = useState<Item[]>([])

  useEffect(() => {
    setSortedItems([...items].sort(byName))
  }, [items])
}

// ✅ Bon
function List({ items }: { items: Item[] }) {
  const sortedItems = useMemo(
    () => [...items].sort(byName),
    [items]
  )
}
```

### 4. ❌ Effect pour des event handlers

```tsx
// ❌ Mauvais : effect qui écoute un state pour agir
const [submitting, setSubmitting] = useState(false)

useEffect(() => {
  if (submitting) {
    submitForm()
  }
}, [submitting])

// ✅ Bon : action directe dans l'event handler
const handleSubmit = () => {
  submitForm()
}
```

---

## Quand utiliser useEffect ?

Utilise `useEffect` uniquement pour **synchroniser** avec des systèmes **externes** :

| ✅ Utiliser useEffect | ❌ Ne PAS utiliser useEffect |
|----------------------|------------------------------|
| Fetch API | Calculs dérivés du state |
| WebSocket | Transformer des props |
| Event listeners (window, document) | Réagir à un changement de state |
| Timer / interval | Initialiser du state |
| DOM manipulation directe | Logique d'event handler |
| Analytics tracking | |

### La règle

> Si tu peux le faire sans useEffect, fais-le sans useEffect.

---

## Comparaison Vue.js

| Vue.js | React | Notes |
|--------|-------|-------|
| `onMounted()` | `useEffect(() => {}, [])` | Montage uniquement |
| `onUnmounted()` | Return dans `useEffect` | Nettoyage |
| `watch(x, fn)` | `useEffect(fn, [x])` | Réaction aux changements |
| `watchEffect()` | `useEffect(() => {})` | Sans deps explicites |
| `watch(x, fn, { immediate: true })` | `useEffect(fn, [x])` | React est toujours "immediate" |

### Différence philosophique

**Vue.js** : `watch` et `watchEffect` sont pour "réagir" aux changements.

**React** : `useEffect` est pour "synchroniser" avec l'extérieur. Les "réactions" aux changements devraient être dans les event handlers ou dans le rendu lui-même.

---

## Exercice de compréhension

Avant de passer à la suite, assure-toi de pouvoir répondre à :

1. Pourquoi dit-on que `useEffect` n'est pas un lifecycle hook ?
2. Dans quel ordre sont appelés effect et cleanup quand une dépendance change ?
3. Pourquoi est-ce important d'avoir un flag `ignore` dans un fetch ?
4. Ce code a-t-il un problème ?
   ```tsx
   useEffect(() => {
     setFilteredItems(items.filter(i => i.active))
   }, [items])
   ```
5. Comment ferais-tu un cleanup pour un `setInterval` ?

---

→ [Section suivante : useRef](./02_useRef.md)
