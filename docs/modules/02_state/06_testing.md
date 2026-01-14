# Tester les interactions utilisateur

## Introduction

Le Module 1 a couvert les bases de Testing Library. Ce module approfondit les tests d'interactions : clics, saisie de texte, soumission de formulaires, et gestion des états.

---

## Rappel : philosophie Testing Library

> "The more your tests resemble the way your software is used, the more confidence they can give you."

On teste le **comportement**, pas l'implémentation :
- ✅ "Quand je clique sur le bouton, le compteur affiche 1"
- ❌ "Quand je clique, setState est appelé avec 1"

---

## userEvent vs fireEvent

### fireEvent : simulation synchrone

```tsx
import { fireEvent, render, screen } from '@testing-library/react'

fireEvent.click(button)        // Déclenche un click synchrone
fireEvent.change(input, { target: { value: 'text' } })
```

### userEvent : simulation réaliste (recommandé)

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const user = userEvent.setup()

await user.click(button)       // Simule un vrai click utilisateur
await user.type(input, 'text') // Simule une frappe caractère par caractère
```

### Différences clés

| Aspect | fireEvent | userEvent |
|--------|-----------|-----------|
| Réalisme | Bas | Haut |
| Événements déclenchés | Un seul | Tous (focus, keydown, keyup, etc.) |
| Asynchrone | Non | Oui (await requis) |
| Focus automatique | Non | Oui |
| Recommandé | Non | Oui |

### Exemple concret

```tsx
// fireEvent.click déclenche SEULEMENT 'click'
fireEvent.click(button)

// userEvent.click déclenche la séquence complète :
// pointerover → pointerenter → pointerdown → mousedown → focus → pointerup → mouseup → click
await user.click(button)
```

---

## Setup de userEvent

### Pattern recommandé

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Counter', () => {
  it('should increment when clicked', async () => {
    const user = userEvent.setup()

    render(<Counter />)

    const button = screen.getByRole('button', { name: /increment/i })
    await user.click(button)

    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
```

### Helper pour éviter la répétition

```tsx
function setup(jsx: React.ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(jsx)
  }
}

it('should increment', async () => {
  const { user } = setup(<Counter />)

  await user.click(screen.getByRole('button'))
  expect(screen.getByText('1')).toBeInTheDocument()
})
```

---

## Actions userEvent courantes

### Clics

```tsx
const user = userEvent.setup()

// Click simple
await user.click(element)

// Double click
await user.dblClick(element)

// Click droit
await user.pointer({ keys: '[MouseRight]', target: element })

// Hover
await user.hover(element)
await user.unhover(element)
```

### Saisie de texte

```tsx
// Taper du texte (ajoute au contenu existant)
await user.type(input, 'Hello')

// Effacer et taper
await user.clear(input)
await user.type(input, 'New value')

// Sélectionner tout et remplacer
await user.tripleClick(input)  // Sélectionne tout le texte
await user.type(input, 'Replaced')

// Touches spéciales
await user.type(input, 'text{Enter}')         // Enter
await user.type(input, '{Backspace}{Backspace}')  // Supprimer 2 caractères
await user.type(input, '{Shift>}abc{/Shift}')     // ABC (avec Shift)
```

### Sélection

```tsx
// Select
await user.selectOptions(select, 'option-value')
await user.selectOptions(select, ['value1', 'value2'])  // Multiple

// Checkbox / Radio
await user.click(checkbox)  // Toggle
```

### Clavier

```tsx
// Touche simple
await user.keyboard('{Enter}')
await user.keyboard('{Escape}')

// Combinaisons
await user.keyboard('{Control>}a{/Control}')  // Ctrl+A
await user.keyboard('{Shift>}{Tab}{/Shift}')  // Shift+Tab
```

### Focus et Tab

```tsx
// Tab pour naviguer
await user.tab()
await user.tab({ shift: true })  // Shift+Tab

// Focus explicite (rare, préférer tab)
input.focus()
```

---

