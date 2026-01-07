# 5. Testing des composants React

## Pourquoi tester ?

Avec ton expérience, tu connais la valeur des tests. En React, les tests permettent de :

- Valider le comportement des composants
- Documenter les cas d'usage attendus
- Refactorer en confiance
- Attraper les régressions tôt

---

## Testing Library : la philosophie

React Testing Library est basée sur un principe simple :

> "The more your tests resemble the way your software is used, the more confidence they can give you."

Contrairement à Enzyme (ancien outil), Testing Library :

- Teste le **comportement**, pas l'implémentation
- Interagit comme un **utilisateur** (clics, saisie, lecture)
- N'accède pas aux internals des composants

### Analogie

Si tu as fait du testing en Vue avec Vue Test Utils, Testing Library est similaire mais plus orienté "user-centric".

---

## Setup (rappel)

Si tu as suivi le guide d'installation, Jest et Testing Library sont configurés. Sinon :

```bash
pnpm add -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @types/jest
```

```typescript
// jest.setup.ts
import '@testing-library/jest-dom'
```

---

## Premier test : render et query

### Le composant à tester

```tsx
// src/components/Greeting.tsx
interface GreetingProps {
  name: string
}

export function Greeting({ name }: GreetingProps) {
  return <h1>Hello, {name}!</h1>
}
```

### Le test

```tsx
// src/components/Greeting.test.tsx
import { render, screen } from '@testing-library/react'
import { Greeting } from './Greeting'

describe('Greeting', () => {
  it('renders the name', () => {
    // Arrange : render le composant
    render(<Greeting name="Alice" />)

    // Assert : vérifier le résultat
    expect(screen.getByText('Hello, Alice!')).toBeInTheDocument()
  })
})
```

### Exécuter

```bash
pnpm test
# ou en watch mode
pnpm test:watch
```

---

## Les queries de Testing Library

### Priorité des queries (du plus au moins recommandé)

| Query                  | Usage                             | Exemple                                   |
| ---------------------- | --------------------------------- | ----------------------------------------- |
| `getByRole`            | Accessibilité, le plus recommandé | `getByRole('button', { name: 'Submit' })` |
| `getByLabelText`       | Formulaires                       | `getByLabelText('Email')`                 |
| `getByPlaceholderText` | Inputs avec placeholder           | `getByPlaceholderText('Search...')`       |
| `getByText`            | Contenu textuel                   | `getByText('Hello, World!')`              |
| `getByDisplayValue`    | Valeur actuelle d'un input        | `getByDisplayValue('john@example.com')`   |
| `getByAltText`         | Images                            | `getByAltText('Profile picture')`         |
| `getByTitle`           | Attribut title                    | `getByTitle('Close')`                     |
| `getByTestId`          | Dernier recours                   | `getByTestId('custom-element')`           |

### Variantes des queries

| Préfixe   | Comportement si non trouvé | Async |
| --------- | -------------------------- | ----- |
| `getBy`   | Throw error                | Non   |
| `queryBy` | Retourne null              | Non   |
| `findBy`  | Throw error après timeout  | Oui   |

```tsx
// getBy - pour les éléments qui DOIVENT être présents
const button = screen.getByRole('button')

// queryBy - pour vérifier l'ABSENCE d'un élément
expect(screen.queryByText('Error')).not.toBeInTheDocument()

// findBy - pour les éléments qui apparaissent de manière ASYNCHRONE
const message = await screen.findByText('Data loaded')
```

### Queries multiples

```tsx
// getAllBy - plusieurs éléments attendus
const items = screen.getAllByRole('listitem')
expect(items).toHaveLength(3)

// queryAllBy - zéro ou plusieurs
const errors = screen.queryAllByRole('alert')
expect(errors).toHaveLength(0)
```

---

## Tester les interactions

### Setup avec userEvent

```bash
pnpm add -D @testing-library/user-event
```

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Button', () => {
  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()

    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByRole('button', { name: 'Click me' }))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Pourquoi userEvent plutôt que fireEvent ?

```tsx
// ❌ fireEvent - simulation bas niveau
import { fireEvent } from '@testing-library/react'
fireEvent.click(button)

// ✅ userEvent - simulation réaliste
import userEvent from '@testing-library/user-event'
await user.click(button) // Simule hover, focus, mousedown, mouseup, click
```

`userEvent` simule le comportement réel d'un utilisateur, incluant le focus, les événements de souris, etc.

---

## Exemples de tests courants

### Test d'un formulaire

```tsx
// src/components/LoginForm.tsx
interface LoginFormProps {
  onSubmit: (email: string, password: string) => void
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    onSubmit(formData.get('email') as string, formData.get('password') as string)
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email
        <input type="email" name="email" required />
      </label>
      <label>
        Password
        <input type="password" name="password" required />
      </label>
      <button type="submit">Sign In</button>
    </form>
  )
}
```

```tsx
// src/components/LoginForm.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('submits the form with email and password', async () => {
    const user = userEvent.setup()
    const handleSubmit = jest.fn()

    render(<LoginForm onSubmit={handleSubmit} />)

    // Remplir le formulaire
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')

    // Soumettre
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    // Vérifier
    expect(handleSubmit).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('requires email and password', async () => {
    const user = userEvent.setup()
    const handleSubmit = jest.fn()

    render(<LoginForm onSubmit={handleSubmit} />)

    // Tenter de soumettre sans remplir
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    // Le formulaire ne devrait pas être soumis (validation HTML5)
    expect(handleSubmit).not.toHaveBeenCalled()
  })
})
```

