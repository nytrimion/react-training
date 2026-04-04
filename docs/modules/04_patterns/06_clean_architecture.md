# Clean Architecture avec React

## Introduction

Tu connais la Clean Architecture de Robert C. Martin côté backend. Ce cours montre comment appliquer les mêmes principes dans une application React : séparation des concerns, dependency inversion, et testabilité de chaque couche.

> **Point clé** : React n'impose aucune architecture. C'est à toi de structurer ton code. Les patterns que tu connais en DDD/Clean Architecture s'appliquent, mais adaptés au monde frontend.

---

## Les couches en React

### Architecture classique backend

```
┌──────────────────────────┐
│      Presentation        │  ← Controllers, Views
├──────────────────────────┤
│      Application         │  ← Use Cases, Services
├──────────────────────────┤
│        Domain            │  ← Entities, Value Objects
├──────────────────────────┤
│     Infrastructure       │  ← Database, API, External
└──────────────────────────┘
```

### Transposition React

```
┌──────────────────────────┐
│      Components (UI)     │  ← Composants React, JSX, styles
├──────────────────────────┤
│      Hooks (Logic)       │  ← Custom hooks, orchestration
├──────────────────────────┤
│      Types (Domain)      │  ← Interfaces, types, validation
├──────────────────────────┤
│      API (Infra)         │  ← Fetch, API clients, adapters
└──────────────────────────┘
```

| Couche backend | Couche React   | Rôle                                   |
| -------------- | -------------- | -------------------------------------- |
| Presentation   | Components     | Affichage pur, pas de logique métier   |
| Application    | Hooks          | Orchestration, logique de flux         |
| Domain         | Types          | Modèle de données, règles métier pures |
| Infrastructure | API / Services | Communication avec l'extérieur         |

---

## Structure par feature

### Approche traditionnelle (par type)

```
src/
  components/           # TOUS les composants
    UserList.tsx
    UserCard.tsx
    TodoList.tsx
    TodoItem.tsx
  hooks/                # TOUS les hooks
    useUsers.ts
    useTodos.ts
  api/                  # TOUTES les API
    userApi.ts
    todoApi.ts
  types/                # TOUS les types
    User.ts
    Todo.ts
```

**Problème** : quand le projet grandit, les dossiers deviennent des fourre-tout. Modifier une feature touche 4 dossiers différents. La cohésion est faible.

### Approche par feature (recommandée)

```
src/
  features/
    users/
      types/
        User.ts                # Types du domaine
      api/
        userApi.ts             # Appels API
      hooks/
        useUsers.ts            # Logique métier
        useUserForm.ts         # Logique formulaire
      components/
        UserList.tsx           # Composant liste
        UserCard.tsx           # Composant carte
        UserForm.tsx           # Composant formulaire
      __tests__/
        useUsers.test.ts       # Tests hooks
        UserList.test.tsx      # Tests composants
      index.ts                 # Export public

    todos/
      types/
        Todo.ts
      api/
        todoApi.ts
      hooks/
        useTodos.ts
      components/
        TodoList.tsx
        TodoItem.tsx
      index.ts

  components/                  # Composants partagés (Button, Card, Modal)
  hooks/                       # Hooks partagés (useLocalStorage, useDebounce)
  lib/                         # Utilitaires partagés
```

> **Analogie DDD** : chaque feature est un **Bounded Context**. Les exports dans `index.ts` définissent l'**interface publique** du module. Les composants internes sont des détails d'implémentation.

### L'export public (`index.ts`)

```tsx
// src/features/users/index.ts

// Export public : ce que les autres features peuvent utiliser
export { UserList } from './components/UserList'
export { UserCard } from './components/UserCard'
export { useUsers } from './hooks/useUsers'
export type { User } from './types/User'

// PAS exporté : détails d'implémentation
// userApi.ts → consommé uniquement par useUsers
// UserForm.tsx → utilisé uniquement dans la feature
```

> **Règle** : une feature ne doit **jamais** importer les fichiers internes d'une autre feature. Toujours passer par l'export public.

---

## Séparation des couches en détail

### Couche Types (Domain)

Types purs, pas de dépendance React :

```tsx
// src/features/contacts/types/Contact.ts

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  createdAt: Date
}

export interface CreateContactInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
}

// Logique métier pure (fonction, pas de hook)
export function getContactDisplayName(contact: Contact): string {
  return `${contact.firstName} ${contact.lastName}`
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
```

