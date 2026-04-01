# Tests d'intégration

## Introduction

Après avoir vu comment structurer du code avec Context, Compound Components et des stores, il faut savoir **tester** ces patterns. Ce cours se concentre sur les tests d'intégration : tester que plusieurs couches fonctionnent ensemble, en particulier les composants qui dépendent de Context ou de stores.

> **Différence avec le module 3** : le module 3 couvrait les tests unitaires de hooks et composants simples. Ici, on teste des composants qui vivent dans un **environnement** (Providers, stores, routing).

---

## Rappel : Pyramide des tests en React

```
          ╱╲
         ╱ E2E ╲         Cypress, Playwright
        ╱────────╲        Peu nombreux, lents, fragiles
       ╱Integration╲     Testing Library + Providers
      ╱──────────────╲    Nombreux, rapides, fiables
     ╱    Unit Tests    ╲  Fonctions pures, hooks isolés
    ╱────────────────────╲ Très nombreux, très rapides
```

Les tests d'intégration sont le **meilleur rapport effort/confiance** en React : ils testent le comportement réel de l'utilisateur sans la fragilité des tests E2E.

---

## Tester avec Context

### Le problème

Un composant qui utilise `useTheme()` ne peut pas être rendu seul :

```tsx
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()  // 💥 throw sans Provider !
  return <button onClick={toggleTheme}>{theme}</button>
}

// Ce test crash :
render(<ThemeToggle />)
// Error: useTheme must be used within a ThemeProvider
```

### Solution : Wrapper de test

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ThemeToggle } from '@/components/ThemeToggle'

function renderWithTheme(ui: React.ReactElement) {
  return render(
    <ThemeProvider>{ui}</ThemeProvider>
  )
}

test('toggle theme changes from light to dark', async () => {
  const user = userEvent.setup()
  renderWithTheme(<ThemeToggle />)

  const button = screen.getByRole('button')
  expect(button).toHaveTextContent('light')

  await user.click(button)
  expect(button).toHaveTextContent('dark')
})
```

### Wrapper générique pour plusieurs Providers

```tsx
import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NotificationProvider } from '@/contexts/NotificationContext'

interface AllProvidersProps {
  children: ReactNode
}

function AllProviders({ children }: AllProvidersProps) {
  return (
    <ThemeProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </ThemeProvider>
  )
}

function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

// Réexporter tout de testing-library + notre render custom
export * from '@testing-library/react'
export { renderWithProviders as render }
```

> **Pattern** : créer un fichier `src/test-utils.tsx` qui exporte un `render` custom avec tous les Providers. Chaque test importe depuis ce fichier au lieu de `@testing-library/react` directement.

### Tester avec un état initial custom

```tsx
interface ThemeProviderProps {
  children: ReactNode
  initialTheme?: 'light' | 'dark'
}

// Le Provider accepte un état initial pour les tests
function ThemeProvider({ children, initialTheme = 'light' }: ThemeProviderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme)
  // ...
}

