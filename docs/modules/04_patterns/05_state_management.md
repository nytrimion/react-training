# State Management externe : Zustand & Jotai

## Introduction

Context API est parfait pour du state qui change rarement (thème, auth, locale). Mais quand le state devient complexe, change fréquemment, ou doit être partagé entre des parties éloignées de l'app, les limites de Context apparaissent. C'est là qu'interviennent les librairies de state management.

> **Analogie Vue.js** : Zustand et Jotai sont à React ce que **Pinia** est à Vue.js — des solutions de state management externe légères et typées. La différence : elles ne nécessitent pas de Provider.

---

## Pourquoi sortir de Context ?

| Limite de Context | Impact |
|---|---|
| Pas de sélecteur | Tous les consommateurs re-rendent, même si seule une partie du state change |
| Pas de middleware | Pas de logging, persistence, ou devtools intégrés |
| Boilerplate | Context + Provider + hook + types pour chaque contexte |
| Performance | Le context splitting multiplie les Providers |
| Pas de state en dehors de React | Impossible d'accéder au state dans un event handler non-React |

---

## Zustand : la simplicité

### Philosophie

Zustand (allemand pour "état") est minimaliste : un store = une fonction, pas de Provider, pas de boilerplate.

### Installation

```bash
pnpm add zustand
```

### Créer un store

```tsx
import { create } from 'zustand'

interface CounterStore {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

const useCounterStore = create<CounterStore>((set) => ({
  // State initial
  count: 0,

  // Actions (modifient le state)
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}))
```

> **Point clé** : `set` fait un **shallow merge** (comme `setState` de classe). Pas besoin de spreader tout le state : `set({ count: 0 })` ne touche pas les autres propriétés.

### Utiliser le store

```tsx
function Counter() {
  // Sélecteur : ne re-rend QUE quand count change
  const count = useCounterStore((state) => state.count)
  const increment = useCounterStore((state) => state.increment)

  return <button onClick={increment}>{count}</button>
}
```

### Sélecteurs : la clé de la performance

```tsx
// MAL : sélectionne tout le store → re-rend à chaque changement
const store = useCounterStore()

// BIEN : sélecteur granulaire → re-rend uniquement quand count change
const count = useCounterStore((state) => state.count)

// BIEN : sélectionner plusieurs valeurs avec un sélecteur dérivé
const { count, total } = useCounterStore((state) => ({
  count: state.count,
  total: state.items.length,
}))
// ⚠️ Attention : cet objet est recréé à chaque render → re-render à chaque fois
// Solution : useShallow
import { useShallow } from 'zustand/react/shallow'

const { count, total } = useCounterStore(
  useShallow((state) => ({
    count: state.count,
    total: state.items.length,
  }))
)
```

> **Différence avec Context** : avec Context, TOUS les consommateurs re-rendent quand la valeur change. Avec Zustand, seuls les composants dont le sélecteur retourne une valeur différente re-rendent. C'est une différence majeure en performance.

---

### Store complexe : TodoList

```tsx
import { create } from 'zustand'

interface Todo {
  id: string
  text: string
  completed: boolean
}

type Filter = 'all' | 'active' | 'completed'

interface TodoStore {
  todos: Todo[]
  filter: Filter

  // Actions
  addTodo: (text: string) => void
  toggleTodo: (id: string) => void
  removeTodo: (id: string) => void
  setFilter: (filter: Filter) => void
}

const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  filter: 'all',

  addTodo: (text) =>
    set((state) => ({
      todos: [
        ...state.todos,
        { id: crypto.randomUUID(), text, completed: false },
      ],
    })),

  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    })),

  removeTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    })),

  setFilter: (filter) => set({ filter }),
}))
```

### Sélecteurs dérivés (computed)

Zustand n'a pas de concept natif de "computed" comme Pinia. On utilise des sélecteurs :