## Tester un formulaire contrôlé

### Exemple complet

```tsx
function LoginForm({ onSubmit }: { onSubmit: (data: { email: string; password: string }) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ email, password })
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </label>
      <button type="submit">Login</button>
    </form>
  )
}

// Tests
describe('LoginForm', () => {
  it('should submit with entered values', async () => {
    const user = userEvent.setup()
    const handleSubmit = jest.fn()

    render(<LoginForm onSubmit={handleSubmit} />)

    // Remplir le formulaire
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'secret123')

    // Soumettre
    await user.click(screen.getByRole('button', { name: /login/i }))

    // Vérifier
    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'secret123'
    })
  })

  it('should submit on Enter key', async () => {
    const user = userEvent.setup()
    const handleSubmit = jest.fn()

    render(<LoginForm onSubmit={handleSubmit} />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'secret123{Enter}')

    expect(handleSubmit).toHaveBeenCalled()
  })
})
```

---

## Tester un composant avec useReducer

```tsx
function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, { todos: [] })

  return (
    <div>
      <form onSubmit={e => {
        e.preventDefault()
        const input = e.currentTarget.elements.namedItem('todo') as HTMLInputElement
        dispatch({ type: 'ADD_TODO', payload: input.value })
        input.value = ''
      }}>
        <input name="todo" placeholder="Add todo" />
        <button type="submit">Add</button>
      </form>
      <ul>
        {state.todos.map(todo => (
          <li key={todo.id}>
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })}>
              Toggle
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Tests
describe('TodoApp', () => {
  it('should add a todo', async () => {
    const user = userEvent.setup()
    render(<TodoApp />)

    await user.type(screen.getByPlaceholderText(/add todo/i), 'Learn React')
    await user.click(screen.getByRole('button', { name: /add/i }))

    expect(screen.getByText('Learn React')).toBeInTheDocument()
  })

  it('should toggle a todo', async () => {
    const user = userEvent.setup()
    render(<TodoApp />)

    // Ajouter un todo
    await user.type(screen.getByPlaceholderText(/add todo/i), 'Test todo')
    await user.click(screen.getByRole('button', { name: /add/i }))

    // Toggle
    await user.click(screen.getByRole('button', { name: /toggle/i }))

    // Vérifier le style (text-decoration)
    expect(screen.getByText('Test todo')).toHaveStyle('text-decoration: line-through')
  })

  it('should add multiple todos', async () => {
    const user = userEvent.setup()
    render(<TodoApp />)

    await user.type(screen.getByPlaceholderText(/add todo/i), 'First')
    await user.click(screen.getByRole('button', { name: /add/i }))

    await user.type(screen.getByPlaceholderText(/add todo/i), 'Second')
    await user.click(screen.getByRole('button', { name: /add/i }))

    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })
})
```

---

## Tester le reducer séparément

Avantage de `useReducer` : le reducer est testable en isolation.

```tsx
describe('todoReducer', () => {
  const initialState: State = { todos: [] }

  it('should add a todo', () => {
    const action: Action = { type: 'ADD_TODO', payload: 'Test' }

    const newState = todoReducer(initialState, action)

    expect(newState.todos).toHaveLength(1)
    expect(newState.todos[0]).toMatchObject({
      text: 'Test',
      completed: false
    })
  })

  it('should toggle a todo', () => {
    const stateWithTodo: State = {
      todos: [{ id: '1', text: 'Test', completed: false }]
    }
    const action: Action = { type: 'TOGGLE_TODO', payload: '1' }

    const newState = todoReducer(stateWithTodo, action)

    expect(newState.todos[0].completed).toBe(true)
  })

  it('should not mutate the original state', () => {
    const action: Action = { type: 'ADD_TODO', payload: 'Test' }

    const newState = todoReducer(initialState, action)

    expect(newState).not.toBe(initialState)
    expect(initialState.todos).toHaveLength(0)  // Non muté
  })
})
```

---

## Tester la validation de formulaire

