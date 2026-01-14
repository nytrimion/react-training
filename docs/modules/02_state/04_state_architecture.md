# Architecture du State

## Introduction

Où placer le state ? C'est une question fondamentale en React. Un mauvais placement cause du prop drilling excessif, des re-renders inutiles, ou une logique éparpillée.

Cette section couvre trois concepts clés :
1. **Lifting State Up** : Remonter le state au parent commun
2. **State Colocation** : Garder le state proche de son usage
3. **Derived State** : Calculer plutôt que dupliquer

---

## Lifting State Up (Remonter le state)

Quand deux composants ont besoin de partager un état, il faut le "remonter" à leur plus proche ancêtre commun.

### Exemple : deux composants qui doivent se synchroniser

```tsx
// ❌ Problème : chaque input a son propre state
function TemperatureConverter() {
  return (
    <div>
      <CelsiusInput />    {/* State interne */}
      <FahrenheitInput /> {/* State interne */}
    </div>
  )
}

// Les deux ne peuvent pas se synchroniser !
```

### Solution : remonter le state

```tsx
// ✅ Le state est dans le parent
function TemperatureConverter() {
  const [celsius, setCelsius] = useState(0)

  const fahrenheit = (celsius * 9/5) + 32

  return (
    <div>
      <CelsiusInput
        value={celsius}
        onChange={setCelsius}
      />
      <FahrenheitInput
        value={fahrenheit}
        onChange={(f) => setCelsius((f - 32) * 5/9)}
      />
    </div>
  )
}

function CelsiusInput({ value, onChange }: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label>
      Celsius:
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
    </label>
  )
}
```

### Quand remonter le state ?

Remonte le state quand :
- Deux composants frères doivent partager des données
- Un composant parent doit connaître l'état d'un enfant
- L'état influence le rendu de plusieurs composants

---

## State Colocation (Garder le state local)

À l'opposé du lifting, la **colocation** consiste à garder le state le plus proche possible de son utilisation.

### Principe

> L'état doit vivre dans le composant le plus bas de l'arbre qui en a besoin.

### Exemple : état trop haut

```tsx
// ❌ Mauvais : l'état de recherche est dans App
function App() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div>
      <Header />
      <SearchBar query={searchQuery} onQueryChange={setSearchQuery} />
      <MainContent />
      <Footer />
    </div>
  )
}

// Chaque changement dans SearchBar re-render TOUT App
```

### Solution : colocaliser

```tsx
// ✅ Bon : l'état est dans SearchBar
function App() {
  return (
    <div>
      <Header />
      <SearchBar />  {/* Gère son propre état */}
      <MainContent />
      <Footer />
    </div>
  )
}

function SearchBar() {
  const [query, setQuery] = useState('')

  return (
    <input
      value={query}
      onChange={e => setQuery(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

### Avantages de la colocation

1. **Performance** : Seul le composant concerné re-render
2. **Maintenabilité** : État et logique sont regroupés
3. **Réutilisabilité** : Le composant est autonome
4. **Simplicité** : Moins de props à passer

### Quand colocaliser vs remonter ?

| Situation | Action |
|-----------|--------|
| Un seul composant utilise le state | Colocaliser |
| Plusieurs composants ont besoin du state | Remonter au parent commun |
| State utilisé dans tout l'app | Context (Module 4) |

---

## Derived State (État dérivé)

L'état dérivé est une valeur **calculée** à partir d'un autre état. Ne le stocke pas dans un state séparé !

### ❌ Anti-pattern : dupliquer l'état

```tsx
function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [completedCount, setCompletedCount] = useState(0)  // ❌ Duplication !

  const addTodo = (todo: Todo) => {
    setTodos([...todos, todo])
    // Oups, j'ai oublié de mettre à jour completedCount !
  }

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ))
    // Il faut aussi recalculer completedCount...
    // Source de bugs !
  }
}
```

### ✅ Pattern : calculer à la volée

```tsx
function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])

  // Calculé à chaque render - toujours correct
  const completedCount = todos.filter(t => t.completed).length
  const pendingCount = todos.length - completedCount

  // Pas besoin de maintenir la synchronisation !
}
```

### Quand c'est coûteux

Si le calcul est vraiment coûteux, utilise `useMemo` (Module 3) :

```tsx
const expensiveValue = useMemo(() => {
  return todos.filter(t => t.completed).length
}, [todos])
```

> **Note** : Avec React Compiler (React 19), cette mémoisation est souvent automatique.

### Règle d'or

> Si une valeur peut être calculée à partir d'un autre state ou props, ce n'est pas un state.

---

## Pattern : Single Source of Truth

Chaque donnée doit avoir **une seule source de vérité**.

### ❌ Plusieurs sources

```tsx
// Le nom est stocké dans DEUX endroits
function UserProfile({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName)  // Copie locale

  // Problème : si initialName change, name ne se met pas à jour
}
```

### ✅ Une seule source

```tsx
// Option 1 : Le parent est la source de vérité
function UserProfile({ name, onNameChange }: {
  name: string
  onNameChange: (name: string) => void
}) {
  // Pas de state local, juste des props
}

