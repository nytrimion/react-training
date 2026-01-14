# useReducer

## Introduction

`useReducer` est une alternative à `useState` pour gérer des états complexes. Il s'inspire du pattern Redux et ressemble au concept de **reducers** fonctionnels.

Pour un développeur habitué au DDD et CQRS, `useReducer` sera familier : les **actions** sont comme des **commands**, et le reducer est une fonction pure qui produit un nouvel état.

---

## Syntaxe de base

```tsx
const [state, dispatch] = useReducer(reducer, initialState)
```

- `state` : l'état actuel
- `dispatch` : fonction pour envoyer des actions
- `reducer` : fonction `(state, action) => newState`
- `initialState` : état initial

### Exemple minimal

```tsx
type State = { count: number }
type Action = { type: 'increment' } | { type: 'decrement' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 }
    case 'decrement':
      return { count: state.count - 1 }
    default:
      return state
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 })

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </div>
  )
}
```

---

## Anatomie d'un reducer

### Le reducer est une fonction pure

```tsx
function reducer(state: State, action: Action): State {
  // 1. Ne JAMAIS muter state directement
  // 2. Toujours retourner un nouvel objet
  // 3. Pas d'effets de bord (API calls, localStorage, etc.)
}
```

### Structure typique

```tsx
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ACTION_1':
      return { ...state, /* modifications */ }
    case 'ACTION_2':
      return { ...state, /* modifications */ }
    default:
      // Option 1 : retourner state inchangé
      return state
      // Option 2 : throw pour détecter les erreurs (recommandé en TS)
      // throw new Error(`Unknown action: ${action.type}`)
  }
}
```

---

## Typage TypeScript des actions

### Pattern : Discriminated Unions

C'est LE pattern pour typer les actions correctement :

```tsx
// Chaque action a un type littéral unique
type Action =
  | { type: 'ADD_TODO'; payload: { text: string } }
  | { type: 'TOGGLE_TODO'; payload: { id: string } }
  | { type: 'DELETE_TODO'; payload: { id: string } }
  | { type: 'CLEAR_COMPLETED' }  // Pas de payload

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TODO':
      // TypeScript sait que action.payload.text existe ici
      return {
        ...state,
        todos: [...state.todos, { id: crypto.randomUUID(), text: action.payload.text, completed: false }]
      }

    case 'TOGGLE_TODO':
      // TypeScript sait que action.payload.id existe ici
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      }

    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload.id)
      }

    case 'CLEAR_COMPLETED':
      // TypeScript sait qu'il n'y a pas de payload ici
      return {
        ...state,
        todos: state.todos.filter(todo => !todo.completed)
      }

    default:
      return state
  }
}
```

### Avantages du discriminated union

1. **Autocomplétion** : L'IDE suggère les types d'actions
2. **Type narrowing** : Dans chaque case, TypeScript connaît le type exact
3. **Exhaustivité** : TypeScript peut vérifier que tous les cas sont traités

### Vérification d'exhaustivité

```tsx
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TODO':
      return /* ... */
    case 'TOGGLE_TODO':
      return /* ... */
    // Si tu oublies DELETE_TODO, TypeScript avertit ici :
    default:
      const _exhaustiveCheck: never = action
      return state
  }
}
```

---

## Exemple complet : Todo App

```tsx
// Types
interface Todo {
  id: string
  text: string
  completed: boolean
}

interface State {
  todos: Todo[]
  filter: 'all' | 'active' | 'completed'
}

type Action =
  | { type: 'ADD_TODO'; payload: string }
  | { type: 'TOGGLE_TODO'; payload: string }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'SET_FILTER'; payload: State['filter'] }
  | { type: 'CLEAR_COMPLETED' }

// Reducer
function todoReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [
          ...state.todos,
          { id: crypto.randomUUID(), text: action.payload, completed: false }
        ]
      }

    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      }

    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      }

    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload
      }

    case 'CLEAR_COMPLETED':
      return {
        ...state,
        todos: state.todos.filter(todo => !todo.completed)
      }

    default:
      return state
  }
}

// Initial state
const initialState: State = {
  todos: [],
  filter: 'all'
}

// Component
function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, initialState)

  // Derived state
  const filteredTodos = state.todos.filter(todo => {
    if (state.filter === 'active') return !todo.completed
    if (state.filter === 'completed') return todo.completed
    return true
  })

  const handleAddTodo = (text: string) => {
    dispatch({ type: 'ADD_TODO', payload: text })
  }

  return (
    <div>
      <TodoInput onAdd={handleAddTodo} />
      <TodoList
        todos={filteredTodos}
        onToggle={id => dispatch({ type: 'TOGGLE_TODO', payload: id })}
        onDelete={id => dispatch({ type: 'DELETE_TODO', payload: id })}
      />
      <TodoFilters
        current={state.filter}
        onChange={filter => dispatch({ type: 'SET_FILTER', payload: filter })}
      />
      <button onClick={() => dispatch({ type: 'CLEAR_COMPLETED' })}>
        Clear completed
      </button>
    </div>
  )
}
```