```tsx
describe('Form validation', () => {
  it('should show error for empty email', async () => {
    const user = userEvent.setup()
    render(<LoginForm onSubmit={jest.fn()} />)

    // Soumettre sans remplir
    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(screen.getByText(/email required/i)).toBeInTheDocument()
  })

  it('should show error for invalid email', async () => {
    const user = userEvent.setup()
    render(<LoginForm onSubmit={jest.fn()} />)

    await user.type(screen.getByLabelText(/email/i), 'invalid')
    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
  })

  it('should clear error when user corrects input', async () => {
    const user = userEvent.setup()
    render(<LoginForm onSubmit={jest.fn()} />)

    // Déclencher l'erreur
    await user.click(screen.getByRole('button', { name: /login/i }))
    expect(screen.getByText(/email required/i)).toBeInTheDocument()

    // Corriger
    await user.type(screen.getByLabelText(/email/i), 'valid@email.com')

    // L'erreur doit disparaître
    expect(screen.queryByText(/email required/i)).not.toBeInTheDocument()
  })
})
```

---

## Patterns avancés

### Attendre un changement

```tsx
import { waitFor } from '@testing-library/react'

it('should show success message after async submit', async () => {
  const user = userEvent.setup()
  render(<AsyncForm />)

  await user.click(screen.getByRole('button', { name: /submit/i }))

  // Attendre que le message apparaisse
  await waitFor(() => {
    expect(screen.getByText(/success/i)).toBeInTheDocument()
  })
})
```

### Vérifier qu'un élément disparaît

```tsx
import { waitForElementToBeRemoved } from '@testing-library/react'

it('should hide loading indicator', async () => {
  render(<AsyncComponent />)

  // Attendre que le loader disparaisse
  await waitForElementToBeRemoved(() => screen.queryByText(/loading/i))

  // Vérifier le contenu final
  expect(screen.getByText(/data loaded/i)).toBeInTheDocument()
})
```

### Tests paramétrés

```tsx
describe.each([
  { input: '', error: 'Email required' },
  { input: 'invalid', error: 'Invalid email format' },
  { input: 'a@b', error: 'Invalid email format' },
])('email validation', ({ input, error }) => {
  it(`should show "${error}" for input "${input}"`, async () => {
    const user = userEvent.setup()
    render(<EmailInput />)

    if (input) {
      await user.type(screen.getByRole('textbox'), input)
    }
    await user.tab()  // Blur pour déclencher la validation

    expect(screen.getByText(error)).toBeInTheDocument()
  })
})
```

---

## Anti-patterns

### 1. Tester l'implémentation

```tsx
// ❌ Teste l'implémentation
it('should call setCount', () => {
  const setCount = jest.fn()
  jest.spyOn(React, 'useState').mockReturnValue([0, setCount])
  // ...
})

// ✅ Teste le comportement
it('should display incremented value', async () => {
  render(<Counter />)
  await user.click(screen.getByRole('button'))
  expect(screen.getByText('1')).toBeInTheDocument()
})
```

### 2. Utiliser fireEvent au lieu de userEvent

```tsx
// ❌ Moins réaliste
fireEvent.change(input, { target: { value: 'text' } })

// ✅ Simule une vraie frappe
await user.type(input, 'text')
```

### 3. Oublier await avec userEvent

```tsx
// ❌ Les actions ne sont pas attendues
user.click(button)
user.type(input, 'text')
expect(...)  // Peut échouer !

// ✅ Toujours await
await user.click(button)
await user.type(input, 'text')
expect(...)
```

---

## Checklist pour les tests d'interaction

- [ ] Utiliser `userEvent.setup()` au début du test
- [ ] `await` chaque action userEvent
- [ ] Tester le comportement visible, pas l'implémentation
- [ ] Utiliser les queries par rôle en priorité
- [ ] Tester les cas d'erreur et de validation
- [ ] Pour les reducers, tester aussi en isolation

---

→ [Exercices pratiques](./exercises.md)
