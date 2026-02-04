# Testing Asynchrone

## Introduction

Tester du code asynchrone en React présente des défis spécifiques :

- **Timing** : Les updates async peuvent arriver après les assertions
- **Act warnings** : React exige que les updates soient wrappées dans `act()`
- **Mocking** : Simuler les appels API et les timers

Ce chapitre couvre les patterns essentiels pour tester les composants avec des hooks asynchrones.

---

## Le problème de base

```tsx
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser)
  }, [userId])

  if (!user) return <div>Loading...</div>
  return <div>{user.name}</div>
}
```

### Test naïf (qui ne fonctionne pas)

```tsx
// ❌ Ne fonctionne pas
test('displays user name', () => {
  render(<UserProfile userId="1" />)

  // L'assertion s'exécute AVANT que le fetch soit terminé
  expect(screen.getByText('Alice')).toBeInTheDocument()  // Échec !
})
```

---

## waitFor : Attendre une condition

`waitFor` répète une assertion jusqu'à ce qu'elle réussisse ou timeout :

```tsx
import { render, screen, waitFor } from '@testing-library/react'

test('displays user name', async () => {
  render(<UserProfile userId="1" />)

  // Attend que l'assertion soit vraie (ou timeout après 1s par défaut)
  await waitFor(() => {
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })
})
```

### Options de waitFor

```tsx
await waitFor(
  () => expect(element).toBeVisible(),
  {
    timeout: 3000,     // Temps max (default: 1000ms)
    interval: 100,     // Intervalle entre les tentatives (default: 50ms)
    onTimeout: (error) => {
      // Callback personnalisé en cas de timeout
      console.log(error)
      return error
    }
  }
)
```

---

## findBy* : waitFor intégré

Les queries `findBy*` combinent `getBy*` avec `waitFor` :

```tsx
test('displays user name', async () => {
  render(<UserProfile userId="1" />)

  // Équivalent à waitFor(() => getByText('Alice'))
  const userName = await screen.findByText('Alice')
  expect(userName).toBeInTheDocument()
})
```

### Comparaison des queries

| Query | Async ? | Retour si absent | Usage |
|-------|---------|------------------|-------|
| `getBy*` | Non | Erreur | Élément présent immédiatement |
| `queryBy*` | Non | `null` | Vérifier l'absence |
| `findBy*` | **Oui** | Erreur (après timeout) | Élément qui apparaît après un async |

```tsx
// ✅ Bon pattern pour les composants async
test('async component', async () => {
  render(<AsyncComponent />)

  // Loading initial
  expect(screen.getByText('Loading...')).toBeInTheDocument()

  // Contenu final
  const content = await screen.findByText('Data loaded')
  expect(content).toBeInTheDocument()

  // Vérifier que loading a disparu
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
})
```

---

## Mocking fetch

### Mock global avec Jest

```tsx
// __tests__/setup.ts ou dans le test
global.fetch = jest.fn()

beforeEach(() => {
  jest.resetAllMocks()
})
```

### Pattern de mock réutilisable

```tsx
function mockFetch(data: unknown, options: { delay?: number; status?: number } = {}) {
  const { delay = 0, status = 200 } = options

  return jest.fn().mockImplementation(() =>
    new Promise((resolve) =>
      setTimeout(() => {
        resolve({
          ok: status >= 200 && status < 300,
          status,
          json: () => Promise.resolve(data),
        })
      }, delay)
    )
  )
}

// Usage
test('displays user', async () => {
  global.fetch = mockFetch({ id: '1', name: 'Alice' })

  render(<UserProfile userId="1" />)

  expect(await screen.findByText('Alice')).toBeInTheDocument()
  expect(fetch).toHaveBeenCalledWith('/api/users/1')
})
```

### Mock avec MSW (recommandé pour les tests d'intégration)

```tsx
// mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Alice',
    })
  }),
]
```

```tsx
// mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

```tsx
// jest.setup.ts
import { server } from './mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

---

## act() et les warnings

### Qu'est-ce que act() ?

`act()` est une fonction qui s'assure que toutes les mises à jour React sont appliquées avant les assertions :

```tsx
import { act } from '@testing-library/react'

test('updates state', async () => {
  render(<Counter />)

  await act(async () => {
    // Actions qui déclenchent des updates React
    fireEvent.click(screen.getByText('Increment'))
  })

  expect(screen.getByText('1')).toBeInTheDocument()
})
```

### Quand act() est-il automatique ?

Testing Library wrappe automatiquement `act()` dans :
- `render()`
- `userEvent.*` (toutes les actions)
- `waitFor()`
- `findBy*`

Tu as rarement besoin d'appeler `act()` directement.

### Warning "not wrapped in act(...)"

```
Warning: An update to Component inside a test was not wrapped in act(...).
```

Ce warning signifie qu'une mise à jour async s'est produite après que le test a continué.

#### Solution : Attendre la fin des updates

```tsx
// ❌ Cause le warning
test('problem', () => {
  render(<AsyncComponent />)
  // Le test se termine avant que l'update async soit appliquée
})

// ✅ Attendre les updates
test('fixed', async () => {
  render(<AsyncComponent />)

  // Attendre que le contenu apparaisse
  await screen.findByText('Loaded')
})
```

---

## Tester useEffect

### Pattern de base

```tsx
function DocumentTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = title
  }, [title])

  return <div>{title}</div>
}

test('updates document title', () => {
  render(<DocumentTitle title="Hello" />)

  expect(document.title).toBe('Hello')
})
```

### Tester le cleanup