```tsx
// Sélecteur dérivé : filtrer les todos
function useFilteredTodos() {
  return useTodoStore((state) => {
    switch (state.filter) {
      case 'active':
        return state.todos.filter((t) => !t.completed)
      case 'completed':
        return state.todos.filter((t) => t.completed)
      default:
        return state.todos
    }
  })
}

// Sélecteur dérivé : statistiques
function useTodoStats() {
  return useTodoStore((state) => ({
    total: state.todos.length,
    active: state.todos.filter((t) => !t.completed).length,
    completed: state.todos.filter((t) => t.completed).length,
  }))
}
```

---

### Middleware Zustand

#### Persist : sauvegarde automatique

```tsx
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useTodoStore = create<TodoStore>()(
  persist(
    (set) => ({
      todos: [],
      filter: 'all',
      // ... actions
    }),
    {
      name: 'todo-store', // clé localStorage
      // Optionnel : ne persister qu'une partie du state
      partialize: (state) => ({ todos: state.todos }),
    }
  )
)
```

#### Devtools : debugging

```tsx
import { devtools } from 'zustand/middleware'

const useTodoStore = create<TodoStore>()(
  devtools(
    persist(
      (set) => ({
        // ... state et actions
      }),
      { name: 'todo-store' }
    ),
    { name: 'TodoStore' }  // nom dans Redux DevTools
  )
)
```

> **Astuce** : installe l'extension Redux DevTools dans ton navigateur. Zustand est compatible nativement.

#### Combiner les middlewares

```tsx
// L'ordre est important : devtools wrape persist qui wrape le store
const useStore = create<State>()(
  devtools(
    persist(
      (set, get) => ({
        // ...
      }),
      { name: 'storage-key' }
    ),
    { name: 'DevToolsName' }
  )
)
```

---

### Accès au store hors React

Avantage unique de Zustand : accéder au state **en dehors** de composants React :

```tsx
// Dans un fichier utilitaire, un event handler, etc.
const currentTodos = useTodoStore.getState().todos

// S'abonner aux changements
const unsubscribe = useTodoStore.subscribe((state) => {
  console.log('Todos changed:', state.todos)
})

// Modifier le state depuis n'importe où
useTodoStore.getState().addTodo('New todo')
```

---

## Jotai : l'approche atomique

### Philosophie

Jotai (japonais pour "état") adopte une approche **bottom-up** : au lieu d'un store monolithique, chaque morceau de state est un **atome** indépendant. Les atomes peuvent être composés pour créer des états dérivés.

### Installation

```bash
pnpm add jotai
```

### Atomes primitifs

```tsx
import { atom, useAtom } from 'jotai'

// Définir des atomes (en dehors des composants)
const countAtom = atom(0)
const nameAtom = atom('World')

// Utiliser dans un composant
function Counter() {
  const [count, setCount] = useAtom(countAtom)
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>
}

function Greeting() {
  const [name] = useAtom(nameAtom)
  return <p>Hello, {name}!</p>
}
```

> **Analogie** : un atome Jotai est comme un `ref()` global en Vue.js, ou comme un `useState` partagé entre composants.

### Atomes dérivés (computed)

```tsx
// Atome en lecture seule : dérivé d'autres atomes
const doubleCountAtom = atom((get) => get(countAtom) * 2)

// Atome en lecture-écriture
const uppercaseNameAtom = atom(
  (get) => get(nameAtom).toUpperCase(),          // getter
  (get, set, newName: string) => {                // setter
    set(nameAtom, newName.toLowerCase())
  }
)

function Display() {
  const [doubleCount] = useAtom(doubleCountAtom)  // re-rend seulement quand countAtom change
  return <p>Double: {doubleCount}</p>
}
```

### TodoList avec Jotai

```tsx
import { atom, useAtom } from 'jotai'

interface Todo {
  id: string
  text: string
  completed: boolean
}

type Filter = 'all' | 'active' | 'completed'

// Atomes primitifs
const todosAtom = atom<Todo[]>([])
const filterAtom = atom<Filter>('all')

// Atomes dérivés
const filteredTodosAtom = atom((get) => {
  const todos = get(todosAtom)
  const filter = get(filterAtom)

  switch (filter) {
    case 'active':
      return todos.filter((t) => !t.completed)
    case 'completed':
      return todos.filter((t) => t.completed)
    default:
      return todos
  }
})

const todoStatsAtom = atom((get) => {
  const todos = get(todosAtom)
  return {
    total: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  }
})

// Atomes d'actions (write-only)
const addTodoAtom = atom(null, (get, set, text: string) => {
  set(todosAtom, (prev) => [
    ...prev,
    { id: crypto.randomUUID(), text, completed: false },
  ])
})

const toggleTodoAtom = atom(null, (get, set, id: string) => {
  set(todosAtom, (prev) =>
    prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
  )
})
```