> **Point clé** : cette couche est **100% testable** sans React, sans DOM, sans rien. Ce sont des fonctions pures.

### Couche API (Infrastructure)

Isole toute communication externe :

```tsx
// src/features/contacts/api/contactApi.ts

import type { Contact, CreateContactInput } from '../types/Contact'

const API_BASE = '/api/contacts'

export async function fetchContacts(): Promise<Contact[]> {
  const response = await fetch(API_BASE)
  if (!response.ok) throw new Error('Failed to fetch contacts')
  return response.json()
}

export async function createContact(input: CreateContactInput): Promise<Contact> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new Error('Failed to create contact')
  return response.json()
}

export async function deleteContact(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error('Failed to delete contact')
}
```

> **Avantage** : cette couche est facilement **mockable** dans les tests. On peut aussi la remplacer par un vrai backend ou un mock local sans toucher au reste.

### Couche Hooks (Application / Use Cases)

Orchestre la logique métier et l'API :

```tsx
// src/features/contacts/hooks/useContacts.ts

import { useState, useEffect } from 'react'
import type { Contact, CreateContactInput } from '../types/Contact'
import { fetchContacts, createContact, deleteContact } from '../api/contactApi'

interface UseContactsResult {
  contacts: Contact[]
  loading: boolean
  error: Error | null
  addContact: (input: CreateContactInput) => Promise<void>
  removeContact: (id: string) => Promise<void>
  search: (query: string) => void
  filteredContacts: Contact[]
}

export function useContacts(): UseContactsResult {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let cancelled = false

    fetchContacts()
      .then((data) => {
        if (!cancelled) {
          setContacts(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const addContact = async (input: CreateContactInput) => {
    const newContact = await createContact(input)
    setContacts((prev) => [...prev, newContact])
  }

  const removeContact = async (id: string) => {
    await deleteContact(id)
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }

  const filteredContacts = contacts.filter((c) =>
    `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return {
    contacts,
    loading,
    error,
    addContact,
    removeContact,
    search: setSearchQuery,
    filteredContacts,
  }
}
```

> **Analogie CQRS** : le hook est comme un **Application Service** qui orchestre les Use Cases. Il ne contient pas de logique métier complexe (ça c'est dans `types/`), il coordonne les appels API et le state.

### Couche Components (Presentation)

Composants purs qui ne font qu'afficher :

```tsx
// src/features/contacts/components/ContactCard.tsx

import type { Contact } from '../types/Contact'
import { getContactDisplayName } from '../types/Contact'

interface ContactCardProps {
  contact: Contact
  onDelete: (id: string) => void
}

export function ContactCard({ contact, onDelete }: ContactCardProps) {
  return (
    <div className="p-4 border rounded">
      <h3>{getContactDisplayName(contact)}</h3>
      <p>{contact.email}</p>
      {contact.phone && <p>{contact.phone}</p>}
      <button onClick={() => onDelete(contact.id)}>Supprimer</button>
    </div>
  )
}
```

```tsx
// src/features/contacts/components/ContactList.tsx

import { useContacts } from '../hooks/useContacts'
import { ContactCard } from './ContactCard'

export function ContactList() {
  const { filteredContacts, loading, error, removeContact, search } = useContacts()

  if (loading) return <p>Chargement...</p>
  if (error) return <p>Erreur : {error.message}</p>

  return (
    <div>
      <input type="text" placeholder="Rechercher..." onChange={(e) => search(e.target.value)} />
      <div className="grid gap-4">
        {filteredContacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} onDelete={removeContact} />
        ))}
      </div>
    </div>
  )
}
```

> **Règle** : `ContactCard` est un composant **pur**. Il reçoit ses données en props et n'a aucune dépendance sur un hook ou une API. Il est testable avec un simple render + props.

---

## Dependency Injection en React

### Via les props (le plus simple)

```tsx
// Le composant reçoit le service en prop
interface ContactListProps {
  contactService: {
    fetchAll: () => Promise<Contact[]>
    delete: (id: string) => Promise<void>
  }
}
```

### Via Context (DI Container)

```tsx
// Définir le contrat (interface)
interface ContactService {
  fetchAll: () => Promise<Contact[]>
  create: (input: CreateContactInput) => Promise<Contact>
  delete: (id: string) => Promise<void>
}

