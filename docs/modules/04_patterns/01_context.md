# Context API en profondeur

## Introduction

Context API est le mécanisme natif de React pour partager des données à travers l'arbre de composants **sans passer les props manuellement** à chaque niveau (prop drilling).

> **Analogie Vue.js** : Context API est l'équivalent de `provide/inject`. Le `Provider` correspond à `provide()`, et `useContext` correspond à `inject()`.

> **Analogie backend** : Context API est un **conteneur d'injection de dépendances** (DI Container). Le Provider enregistre les dépendances, et `useContext` les résout. Mais contrairement à un DI Container classique, Context est **réactif** : quand la valeur change, les consommateurs se re-rendent.

---

## Le problème : Prop Drilling

```tsx
// Sans Context : les props traversent des composants intermédiaires inutilement
function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  return <Layout theme={theme} setTheme={setTheme} />
}

function Layout({ theme, setTheme }: LayoutProps) {
  // Layout n'utilise PAS theme, il ne fait que le passer
  return <Sidebar theme={theme} setTheme={setTheme} />
}

function Sidebar({ theme, setTheme }: SidebarProps) {
  // Sidebar non plus, il passe encore
  return <ThemeToggle theme={theme} setTheme={setTheme} />
}

function ThemeToggle({ theme, setTheme }: ThemeToggleProps) {
  // Seul ThemeToggle a besoin de theme
  return <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme}</button>
}
```

**Problèmes** :

- Composants intermédiaires polués par des props qu'ils n'utilisent pas
- Maintenance difficile : ajouter/supprimer une prop = modifier toute la chaîne
- Couplage fort entre composants non liés

---

## Créer un Context

### 1. Définir le Context

```tsx
import { createContext } from 'react'

// Créer le context avec une valeur par défaut
// La valeur par défaut est utilisée UNIQUEMENT si aucun Provider n'est trouvé
interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)
```

> **Pourquoi `null` comme défaut ?** Plutôt que de fournir une fausse valeur par défaut, on utilise `null` pour détecter l'absence de Provider. Cela force une erreur explicite plutôt qu'un bug silencieux.

### 2. Créer le Provider

```tsx
import { useState, type ReactNode } from 'react'

interface ThemeProviderProps {
  children: ReactNode
}

function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}
```

### 3. Créer un hook custom pour consommer le Context

```tsx
import { useContext } from 'react'

function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
```

> **Pattern essentiel** : Toujours encapsuler `useContext` dans un hook custom. Cela permet :
>
> - Un message d'erreur clair si le Provider est absent
> - L'encapsulation du context (les consommateurs n'importent jamais `ThemeContext` directement)
> - Un point unique de modification si l'implémentation change

### 4. Utiliser le Context

```tsx
// Dans le composant racine : fournir le context
function App() {
  return (
    <ThemeProvider>
      <Layout />
    </ThemeProvider>
  )
}

// N'importe où dans l'arbre : consommer directement
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return <button onClick={toggleTheme}>{theme}</button>
}

// Layout et Sidebar n'ont plus besoin de passer les props !
function Layout() {
  return <Sidebar />
}

function Sidebar() {
  return <ThemeToggle />
}
```

---

## Organisation recommandée d'un Context

Un Context bien structuré suit ce pattern en trois fichiers (ou un seul fichier pour les cas simples) :

```
src/contexts/
  theme/
    ThemeContext.tsx    # createContext + types + Provider + hook
```

Ou plus simplement, un seul fichier qui exporte le Provider et le hook :

```tsx
// src/contexts/ThemeContext.tsx

// 1. Types
interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

// 2. Context (pas exporté !)
const ThemeContext = createContext<ThemeContextType | null>(null)

// 3. Provider (exporté)
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

// 4. Hook custom (exporté)
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
```

> **Point clé** : Seuls `ThemeProvider` et `useTheme` sont exportés. Le `ThemeContext` lui-même reste **privé**. C'est de l'encapsulation : les consommateurs ne dépendent pas de l'implémentation interne.

---

## Le problème des re-renders

### Le piège classique

```tsx
function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // PROBLEME : un seul objet contient tout
  // Quand theme change, TOUS les consommateurs de user re-rendent aussi !
  return (
    <AppContext.Provider value={{ user, setUser, theme, setTheme }}>{children}</AppContext.Provider>
  )
}
```

**Pourquoi ?** Chaque fois que le Provider re-rend, il crée un **nouvel objet** `value`. React compare par référence (`===`), donc tous les consommateurs de ce context sont notifiés, même si seule une partie de la valeur a changé.

> **Différence avec Vue.js** : `provide/inject` en Vue.js avec des `ref()` est granulaire par propriété. React Context n'a pas de sélecteur : c'est tout ou rien.

### Solution 1 : Context Splitting