---

## Zustand vs Jotai vs Context

| Critère | Context | Zustand | Jotai |
|---|---|---|---|
| **Philosophie** | Top-down, DI | Store unique | Atomes composables |
| **Provider requis** | Oui | Non | Optionnel |
| **Sélecteurs** | Non | Oui | Natif (atomes) |
| **Re-renders** | Tous les consommateurs | Sélecteur-based | Atome-based |
| **Middleware** | Non | persist, devtools, immer | Extensions (atomWithStorage) |
| **Boilerplate** | Élevé | Faible | Très faible |
| **Debugging** | React DevTools | Redux DevTools | Jotai DevTools |
| **Hors React** | Non | Oui | Non |
| **Courbe d'apprentissage** | Faible | Faible | Moyenne |
| **Taille bundle** | 0 (natif) | ~1.5 kB | ~2 kB |
| **Analogie Pinia** | provide/inject | defineStore() | Pas d'équivalent direct |

### Arbre de décision

```
Quel state management utiliser ?
│
├── State change rarement (theme, auth, locale)
│   └── Context API ✅
│
├── State complexe, change souvent, partagé globalement
│   ├── Un store centralisé avec actions claires → Zustand ✅
│   └── State fragmenté, beaucoup de valeurs indépendantes → Jotai ✅
│
├── State local à un composant / feature
│   └── useState / useReducer ✅
│
└── State serveur (données API, cache)
    └── TanStack Query / SWR ✅ (pas un state manager)
```

---

## Bonnes pratiques

### 1. Ne pas sur-utiliser le state global

```tsx
// MAL : tout dans le store global
const useAppStore = create((set) => ({
  isModalOpen: false,        // ← state local !
  searchQuery: '',           // ← state local !
  selectedUser: null,        // ← peut-être local
  users: [],                 // ← OK si partagé
  theme: 'light',            // ← OK, global
}))

// BIEN : state local quand c'est local
function UserSearch() {
  const [query, setQuery] = useState('')         // local
  const users = useUserStore((s) => s.users)     // global
  // ...
}
```

### 2. Séparer les stores par domaine

```tsx
// Un store par domaine fonctionnel
const useAuthStore = create<AuthStore>(/* ... */)
const useTodoStore = create<TodoStore>(/* ... */)
const useCartStore = create<CartStore>(/* ... */)
// PAS un mega-store qui contient tout
```

### 3. Actions dans le store, pas dans les composants

```tsx
// MAL : logique dans le composant
function TodoItem({ id }: { id: string }) {
  const todos = useTodoStore((s) => s.todos)
  const setTodos = useTodoStore((s) => s.setTodos)

  const toggle = () => {
    setTodos(todos.map((t) => t.id === id ? { ...t, done: !t.done } : t))
  }
  // ...
}

// BIEN : logique dans le store
function TodoItem({ id }: { id: string }) {
  const toggle = useTodoStore((s) => s.toggleTodo)
  return <button onClick={() => toggle(id)}>Toggle</button>
}
```

---

## Résumé

| Concept | Détail |
|---|---|
| **Zustand** | Store unique, simple, sélecteurs, middleware, accès hors React |
| **Jotai** | Atomes composables, bottom-up, très granulaire |
| **Sélecteurs** | Clé de la performance : ne sélectionner que ce dont on a besoin |
| **persist** | Middleware Zustand pour localStorage automatique |
| **devtools** | Compatible Redux DevTools |
| **Règle d'or** | State local → useState. State global rare → Context. State global fréquent → Zustand/Jotai |

---

→ Prochain cours : [Clean Architecture](./06_clean_architecture.md)
→ [Exercices du module](./exercises.md)