### Test de rendu conditionnel

```tsx
// src/components/StatusMessage.tsx
interface StatusMessageProps {
  status: 'loading' | 'error' | 'success'
  message?: string
}

export function StatusMessage({ status, message }: StatusMessageProps) {
  if (status === 'loading') {
    return <div role="status">Loading...</div>
  }

  if (status === 'error') {
    return (
      <div role="alert" className="error">
        {message || 'An error occurred'}
      </div>
    )
  }

  return (
    <div role="status" className="success">
      {message || 'Success!'}
    </div>
  )
}
```

```tsx
// src/components/StatusMessage.test.tsx
import { render, screen } from '@testing-library/react'
import { StatusMessage } from './StatusMessage'

describe('StatusMessage', () => {
  it('shows loading state', () => {
    render(<StatusMessage status="loading" />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading...')
  })

  it('shows error state with custom message', () => {
    render(<StatusMessage status="error" message="Network error" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Network error')
  })

  it('shows success state with default message', () => {
    render(<StatusMessage status="success" />)
    expect(screen.getByRole('status')).toHaveTextContent('Success!')
  })
})
```

### Test d'une liste

```tsx
// src/components/TodoList.tsx
interface Todo {
  id: string
  text: string
  completed: boolean
}

interface TodoListProps {
  todos: Todo[]
  onToggle: (id: string) => void
}

export function TodoList({ todos, onToggle }: TodoListProps) {
  if (todos.length === 0) {
    return <p>No todos yet</p>
  }

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <label>
            <input type="checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)} />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
          </label>
        </li>
      ))}
    </ul>
  )
}
```

```tsx
// src/components/TodoList.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoList } from './TodoList'

describe('TodoList', () => {
  const mockTodos = [
    { id: '1', text: 'Learn React', completed: false },
    { id: '2', text: 'Write tests', completed: true },
  ]

  it('renders empty state when no todos', () => {
    render(<TodoList todos={[]} onToggle={jest.fn()} />)
    expect(screen.getByText('No todos yet')).toBeInTheDocument()
  })

  it('renders all todos', () => {
    render(<TodoList todos={mockTodos} onToggle={jest.fn()} />)

    expect(screen.getByText('Learn React')).toBeInTheDocument()
    expect(screen.getByText('Write tests')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('shows completed todos with checkbox checked', () => {
    render(<TodoList todos={mockTodos} onToggle={jest.fn()} />)

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).not.toBeChecked() // Learn React
    expect(checkboxes[1]).toBeChecked() // Write tests
  })

  it('calls onToggle when checkbox is clicked', async () => {
    const user = userEvent.setup()
    const handleToggle = jest.fn()

    render(<TodoList todos={mockTodos} onToggle={handleToggle} />)

    await user.click(screen.getAllByRole('checkbox')[0])

    expect(handleToggle).toHaveBeenCalledWith('1')
  })
})
```

---

## Bonnes pratiques

### 1. Un test = un comportement

```tsx
// ❌ Trop de choses dans un test
it('works', () => {
  render(<Form />)
  // 50 lignes de vérifications...
})

// ✅ Tests focalisés
it('validates email format')
it('shows error on invalid input')
it('submits form with valid data')
```

### 2. Éviter les tests d'implémentation

```tsx
// ❌ Test l'implémentation
expect(component.state.isOpen).toBe(true)

// ✅ Test le comportement visible
expect(screen.getByRole('dialog')).toBeVisible()
```

### 3. Utiliser les rôles ARIA

```tsx
// ❌ Sélecteur fragile
screen.getByClassName('btn-primary')

// ✅ Sélecteur accessible
screen.getByRole('button', { name: 'Submit' })
```

### 4. Préférer findBy pour l'async

```tsx
// ❌ waitFor avec getBy
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})

// ✅ findBy directement
expect(await screen.findByText('Loaded')).toBeInTheDocument()
```

---

## Debug des tests

### screen.debug()

```tsx
it('debug example', () => {
  render(<MyComponent />)

  screen.debug() // Affiche le DOM dans la console

  // Debug un élément spécifique
  screen.debug(screen.getByRole('button'))
})
```

### logRoles

```tsx
import { logRoles } from '@testing-library/react'

it('shows available roles', () => {
  const { container } = render(<MyComponent />)
  logRoles(container) // Liste tous les rôles ARIA disponibles
})
```

### Testing Playground

Ajoute `screen.logTestingPlaygroundURL()` pour obtenir un lien vers Testing Playground avec ton markup.

---

## Structure des fichiers de test

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx    # Tests à côté du composant
│   │   └── index.ts
│   └── Form/
│       ├── Form.tsx
│       └── Form.test.tsx

# Ou dans un dossier __tests__
src/
├── components/
│   ├── Button.tsx
│   └── Form.tsx
└── __tests__/
    └── components/
        ├── Button.test.tsx
        └── Form.test.tsx
```

Les deux approches sont valides. La première (co-location) est plus populaire.

---

## Points clés à retenir

1. **Testing Library** teste le comportement, pas l'implémentation
2. **Queries par priorité** : `getByRole` > `getByLabelText` > `getByText` > `getByTestId`
3. **userEvent** pour des interactions réalistes
4. **findBy** pour les éléments asynchrones
5. **Un test = un comportement** clair et documenté
6. **screen.debug()** pour investiguer les problèmes

---

→ [Passer aux Exercices](./exercises.md)