Séparer les données qui changent à des fréquences différentes en contextes distincts :

```tsx
// Contextes séparés
const UserContext = createContext<UserContextType | null>(null)
const ThemeContext = createContext<ThemeContextType | null>(null)

function AppProviders({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </UserProvider>
  )
}
```

> **Règle d'or** : séparer les données qui changent souvent de celles qui changent rarement.

### Solution 2 : Séparer state et dispatch

Pattern très courant inspiré de Redux :

```tsx
// Un context pour les données (change souvent)
const TodoStateContext = createContext<TodoState | null>(null)

// Un context pour les actions (ne change jamais)
const TodoDispatchContext = createContext<TodoDispatch | null>(null)

function TodoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(todoReducer, initialState)

  return (
    <TodoStateContext.Provider value={state}>
      <TodoDispatchContext.Provider value={dispatch}>{children}</TodoDispatchContext.Provider>
    </TodoStateContext.Provider>
  )
}

// Les composants qui ne font qu'écrire n'importent que le dispatch
// Ils ne re-rendent PAS quand le state change
export function useTodoDispatch() {
  const context = useContext(TodoDispatchContext)
  if (!context) throw new Error('useTodoDispatch must be used within TodoProvider')
  return context
}
```

> **Analogie CQRS** : C'est exactement le pattern que tu connais ! Le state context est la **Query** (lecture), le dispatch context est le **Command** (écriture). Les composants qui n'affichent rien mais déclenchent des actions ne s'abonnent qu'au Command side.

### Solution 3 : React Compiler (React 19)

Avec le React Compiler activé dans ce projet, certaines optimisations sont automatiques. Le Compiler peut mémoriser automatiquement les objets `value` du Provider. Cependant, le Context Splitting reste recommandé pour les cas complexes car c'est une optimisation architecturale, pas juste une optimisation de rendu.

---

## Provider Composition Pattern

Quand une app a beaucoup de Providers, on évite le "Provider Hell" :

```tsx
// AVANT : Provider Hell
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <Layout />
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
```

### Solution : ComposeProviders

```tsx
interface ComposeProvidersProps {
  providers: Array<React.ComponentType<{ children: ReactNode }>>
  children: ReactNode
}

function ComposeProviders({ providers, children }: ComposeProvidersProps) {
  return providers.reduceRight((acc, Provider) => <Provider>{acc}</Provider>, children)
}

// APRÈS : propre et lisible
function App() {
  return (
    <ComposeProviders providers={[ThemeProvider, AuthProvider, NotificationProvider, CartProvider]}>
      <Layout />
    </ComposeProviders>
  )
}
```

> **Note** : L'ordre des providers peut être important si certains dépendent d'autres. Les providers listés en premier sont les plus "extérieurs" dans l'arbre.

---

## Quand utiliser Context (et quand ne PAS l'utiliser)

### Bon usage de Context

| Cas d'usage           | Exemples                            |
| --------------------- | ----------------------------------- |
| Thème / design system | `ThemeContext`                      |
| Authentification      | `AuthContext` (user, login, logout) |
| Locale / i18n         | `LocaleContext`                     |
| Feature flags         | `FeatureFlagContext`                |
| Configuration         | Paramètres qui changent rarement    |

### Mauvais usage de Context

| Situation                                               | Alternative                    |
| ------------------------------------------------------- | ------------------------------ |
| State qui change très souvent (position souris, scroll) | Zustand, Jotai, ou state local |
| State complexe avec beaucoup de logique                 | Zustand + middleware           |
| State partagé entre routes non liées                    | State management externe       |
| Prop drilling sur 2 niveaux seulement                   | Passer les props directement   |

### Limites de Context

1. **Pas de sélecteur** : impossible de s'abonner à une partie du context
2. **Re-render en cascade** : tous les consommateurs re-rendent quand la valeur change
3. **Couplage au Provider** : le composant doit être enfant d'un Provider
4. **Pas de middleware** : pas de logging, persistence, ou devtools intégrés
5. **Verbeux** : beaucoup de boilerplate pour des cas complexes

---

## Résumé

| Concept              | Détail                                                   |
| -------------------- | -------------------------------------------------------- |
| `createContext`      | Crée un context avec valeur par défaut                   |
| `Provider`           | Fournit la valeur à l'arbre de composants                |
| `useContext`         | Consomme la valeur (toujours dans un hook custom)        |
| Context Splitting    | Séparer les contexts pour éviter les re-renders inutiles |
| State/Dispatch split | Pattern CQRS : séparer lecture et écriture               |
| `null` par défaut    | Force la détection d'un Provider manquant                |
| Hook custom          | Encapsule le context, message d'erreur explicite         |

---

→ Prochain cours : [Compound Components](./02_compound.md)
→ [Exercices du module](./exercises.md)
