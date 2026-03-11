# Suspense & Error Boundaries

## Introduction

React fournit deux mécanismes pour gérer les états "exceptionnels" :

- **Suspense** : Gère les états de chargement (loading)
- **Error Boundaries** : Gère les erreurs de rendu

Ces deux patterns permettent de gérer proprement l'asynchrone et les erreurs sans polluer la logique des composants.

---

## Suspense

### Concept

`<Suspense>` permet d'afficher un **fallback** pendant que des composants enfants "suspendent" (attendent des données asynchrones).

```tsx
<Suspense fallback={<Loading />}>
  <AsyncComponent />
</Suspense>
```

### Comment ça marche ?

1. Un composant enfant **suspend** (throw une Promise)
2. React attrape cette Promise
3. React affiche le `fallback`
4. Quand la Promise résout, React affiche le composant

### Exemple basique

```tsx
import { Suspense } from 'react'

function UserProfile({ userId }: { userId: string }) {
  const user = use(fetchUser(userId)) // Suspend jusqu'à résolution
  return <div>{user.name}</div>
}

function App() {
  return (
    <Suspense fallback={<div>Loading user...</div>}>
      <UserProfile userId="1" />
    </Suspense>
  )
}
```

### Suspense imbriqués

Tu peux avoir plusieurs niveaux de Suspense pour un contrôle granulaire :

```tsx
function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Header />

      <div className="content">
        <Suspense fallback={<StatsSkeleton />}>
          <Stats />
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <Chart />
        </Suspense>

        <Suspense fallback={<TableSkeleton />}>
          <DataTable />
        </Suspense>
      </div>
    </Suspense>
  )
}
```

Chaque section se charge indépendamment, affichant son propre skeleton.

### Suspense avec streaming (Next.js)

Avec Next.js App Router, Suspense active le **streaming** :

```tsx
// app/page.tsx
export default function Page() {
  return (
    <main>
      <h1>Dashboard</h1>

      {/* Envoyé immédiatement */}
      <StaticContent />

      {/* Streamé quand prêt */}
      <Suspense fallback={<Loading />}>
        <SlowComponent />
      </Suspense>
    </main>
  )
}
```

Le contenu statique est envoyé immédiatement, puis le contenu lent est **streamé** au client quand il est prêt.

---

## Patterns Suspense courants

### 1. Loading skeleton

```tsx
function ProductListSkeleton() {
  return (
    <div className="grid gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-48 bg-gray-200 animate-pulse rounded" />
      ))}
    </div>
  )
}

function ProductsPage() {
  return (
    <Suspense fallback={<ProductListSkeleton />}>
      <ProductList />
    </Suspense>
  )
}
```

### 2. Suspense avec transition

Combine `useTransition` pour éviter de cacher le contenu existant :

```tsx
function SearchResults({ query }: { query: string }) {
  const [isPending, startTransition] = useTransition()
  const [currentQuery, setCurrentQuery] = useState(query)

  useEffect(() => {
    startTransition(() => {
      setCurrentQuery(query)
    })
  }, [query])

  return (
    <div style={{ opacity: isPending ? 0.7 : 1 }}>
      <Suspense fallback={<ResultsSkeleton />}>
        <Results query={currentQuery} />
      </Suspense>
    </div>
  )
}
```

### 3. Route transitions (Next.js)

Next.js utilise Suspense en interne pour les transitions de route :

```tsx
// app/layout.tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Navigation />
        <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
      </body>
    </html>
  )
}
```

---

## Error Boundaries

### Le problème

Les erreurs JavaScript dans les composants React peuvent casser toute l'application :

```tsx
function BuggyComponent() {
  throw new Error('Oops!') // 💥 Crash de l'app entière
}
```

### La solution : Error Boundary

Un **Error Boundary** est un composant qui "attrape" les erreurs de ses enfants :

```tsx
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Envoyer à un service de monitoring (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}
```

### Usage

```tsx
function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <MainContent />
    </ErrorBoundary>
  )
}
```

### Pourquoi une classe ?

C'est l'une des rares situations où une **class component** est nécessaire. Les hooks `getDerivedStateFromError` et `componentDidCatch` n'existent pas pour les functional components.

> **Note** : Des bibliothèques comme `react-error-boundary` fournissent une API plus moderne.

---

## react-error-boundary

La bibliothèque `react-error-boundary` simplifie la création d'Error Boundaries :

### Installation

```bash
pnpm add react-error-boundary
```

### Usage basique

```tsx
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <MainContent />
    </ErrorBoundary>
  )
}
```

### Avec reset automatique

