# React 19 : Nouvelles APIs

## Introduction

React 19 introduit plusieurs nouvelles APIs qui simplifient des patterns auparavant complexes. Ce chapitre couvre :

- `use()` : Nouvelle façon de consommer Promises et Context
- `useTransition` : Marquer des mises à jour comme non-urgentes
- `useOptimistic` : UI optimiste simplifiée
- `useFormStatus` : État des formulaires
- Actions et Server Actions (Next.js)

> **Note** : Ce projet utilise React 19.2.3 et Next.js 16, donc toutes ces APIs sont disponibles.

---

## use() : Le hook universel

`use()` est un nouveau hook qui peut consommer des **Promises** et du **Context**.

### Consommer une Promise

```tsx
import { use, Suspense } from 'react'

async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}

function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise) // Suspend jusqu'à résolution

  return <div>{user.name}</div>
}

// Usage
function Page({ userId }: { userId: string }) {
  const userPromise = fetchUser(userId) // Créé pendant le render

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  )
}
```

### Différence avec await

- `await` : Bloque l'exécution de la fonction
- `use()` : **Suspend** le composant, React peut continuer à afficher le reste de l'UI

### Consommer un Context

```tsx
import { use, createContext } from 'react'

const ThemeContext = createContext<'light' | 'dark'>('light')

function Button() {
  const theme = use(ThemeContext) // Équivalent à useContext(ThemeContext)

  return <button className={theme}>Click me</button>
}
```

### Avantage de use() pour le Context

`use()` peut être appelé **conditionnellement**, contrairement à `useContext` :

```tsx
function Component({ showTheme }: { showTheme: boolean }) {
  // ❌ Impossible avec useContext
  // if (showTheme) {
  //   const theme = useContext(ThemeContext)  // Erreur !
  // }

  // ✅ Possible avec use()
  if (showTheme) {
    const theme = use(ThemeContext) // OK !
    return <div>{theme}</div>
  }

  return <div>No theme</div>
}
```

---

## useTransition : Mises à jour non-urgentes

`useTransition` permet de marquer une mise à jour comme **non-urgente**, gardant l'UI responsive pendant les opérations lentes.

### Syntaxe

```tsx
const [isPending, startTransition] = useTransition()
```

- `isPending` : `true` pendant que la transition est en cours
- `startTransition` : Fonction pour wrapper les mises à jour non-urgentes

### Exemple : Recherche avec filtrage

```tsx
function SearchResults() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Item[]>([])
  const [isPending, startTransition] = useTransition()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Mise à jour urgente : l'input reste réactif
    setQuery(e.target.value)

    // Mise à jour non-urgente : le filtrage peut attendre
    startTransition(() => {
      const filtered = filterLargeDataset(e.target.value)
      setResults(filtered)
    })
  }

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <span>Filtering...</span>}
      <ResultList items={results} />
    </div>
  )
}
```

### Navigation sans blocage

```tsx
function Navigation() {
  const [page, setPage] = useState('home')
  const [isPending, startTransition] = useTransition()

  const navigate = (to: string) => {
    startTransition(() => {
      setPage(to)
    })
  }

  return (
    <nav>
      <button onClick={() => navigate('home')}>Home</button>
      <button onClick={() => navigate('dashboard')}>Dashboard</button>
      {isPending && <LoadingIndicator />}
    </nav>
  )
}
```

### startTransition global

Tu peux aussi utiliser `startTransition` sans le hook :

```tsx
import { startTransition } from 'react'

function handleClick() {
  startTransition(() => {
    setHeavyState(computeHeavyValue())
  })
}
```

La différence : sans le hook, tu n'as pas accès à `isPending`.

---

## useOptimistic : UI optimiste

`useOptimistic` permet d'afficher immédiatement un état "optimiste" pendant qu'une action asynchrone s'exécute.

### Syntaxe

```tsx
const [optimisticState, addOptimistic] = useOptimistic(
  state,
  (currentState, optimisticValue) => newState
)
```

### Exemple : Like optimiste

```tsx
interface Post {
  id: string
  likes: number
  likedByMe: boolean
}

function LikeButton({ post }: { post: Post }) {
  const [optimisticPost, addOptimistic] = useOptimistic(post, (current, liked: boolean) => ({
    ...current,
    likes: current.likes + (liked ? 1 : -1),
    likedByMe: liked,
  }))

  const handleLike = async () => {
    const newLiked = !optimisticPost.likedByMe

    // 1. Mise à jour optimiste immédiate
    addOptimistic(newLiked)

    // 2. Appel serveur en arrière-plan
    await toggleLike(post.id)
    // Si succès, le state réel se met à jour
    // Si erreur, React revient à l'état précédent
  }

  return (
    <button onClick={handleLike}>
      {optimisticPost.likedByMe ? '❤️' : '🤍'} {optimisticPost.likes}
    </button>
  )
}
```

### Exemple : Ajout dans une liste

```tsx
function TodoList({ todos, addTodo }: Props) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(todos, (current, newTodo: Todo) => [
    ...current,
    { ...newTodo, pending: true },
  ])

  const handleAdd = async (text: string) => {
    const newTodo = { id: crypto.randomUUID(), text, completed: false }

    addOptimisticTodo(newTodo)
    await addTodo(newTodo) // Server action
  }

  return (
    <ul>
      {optimisticTodos.map((todo) => (
        <li key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>
          {todo.text}
        </li>
      ))}
    </ul>
  )
}
```