---

## Lazy initialization

Comme `useState`, `useReducer` supporte l'initialisation paresseuse :

```tsx
function init(initialCount: number): State {
  return { count: initialCount }
}

function Counter({ initialCount }: { initialCount: number }) {
  const [state, dispatch] = useReducer(reducer, initialCount, init)
  // init(initialCount) n'est appelé qu'au premier render
}
```

Utile pour :
- Lecture du localStorage
- Calculs coûteux
- Reset de l'état avec la même fonction init

---

## useState vs useReducer

### Quand préférer useReducer ?

| Situation | Recommandation |
|-----------|----------------|
| État simple (boolean, number, string) | `useState` |
| Objet avec 2-3 propriétés indépendantes | `useState` |
| Objet avec propriétés interdépendantes | `useReducer` |
| Multiple sous-valeurs qui changent ensemble | `useReducer` |
| Logique de mise à jour complexe | `useReducer` |
| Besoin de tester la logique de state | `useReducer` |
| État avec historique (undo/redo) | `useReducer` |

### Règle pratique

> Si tu as plus de 3 `setState` dans un même handler, envisage `useReducer`.

```tsx
// ❌ Signal qu'il faut peut-être useReducer
const handleSubmit = () => {
  setLoading(true)
  setError(null)
  setData(null)
  // ...
  setLoading(false)
  setData(result)
}

// ✅ Avec useReducer
dispatch({ type: 'SUBMIT_START' })
// ...
dispatch({ type: 'SUBMIT_SUCCESS', payload: result })
```

---

## Analogie CQRS

Si tu connais CQRS, voici les parallèles :

| CQRS | useReducer |
|------|------------|
| Command | Action |
| Command Handler | Reducer |
| Aggregate State | State |
| Events (résultat) | Nouvel état retourné |

### Pattern Command-like

```tsx
// Les actions sont des "commands" : elles expriment l'intention
type Action =
  | { type: 'CreateTodo'; text: string }      // Intention : créer
  | { type: 'CompleteTodo'; id: string }      // Intention : compléter
  | { type: 'ArchiveTodo'; id: string }       // Intention : archiver

// Le reducer décide comment transformer l'état
function reducer(state: State, action: Action): State {
  // Logique métier centralisée
}
```

---

## Pattern : Action Creators

Pour simplifier les appels à dispatch :

```tsx
// Sans action creators
dispatch({ type: 'ADD_TODO', payload: text })
dispatch({ type: 'TOGGLE_TODO', payload: id })

// Avec action creators
const actions = {
  addTodo: (text: string) => ({ type: 'ADD_TODO' as const, payload: text }),
  toggleTodo: (id: string) => ({ type: 'TOGGLE_TODO' as const, payload: id }),
}

dispatch(actions.addTodo('Learn React'))
dispatch(actions.toggleTodo('123'))
```

> **Note** : `as const` est nécessaire pour que TypeScript infère le type littéral.

---

## Tester un reducer

Un des grands avantages de `useReducer` : le reducer est une fonction pure, donc facile à tester :

```tsx
describe('todoReducer', () => {
  it('should add a todo', () => {
    const state: State = { todos: [], filter: 'all' }
    const action: Action = { type: 'ADD_TODO', payload: 'Test' }

    const newState = todoReducer(state, action)

    expect(newState.todos).toHaveLength(1)
    expect(newState.todos[0].text).toBe('Test')
    expect(newState.todos[0].completed).toBe(false)
  })

  it('should toggle a todo', () => {
    const state: State = {
      todos: [{ id: '1', text: 'Test', completed: false }],
      filter: 'all'
    }
    const action: Action = { type: 'TOGGLE_TODO', payload: '1' }

    const newState = todoReducer(state, action)

    expect(newState.todos[0].completed).toBe(true)
  })
})
```

---

## Anti-patterns

### 1. Mettre des effets de bord dans le reducer

```tsx
// ❌ Le reducer doit être pur !
function reducer(state, action) {
  switch (action.type) {
    case 'SAVE':
      localStorage.setItem('data', JSON.stringify(state))  // ❌ Effet de bord
      return state
  }
}

// ✅ Les effets de bord vont dans le composant ou useEffect
function Component() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    localStorage.setItem('data', JSON.stringify(state))
  }, [state])
}
```

### 2. Muter l'état

```tsx
// ❌ Mutation directe
case 'TOGGLE':
  state.todos[0].completed = true  // Mutation !
  return state

// ✅ Nouvel objet
case 'TOGGLE':
  return {
    ...state,
    todos: state.todos.map(todo =>
      todo.id === action.payload
        ? { ...todo, completed: !todo.completed }
        : todo
    )
  }
```

---

## Exercice de compréhension

1. Quelle est la différence fondamentale entre `useState` et `useReducer` ?
2. Pourquoi le reducer doit-il être une fonction pure ?
3. Comment typer correctement les actions en TypeScript ?
4. Dans quel cas préférer `useReducer` à `useState` ?

---

→ [Section suivante : Testing](./06_testing.md)