```tsx
<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onReset={() => {
    // Reset l'état de l'application
  }}
  resetKeys={[userId]} // Reset automatique si userId change
>
  <UserProfile userId={userId} />
</ErrorBoundary>
```

### useErrorBoundary hook

```tsx
import { useErrorBoundary } from 'react-error-boundary'

function ComponentThatMayFail() {
  const { showBoundary } = useErrorBoundary()

  const handleClick = async () => {
    try {
      await riskyOperation()
    } catch (error) {
      showBoundary(error) // Déclenche l'Error Boundary parent
    }
  }

  return <button onClick={handleClick}>Do risky thing</button>
}
```

---

## Combiner Suspense et Error Boundaries

### Le pattern complet

```tsx
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

function DataSection() {
  return (
    <ErrorBoundary fallback={<ErrorMessage />}>
      <Suspense fallback={<LoadingSkeleton />}>
        <AsyncData />
      </Suspense>
    </ErrorBoundary>
  )
}
```

**Ordre important** : Error Boundary **autour** de Suspense, car les erreurs doivent être attrapées, même pendant le loading.

### Pattern avec retry

```tsx
function DataWithRetry({ query }: { query: string }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetErrorBoundary }) => (
        <div>
          <p>Error: {error.message}</p>
          <button onClick={resetErrorBoundary}>Retry</button>
        </div>
      )}
      resetKeys={[query]} // Reset si query change
    >
      <Suspense fallback={<Loading />}>
        <DataDisplay query={query} />
      </Suspense>
    </ErrorBoundary>
  )
}
```

---

## Ce que Suspense N'attrape PAS

Suspense gère uniquement les "suspensions" déclaratives. Il **n'attrape pas** :

- Les appels `fetch` dans `useEffect`
- Les erreurs JavaScript
- Les événements asynchrones

```tsx
// ❌ Ne suspend pas
function BadExample() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/data')
      .then((res) => res.json())
      .then(setData)
  }, [])

  if (!data) return <Loading /> // Gestion manuelle
  return <div>{data.name}</div>
}

// ✅ Suspend correctement
function GoodExample() {
  const data = use(fetchData()) // Ou avec une bibliothèque compatible
  return <div>{data.name}</div>
}
```

### Bibliothèques compatibles Suspense

- **React Query / TanStack Query** : `useSuspenseQuery`
- **SWR** : Option `suspense: true`
- **Relay** : Support natif
- **Next.js** : Fetch dans les Server Components

---

## Patterns Next.js

### loading.tsx

Next.js App Router a un support intégré pour Suspense via `loading.tsx` :

```
app/
  dashboard/
    loading.tsx   ← Suspense fallback automatique
    page.tsx
```

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />
}
```

Équivalent à :

```tsx
<Suspense fallback={<DashboardSkeleton />}>
  <DashboardPage />
</Suspense>
```

### error.tsx

De même pour les Error Boundaries :

```tsx
// app/dashboard/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

---

## Analogie Vue.js

| Concept          | Vue.js                 | React               |
| ---------------- | ---------------------- | ------------------- |
| Suspense         | `<Suspense>`           | `<Suspense>`        |
| Fallback loading | `#fallback` slot       | `fallback` prop     |
| Error handling   | `onErrorCaptured`      | Error Boundary      |
| Async component  | `defineAsyncComponent` | `lazy()` + Suspense |

### Exemple Vue.js équivalent

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>
```

---

## Lazy loading de composants

`React.lazy()` permet de charger des composants à la demande :

```tsx
import { lazy, Suspense } from 'react'

// Le composant est chargé seulement quand nécessaire
const HeavyChart = lazy(() => import('./HeavyChart'))

function Dashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart />
    </Suspense>
  )
}
```

### Avec préchargement

```tsx
const HeavyChart = lazy(() => import('./HeavyChart'))

// Précharger au hover
function ChartButton() {
  const handleMouseEnter = () => {
    import('./HeavyChart') // Commence à charger
  }

  return <button onMouseEnter={handleMouseEnter}>Show Chart</button>
}
```

---

## Exercice de compréhension

Avant de passer à la suite, assure-toi de pouvoir répondre à :

1. Quelle est la différence entre Suspense et Error Boundary ?
2. Pourquoi les Error Boundaries doivent-ils être des class components ?
3. Dans quel ordre doit-on imbriquer Error Boundary et Suspense ?
4. Suspense attrape-t-il les erreurs des `fetch` dans `useEffect` ?
5. Comment `loading.tsx` fonctionne dans Next.js App Router ?

---

→ [Section suivante : React Compiler](./06_compiler.md)