```tsx
function EventListener({ onEvent }: { onEvent: () => void }) {
  useEffect(() => {
    window.addEventListener('resize', onEvent)
    return () => window.removeEventListener('resize', onEvent)
  }, [onEvent])

  return null
}

test('adds and removes event listener', () => {
  const addSpy = jest.spyOn(window, 'addEventListener')
  const removeSpy = jest.spyOn(window, 'removeEventListener')

  const onEvent = jest.fn()
  const { unmount } = render(<EventListener onEvent={onEvent} />)

  expect(addSpy).toHaveBeenCalledWith('resize', onEvent)

  unmount()

  expect(removeSpy).toHaveBeenCalledWith('resize', onEvent)
})
```

---

## Fake Timers

Pour tester du code avec des timers (`setTimeout`, `setInterval`) :

### Activer les fake timers

```tsx
beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})
```

### Avancer le temps

```tsx
function Debounced({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) onSearch(query)
    }, 500)

    return () => clearTimeout(timer)
  }, [query, onSearch])

  return <input value={query} onChange={e => setQuery(e.target.value)} />
}

test('debounces search', async () => {
  jest.useFakeTimers()
  const onSearch = jest.fn()

  render(<Debounced onSearch={onSearch} />)

  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

  await user.type(screen.getByRole('textbox'), 'hello')

  // Pas encore appelé
  expect(onSearch).not.toHaveBeenCalled()

  // Avancer le temps
  act(() => {
    jest.advanceTimersByTime(500)
  })

  expect(onSearch).toHaveBeenCalledWith('hello')
})
```

### Attention avec userEvent et fake timers

```tsx
// Configuration spéciale pour userEvent avec fake timers
const user = userEvent.setup({
  advanceTimers: jest.advanceTimersByTime,
})
```

---

## Tester les custom hooks

### renderHook

```tsx
import { renderHook, act } from '@testing-library/react'

function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue)
  const increment = () => setCount(c => c + 1)
  const decrement = () => setCount(c => c - 1)
  return { count, increment, decrement }
}

test('useCounter', () => {
  const { result } = renderHook(() => useCounter(10))

  expect(result.current.count).toBe(10)

  act(() => {
    result.current.increment()
  })

  expect(result.current.count).toBe(11)
})
```

### Hook avec dépendances (wrapper)

```tsx
function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('Must be used within ThemeProvider')
  return context
}

test('useTheme', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ThemeProvider value="dark">{children}</ThemeProvider>
  )

  const { result } = renderHook(() => useTheme(), { wrapper })

  expect(result.current).toBe('dark')
})
```

### Hook async

```tsx
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
  }, [url])

  return { data, loading }
}

test('useFetch', async () => {
  global.fetch = mockFetch({ name: 'Alice' })

  const { result } = renderHook(() => useFetch('/api/user'))

  expect(result.current.loading).toBe(true)
  expect(result.current.data).toBe(null)

  await waitFor(() => {
    expect(result.current.loading).toBe(false)
  })

  expect(result.current.data).toEqual({ name: 'Alice' })
})
```

---

## Patterns avancés

### Tester les race conditions

```tsx
test('handles race condition correctly', async () => {
  // Premier fetch lent
  global.fetch = jest
    .fn()
    .mockImplementationOnce(() =>
      new Promise(resolve =>
        setTimeout(() => resolve({ json: () => ({ name: 'Slow' }) }), 100)
      )
    )
    .mockImplementationOnce(() =>
      Promise.resolve({ json: () => ({ name: 'Fast' }) })
    )

  const { rerender } = render(<UserProfile userId="1" />)

  // Change l'ID avant que le premier fetch soit terminé
  rerender(<UserProfile userId="2" />)

  // Attend assez pour que les deux fetchs soient terminés
  await waitFor(() => {
    expect(screen.getByText('Fast')).toBeInTheDocument()
  })

  // Vérifie que "Slow" n'est jamais affiché
  expect(screen.queryByText('Slow')).not.toBeInTheDocument()
})
```

### Tester les erreurs

```tsx
test('displays error on fetch failure', async () => {
  global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

  render(<UserProfile userId="1" />)

  expect(await screen.findByText(/error/i)).toBeInTheDocument()
})
```

### Tester avec Suspense

```tsx
test('displays loading then content', async () => {
  global.fetch = mockFetch({ name: 'Alice' }, { delay: 100 })

  render(
    <Suspense fallback={<div>Loading...</div>}>
      <AsyncComponent />
    </Suspense>
  )

  // Vérifier le fallback
  expect(screen.getByText('Loading...')).toBeInTheDocument()

  // Vérifier le contenu final
  expect(await screen.findByText('Alice')).toBeInTheDocument()
})
```

---

## Checklist des tests async

Avant de committer un test async, vérifie :

- [ ] Pas de warnings `act(...)` dans la console
- [ ] `await` sur toutes les opérations async
- [ ] `findBy*` pour les éléments qui apparaissent après un async
- [ ] Mocks nettoyés dans `afterEach`
- [ ] Fake timers restaurés si utilisés

---

## Exercice de compréhension

Avant de passer aux exercices, assure-toi de pouvoir répondre à :

1. Quelle est la différence entre `getBy*`, `queryBy*` et `findBy*` ?
2. Quand as-tu besoin d'appeler `act()` explicitement ?
3. Comment configurer `userEvent` pour fonctionner avec fake timers ?
4. Comment tester le cleanup d'un `useEffect` ?
5. Ce test a-t-il un problème ?
   ```tsx
   test('async test', () => {
     render(<AsyncComponent />)
     expect(screen.getByText('Loaded')).toBeInTheDocument()
   })
   ```

---

→ [Exercices du module](./exercises.md)