---

## useFormStatus : État des formulaires

`useFormStatus` donne accès à l'état d'un formulaire parent qui utilise une **action**.

### Syntaxe

```tsx
import { useFormStatus } from 'react-dom'

const { pending, data, method, action } = useFormStatus()
```

- `pending` : `true` si le formulaire est en cours de soumission
- `data` : Les données du formulaire (FormData)
- `method` : La méthode HTTP
- `action` : L'URL de l'action

### Exemple : Bouton de soumission

```tsx
'use client'

import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Sending...' : 'Submit'}
    </button>
  )
}

function ContactForm() {
  async function sendMessage(formData: FormData) {
    'use server'
    await saveMessage(formData)
  }

  return (
    <form action={sendMessage}>
      <input name="email" type="email" required />
      <textarea name="message" required />
      <SubmitButton />
    </form>
  )
}
```

> **Important** : `useFormStatus` doit être utilisé dans un **enfant** du `<form>`, pas directement dans le composant contenant le formulaire.

---

## Actions et Server Actions

### Actions dans les formulaires

React 19 permet de passer une **fonction** à l'attribut `action` d'un formulaire :

```tsx
function Form() {
  async function handleSubmit(formData: FormData) {
    const name = formData.get('name')
    await saveUser(name)
  }

  return (
    <form action={handleSubmit}>
      <input name="name" />
      <button type="submit">Save</button>
    </form>
  )
}
```

### useActionState

Pour gérer l'état retourné par une action :

```tsx
import { useActionState } from 'react'

function Form() {
  const [state, formAction, isPending] = useActionState(
    async (previousState: State, formData: FormData) => {
      const result = await saveUser(formData)
      if (result.error) {
        return { error: result.error }
      }
      return { success: true }
    },
    { error: null, success: false } // État initial
  )

  return (
    <form action={formAction}>
      <input name="name" />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
      {state.error && <p className="error">{state.error}</p>}
      {state.success && <p className="success">Saved!</p>}
    </form>
  )
}
```

### Server Actions (Next.js)

Avec Next.js, tu peux définir des actions qui s'exécutent **sur le serveur** :

```tsx
// app/actions.ts
'use server'

export async function createUser(formData: FormData) {
  const name = formData.get('name')

  // Cette code s'exécute sur le serveur
  await db.users.create({ name })

  revalidatePath('/users')
}
```

```tsx
// app/page.tsx
import { createUser } from './actions'

export default function Page() {
  return (
    <form action={createUser}>
      <input name="name" />
      <button type="submit">Create</button>
    </form>
  )
}
```

---

## Patterns combinés

### Formulaire complet avec toutes les APIs

```tsx
'use client'

import { useFormStatus } from 'react-dom'
import { useActionState, useOptimistic } from 'react'
import { addComment } from './actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Posting...' : 'Post Comment'}
    </button>
  )
}

export function CommentForm({ comments }: { comments: Comment[] }) {
  const [optimisticComments, addOptimistic] = useOptimistic(
    comments,
    (current, newComment: Comment) => [...current, { ...newComment, pending: true }]
  )

  const [state, formAction] = useActionState(
    async (prev: State, formData: FormData) => {
      const text = formData.get('text') as string

      // Optimistic update
      addOptimistic({
        id: crypto.randomUUID(),
        text,
        createdAt: new Date(),
      })

      // Server action
      const result = await addComment(formData)
      return result
    },
    { error: null }
  )

  return (
    <div>
      <ul>
        {optimisticComments.map((c) => (
          <li key={c.id} style={{ opacity: c.pending ? 0.5 : 1 }}>
            {c.text}
          </li>
        ))}
      </ul>

      <form action={formAction}>
        <textarea name="text" required />
        <SubmitButton />
        {state.error && <p className="error">{state.error}</p>}
      </form>
    </div>
  )
}
```

---

## Comparaison avec les patterns existants

| Pattern               | Avant React 19            | React 19                     |
| --------------------- | ------------------------- | ---------------------------- |
| Consommer une Promise | useEffect + useState      | `use()` + Suspense           |
| UI pendant fetch      | Loading state manuel      | `isPending` de useTransition |
| Optimistic updates    | Logique manuelle complexe | `useOptimistic`              |
| Form submission state | useState + isLoading      | `useFormStatus`              |
| Form actions          | onSubmit + fetch          | action prop + useActionState |

---

## Analogies Vue.js

| Concept        | Vue.js / Nuxt              | React 19               |
| -------------- | -------------------------- | ---------------------- |
| Suspense       | `<Suspense>` + async setup | `<Suspense>` + `use()` |
| Optimistic UI  | Logique manuelle           | `useOptimistic`        |
| Server Actions | Nuxt server routes         | Server Actions         |
| Form state     | VeeValidate / FormKit      | `useFormStatus`        |

---

## Exercice de compréhension

Avant de passer à la suite, assure-toi de pouvoir répondre à :

1. Quelle est la différence entre `use()` et `await` pour consommer une Promise ?
2. Quand utiliserais-tu `useTransition` plutôt qu'un simple `useState` ?
3. Comment `useOptimistic` gère-t-il les erreurs serveur ?
4. Pourquoi `useFormStatus` doit-il être dans un composant enfant du formulaire ?
5. Quelle est la différence entre une action client et une Server Action ?

---

→ [Section suivante : Suspense & Error Boundaries](./05_suspense.md)