// Context = DI Container
const ContactServiceContext = createContext<ContactService | null>(null)

// Implémentation réelle
const realContactService: ContactService = {
  fetchAll: () => fetch('/api/contacts').then((r) => r.json()),
  create: (input) => fetch('/api/contacts', {
    method: 'POST',
    body: JSON.stringify(input),
  }).then((r) => r.json()),
  delete: (id) => fetch(`/api/contacts/${id}`, { method: 'DELETE' }).then(() => {}),
}

// Implémentation mock pour les tests
const mockContactService: ContactService = {
  fetchAll: async () => [
    { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', createdAt: new Date() },
  ],
  create: async (input) => ({
    id: crypto.randomUUID(),
    ...input,
    createdAt: new Date(),
  }),
  delete: async () => {},
}

// Provider en production
<ContactServiceContext.Provider value={realContactService}>
  <App />
</ContactServiceContext.Provider>

// Provider en test
<ContactServiceContext.Provider value={mockContactService}>
  <ContactList />
</ContactServiceContext.Provider>
```

> **Analogie directe** : c'est exactement un **DI Container** avec inversion de dépendance. Le hook dépend de l'interface `ContactService`, pas de l'implémentation. On peut injecter n'importe quelle implémentation via le Provider.

---

## Communication entre features

### Via des hooks partagés

```tsx
// src/hooks/useEventBus.ts — Event-driven communication
type EventHandler<T = unknown> = (data: T) => void

const handlers = new Map<string, Set<EventHandler>>()

export function useEventBus() {
  const emit = (event: string, data?: unknown) => {
    handlers.get(event)?.forEach((handler) => handler(data))
  }

  const on = (event: string, handler: EventHandler) => {
    if (!handlers.has(event)) handlers.set(event, new Set())
    handlers.get(event)!.add(handler)

    return () => {
      handlers.get(event)?.delete(handler)
    }
  }

  return { emit, on }
}
```

### Via Zustand (store partagé)

```tsx
// Un store partagé pour la communication inter-features
const useAppStore = create<AppStore>((set) => ({
  selectedContactId: null,
  setSelectedContact: (id: string | null) => set({ selectedContactId: id }),
}))
```

> **Analogie Event-Driven** : les features communiquent via des événements ou un state partagé, jamais par import direct de composants internes. C'est le même principe que l'Event Bus ou le Mediator pattern côté backend.

---

## Règles d'architecture

### 1. Dependency Rule

Les dépendances vont toujours vers l'intérieur :

```
Components → Hooks → Types ← API
     ↓          ↓       ↑       ↑
   (UI)     (Logic)  (Domain) (Infra)
```

- Components importent Hooks et Types
- Hooks importent API et Types
- Types n'importent **rien** (couche la plus interne)
- API importe Types

### 2. Pas de logique métier dans les composants

```tsx
// MAL
function ContactList() {
  const contacts = useContacts()
  // Logique métier dans le composant !
  const vipContacts = contacts.filter((c) => c.orders > 100 && c.totalSpent > 10000)
}

// BIEN
function ContactList() {
  const { vipContacts } = useContacts() // Le hook expose les données prêtes
}
```

### 3. Composants testables indépendamment

```tsx
// ContactCard ne dépend de rien d'externe → testable avec un simple render
render(<ContactCard contact={mockContact} onDelete={vi.fn()} />)
```

---

## Résumé

| Couche         | Contenu                                 | Dépendances  | Testable sans             |
| -------------- | --------------------------------------- | ------------ | ------------------------- |
| **Types**      | Interfaces, validation, fonctions pures | Aucune       | Tout (fonctions pures)    |
| **API**        | Fetch, clients HTTP                     | Types        | React, DOM                |
| **Hooks**      | Orchestration, state, effects           | API, Types   | DOM (via testing library) |
| **Components** | JSX, styles, événements                 | Hooks, Types | API (via props/mocks)     |

| Principe                | Application React                                  |
| ----------------------- | -------------------------------------------------- |
| Single Responsibility   | Un hook = un use case, un composant = un affichage |
| Open/Closed             | Composants extensibles via props/composition       |
| Dependency Inversion    | Context = DI Container, dépendre des interfaces    |
| Feature-based structure | Bounded Contexts = dossiers features               |

---

→ Prochain cours : [Testing](./07_testing.md)
→ [Exercices du module](./exercises.md)