// Test avec un état initial
test('renders correctly in dark mode', () => {
  render(
    <ThemeProvider initialTheme="dark">
      <ThemeToggle />
    </ThemeProvider>
  )
  expect(screen.getByRole('button')).toHaveTextContent('dark')
})
```

---

## Tester les Compound Components

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Accordion } from '@/components/Accordion'

describe('Accordion', () => {
  test('opens item on trigger click', async () => {
    const user = userEvent.setup()

    render(
      <Accordion defaultValue="item-1">
        <Accordion.Item value="item-1">
          <Accordion.Trigger>Section 1</Accordion.Trigger>
          <Accordion.Content>Contenu 1</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-2">
          <Accordion.Trigger>Section 2</Accordion.Trigger>
          <Accordion.Content>Contenu 2</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    )

    // Section 1 est ouverte par défaut
    expect(screen.getByText('Contenu 1')).toBeInTheDocument()
    expect(screen.queryByText('Contenu 2')).not.toBeInTheDocument()

    // Cliquer sur Section 2
    await user.click(screen.getByText('Section 2'))
    expect(screen.queryByText('Contenu 1')).not.toBeInTheDocument()
    expect(screen.getByText('Contenu 2')).toBeInTheDocument()
  })

  test('Trigger outside Item throws error', () => {
    // Capturer l'erreur de rendu
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(
        <Accordion>
          <Accordion.Trigger>Orphelin</Accordion.Trigger>
        </Accordion>
      )
    }).toThrow('Accordion.Trigger/Content must be used within <Accordion.Item>')

    consoleSpy.mockRestore()
  })

  test('aria-expanded reflects open state', async () => {
    const user = userEvent.setup()

    render(
      <Accordion>
        <Accordion.Item value="item-1">
          <Accordion.Trigger>Section 1</Accordion.Trigger>
          <Accordion.Content>Contenu 1</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    )

    const trigger = screen.getByText('Section 1')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })
})
```

---

## Tester avec Zustand

### Le problème

Les stores Zustand sont des **singletons**. Entre deux tests, le state persiste :

```tsx
// Test 1 ajoute un todo → le store contient 1 todo
// Test 2 commence avec 1 todo au lieu de 0 → FAUX !
```

### Solution : Reset entre les tests

```tsx
import { useTodoStore } from '@/stores/useTodoStore'

// Sauvegarder l'état initial
const initialState = useTodoStore.getState()

beforeEach(() => {
  // Reset le store avant chaque test
  useTodoStore.setState(initialState, true)
})
```

### Alternative : Mock du store

```tsx
import { create } from 'zustand'

// Créer un store mock pour les tests
function createMockTodoStore(initialTodos: Todo[] = []) {
  return create<TodoStore>((set) => ({
    todos: initialTodos,
    filter: 'all',
    addTodo: (text) => set((state) => ({
      todos: [...state.todos, { id: crypto.randomUUID(), text, completed: false }],
    })),
    toggleTodo: (id) => set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    })),
    removeTodo: (id) => set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
    })),
    setFilter: (filter) => set({ filter }),
  }))
}
```

### Tester un composant qui utilise un store

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTodoStore } from '@/stores/useTodoStore'

const initialState = useTodoStore.getState()

beforeEach(() => {
  useTodoStore.setState(initialState, true)
})

test('adds a todo', async () => {
  const user = userEvent.setup()
  render(<TodoApp />)

  const input = screen.getByPlaceholderText('Add todo...')
  await user.type(input, 'New todo{Enter}')

  expect(screen.getByText('New todo')).toBeInTheDocument()
  // Vérifier aussi le store directement
  expect(useTodoStore.getState().todos).toHaveLength(1)
})
```

---

## Tester les hooks custom

### renderHook

```tsx
import { renderHook, act } from '@testing-library/react'
import { useContacts } from '@/features/contacts/hooks/useContacts'

// Mock de l'API
vi.mock('@/features/contacts/api/contactApi', () => ({
  fetchContacts: vi.fn().mockResolvedValue([
    { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
  ]),
  createContact: vi.fn().mockResolvedValue({
    id: '2', firstName: 'Jane', lastName: 'Doe', email: 'jane@test.com',
  }),
  deleteContact: vi.fn().mockResolvedValue(undefined),
}))

test('loads contacts on mount', async () => {
  const { result } = renderHook(() => useContacts())

  // Initialement en loading
  expect(result.current.loading).toBe(true)

  // Attendre que le fetch se termine
  await waitFor(() => {
    expect(result.current.loading).toBe(false)
  })

  expect(result.current.contacts).toHaveLength(1)
  expect(result.current.contacts[0].firstName).toBe('John')
})
```

### renderHook avec Provider

```tsx
test('hook that needs Context', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  )

  const { result } = renderHook(() => useTheme(), { wrapper })
  expect(result.current.theme).toBe('light')
})
```

---

## Mocker les API

### Mock simple avec vi.fn()

```tsx
vi.mock('@/features/contacts/api/contactApi', () => ({
  fetchContacts: vi.fn(),
  createContact: vi.fn(),
  deleteContact: vi.fn(),
}))