// Option 2 : Le composant est la source de vérité
function UserProfile({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName)
  // Le parent ne peut pas changer name après le mount
  // C'est un "state initial", pas une synchronisation
}
```

---

## Pattern : Normalize Complex State

Pour des données relationnelles, normalise comme une base de données :

### ❌ Structure imbriquée

```tsx
const [data, setData] = useState({
  users: [
    {
      id: '1',
      name: 'Alice',
      posts: [
        { id: 'p1', title: 'Hello', comments: [...] }
      ]
    }
  ]
})

// Mettre à jour un commentaire profondément imbriqué = cauchemar
```

### ✅ Structure normalisée

```tsx
const [users, setUsers] = useState<Record<string, User>>({
  '1': { id: '1', name: 'Alice', postIds: ['p1'] }
})

const [posts, setPosts] = useState<Record<string, Post>>({
  'p1': { id: 'p1', title: 'Hello', userId: '1', commentIds: ['c1'] }
})

const [comments, setComments] = useState<Record<string, Comment>>({
  'c1': { id: 'c1', text: 'Great!', postId: 'p1' }
})

// Mettre à jour un commentaire = simple
setComments(prev => ({
  ...prev,
  'c1': { ...prev['c1'], text: 'Updated!' }
}))
```

---

## Analogie avec Vue.js / Pinia

| Concept | Vue/Pinia | React |
|---------|-----------|-------|
| State local | `ref()` | `useState()` |
| State partagé | Pinia store | Lifting + props (ou Context) |
| Computed | `computed()` | Derived state / `useMemo` |
| Store global | Pinia | Context API / Zustand (Module 4) |

### Différence de philosophie

Vue encourage les stores globaux (Pinia) même pour des états simples.
React préfère le **local-first** : commence local, remonte si nécessaire.

---

## Checklist : où placer mon state ?

Pose-toi ces questions dans l'ordre :

1. **Est-ce vraiment un state ?**
   - Peut-il être calculé depuis props ou autre state ? → Derived state
   - Est-il constant ? → Constante hors du composant

2. **Qui en a besoin ?**
   - Un seul composant → State local (`useState`)
   - Composants frères → Remonter au parent commun
   - Sous-arbre entier → Context (Module 4)
   - App entière → Store global (Module 4)

3. **Quelle est la source de vérité ?**
   - Une seule source par donnée
   - Éviter les copies qui peuvent diverger

---

## Exercice de compréhension

1. Tu as un composant `ProductList` et un composant `Cart`. Ils doivent tous les deux connaître les produits sélectionnés. Où placer le state ?

2. Un `Modal` gère son état `isOpen`. Le bouton qui l'ouvre est dans un composant différent. Comment structurer ?

3. Tu stockes `todos` et `completedTodos` dans deux states séparés. Quel est le problème ?

4. Dans quel cas préférer garder le state dans un enfant plutôt que de le remonter ?

---

→ [Section suivante : useReducer](./05_useReducer.md)