import { fetchContacts } from '@/features/contacts/api/contactApi'

const mockFetchContacts = vi.mocked(fetchContacts)

test('handles API error', async () => {
  mockFetchContacts.mockRejectedValue(new Error('Network error'))

  render(<ContactList />)

  await waitFor(() => {
    expect(screen.getByText(/erreur/i)).toBeInTheDocument()
  })
})
```

### Mock avec MSW (Mock Service Worker)

Pour des tests plus réalistes, MSW intercepte les requêtes HTTP au niveau réseau :

```tsx
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const server = setupServer(
  http.get('/api/contacts', () => {
    return HttpResponse.json([
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
    ])
  }),

  http.post('/api/contacts', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: '2', ...body }, { status: 201 })
  }),

  http.delete('/api/contacts/:id', () => {
    return new HttpResponse(null, { status: 204 })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('creates a contact', async () => {
  const user = userEvent.setup()
  render(<ContactForm />)

  await user.type(screen.getByLabelText('Prénom'), 'Jane')
  await user.type(screen.getByLabelText('Email'), 'jane@test.com')
  await user.click(screen.getByText('Créer'))

  await waitFor(() => {
    expect(screen.getByText('Contact créé')).toBeInTheDocument()
  })
})
```

> **Avantage MSW** : les tests sont plus réalistes car ils exercent le vrai code fetch. Pas de mock de module, pas de couplage aux imports internes.

---

## Tests d'intégration complets

### Tester un flow utilisateur

```tsx
describe('Contact Management Flow', () => {
  test('user can search, add, and delete contacts', async () => {
    const user = userEvent.setup()
    render(<ContactPage />, { wrapper: AllProviders })

    // 1. Attendre le chargement
    await waitFor(() => {
      expect(screen.queryByText('Chargement...')).not.toBeInTheDocument()
    })

    // 2. Vérifier la liste initiale
    expect(screen.getByText('John Doe')).toBeInTheDocument()

    // 3. Rechercher
    await user.type(screen.getByPlaceholderText('Rechercher...'), 'Jane')
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()

    // 4. Effacer la recherche
    await user.clear(screen.getByPlaceholderText('Rechercher...'))
    expect(screen.getByText('John Doe')).toBeInTheDocument()

    // 5. Supprimer un contact
    await user.click(screen.getAllByText('Supprimer')[0])
    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    })
  })
})
```

---

## Checklist de testing

| Ce qu'on teste | Comment | Outil |
|---|---|---|
| Fonctions pures (types, utils) | Tests unitaires directs | Jest / Vitest |
| Hooks custom | `renderHook` + `act` | Testing Library |
| Composants avec Context | `render` avec wrapper Provider | Testing Library |
| Composants avec Zustand | Reset du store en `beforeEach` | Testing Library |
| Compound Components | Render complet, tester les interactions | Testing Library |
| Appels API | Mock vi.fn() ou MSW | Vitest + MSW |
| Flows utilisateur | Tests d'intégration end-to-end-like | Testing Library |

---

## Résumé

| Concept | Détail |
|---|---|
| **Wrapper de test** | Composant qui fournit les Providers nécessaires |
| **test-utils.tsx** | Fichier centralisé avec `render` custom |
| **Reset Zustand** | `store.setState(initialState, true)` en `beforeEach` |
| **renderHook** | Tester un hook en isolation |
| **MSW** | Mock réseau pour des tests réalistes |
| **Flow test** | Tester un scénario utilisateur complet |
| **Règle d'or** | Tester le comportement utilisateur, pas l'implémentation |

---

→ Retour au [README du module](./README.md)
→ [Exercices du module](./exercises.md)
