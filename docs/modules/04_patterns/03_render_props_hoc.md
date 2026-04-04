# Render Props & Higher-Order Components (HOC)

## Introduction

Render Props et HOC sont des patterns **antérieurs aux hooks** pour partager de la logique entre composants. Depuis React 16.8 (2019), les hooks les ont largement remplacés. Pourtant, comprendre ces patterns reste important :

1. Tu les rencontreras dans du code legacy
2. Certaines librairies les utilisent encore
3. Ils éclairent le "pourquoi" des hooks
4. Dans de rares cas, ils restent la meilleure solution

> **Analogie backend** : Render Props = **pattern Strategy** (injecter un comportement). HOC = **pattern Decorator** (enrichir un composant sans le modifier).

---

## Render Props

### Le concept

Un **Render Prop** est une prop (souvent `render` ou `children`) qui est une **fonction** retournant du JSX. Le composant parent fournit des données via les arguments de cette fonction.

```tsx
// Le composant qui fournit la logique
interface MouseTrackerProps {
  children: (position: { x: number; y: number }) => ReactNode
}

function MouseTracker({ children }: MouseTrackerProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  // Appeler la fonction children avec les données
  return <>{children(position)}</>
}
```

```tsx
// Utilisation : le consommateur décide du rendu
function App() {
  return (
    <MouseTracker>
      {({ x, y }) => (
        <p>
          Position de la souris : {x}, {y}
        </p>
      )}
    </MouseTracker>
  )
}
```

> **Analogie Vue.js** : C'est exactement le concept de **scoped slots**. Le parent expose des données, et l'enfant (le slot) décide comment les afficher.

### Render Prop vs Children as Function

Deux variantes syntaxiques pour le même concept :

```tsx
// Variante 1 : prop nommée "render"
<DataFetcher url="/api/users" render={(data) => <UserList users={data} />} />

// Variante 2 : children as function (plus idiomatique)
<DataFetcher url="/api/users">
  {(data) => <UserList users={data} />}
</DataFetcher>
```

La variante `children` est plus lisible et plus courante.

### Cas d'usage actuels

Même si les hooks dominent, les Render Props restent utiles quand :

1. **La logique doit wraper du JSX** (contrôler le rendu conditionnel)
2. **Librairies tierces** : React Query's `<QueryErrorResetBoundary>`, Formik's `<Field>`

```tsx
// Exemple réel : composant d'autorisation
interface AuthorizeProps {
  permission: string
  fallback?: ReactNode
  children: (user: User) => ReactNode
}

function Authorize({ permission, fallback, children }: AuthorizeProps) {
  const user = useAuth()

  if (!user.hasPermission(permission)) {
    return <>{fallback ?? null}</>
  }

  return <>{children(user)}</>
}

// Utilisation
;<Authorize permission="admin" fallback={<p>Accès refusé</p>}>
  {(user) => <AdminPanel user={user} />}
</Authorize>
```

### Migration vers un hook

La plupart des Render Props se convertissent en hooks :

```tsx
// AVANT : Render Prop
;<MouseTracker>{({ x, y }) => <Cursor x={x} y={y} />}</MouseTracker>

// APRÈS : Hook (plus simple, plus direct)
function CursorDisplay() {
  const { x, y } = useMousePosition()
  return <Cursor x={x} y={y} />
}
```

> **Règle** : si ta Render Prop ne fait que fournir des données sans wrapper du JSX, un hook est toujours meilleur.

---

## Higher-Order Components (HOC)

### Le concept

Un **HOC** est une fonction qui prend un composant et retourne un **nouveau composant enrichi**.

```tsx
// Signature d'un HOC
function withSomething<P>(WrappedComponent: ComponentType<P>): ComponentType<...>
```

> **Convention** : les HOC sont préfixés par `with` : `withAuth`, `withTheme`, `withRouter`.

### Exemple : withAuth

```tsx
interface WithAuthProps {
  user: User
}

function withAuth<P extends object>(
  WrappedComponent: ComponentType<P & WithAuthProps>
): ComponentType<Omit<P, keyof WithAuthProps>> {
  function WithAuthWrapper(props: Omit<P, keyof WithAuthProps>) {
    const user = useAuth()

    if (!user) {
      return <Navigate to="/login" />
    }

    return <WrappedComponent {...(props as P)} user={user} />
  }

  // Aide au debugging dans React DevTools
  WithAuthWrapper.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`

  return WithAuthWrapper
}

// Utilisation
const ProtectedDashboard = withAuth(Dashboard)

// Dans le JSX
<ProtectedDashboard />  // user est injecté automatiquement
```

### Problèmes des HOC

Les HOC ont des défauts bien connus qui expliquent pourquoi les hooks les ont remplacés :

**1. Wrapper Hell** — Chaque HOC ajoute un niveau dans l'arbre React :

```tsx
// DevTools montre : WithAuth > WithTheme > WithRouter > WithIntl > MonComposant
const Enhanced = withAuth(withTheme(withRouter(withIntl(MonComposant))))
```

**2. Props collision** — Deux HOC peuvent injecter la même prop :

```tsx
// withUser injecte { user }, withAdmin injecte aussi { user } → conflit silencieux
const Enhanced = withUser(withAdmin(MonComposant))
```

**3. Typage TypeScript pénible** — Les generics deviennent vite complexes :

```tsx
// Qui veut écrire ce type ?
function withAuth<P extends WithAuthProps>(
  Component: ComponentType<P>
): ComponentType<Omit<P, keyof WithAuthProps>> { ... }
```

**4. Indirection** — Difficile de savoir d'où vient une prop :

```tsx
// D'où vient `user` dans ce composant ? Il faut remonter toute la chaîne de HOC
function Dashboard({ user, theme, locale }: DashboardProps) { ... }
```

### Cas où les HOC restent utiles

1. **Wrapping conditionnel au niveau route** (pattern legacy, mais courant)
2. **Librairies** qui utilisent des HOC : `connect()` de Redux (legacy), `memo()` de React
3. **Cross-cutting concerns** quand tu ne peux pas modifier le composant

```tsx
// React.memo est techniquement un HOC !
const MemoizedComponent = React.memo(ExpensiveComponent)

// React.forwardRef aussi
const InputWithRef = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <input ref={ref} {...props} />
))
```

---

## Comparaison : Hook vs Render Prop vs HOC

| Critère                  | Hook       | Render Prop | HOC                     |
| ------------------------ | ---------- | ----------- | ----------------------- |
| Complexité               | Simple     | Moyenne     | Élevée                  |
| Typage TS                | Facile     | Moyen       | Difficile               |
| Composabilité            | Excellente | Bonne       | Faible (wrapper hell)   |
| Debugging                | Clair      | Correct     | Difficile (indirection) |
| Wrapper supplémentaire   | Non        | Oui         | Oui                     |
| Accès au JSX parent      | Non        | Oui         | Oui                     |
| Conditionnement du rendu | Non\*      | Oui         | Oui                     |

\*Un hook ne peut pas conditionner le rendu (early return avant les hooks = violation des règles). Une Render Prop le peut.

### Quand utiliser quoi

```
Besoin de partager de la logique ?
├── La logique produit juste des données → Hook ✅
├── La logique doit wrapper/conditionner du JSX → Render Prop ✅
└── Tu ne peux pas modifier le composant cible → HOC ✅ (rare)
```

---

## Pattern actuel : Headless Components

L'évolution moderne des Render Props et HOC est le pattern **Headless Component** : un composant (ou hook) qui fournit toute la logique et l'état, mais **aucun markup**.

```tsx
// Hook headless pour un toggle
function useToggle(initialValue = false) {
  const [isOpen, setIsOpen] = useState(initialValue)

  const toggle = () => setIsOpen((prev) => !prev)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  return { isOpen, toggle, open, close }
}

// Utilisation : le consommateur fournit 100% du markup
function Dropdown() {
  const { isOpen, toggle } = useToggle()

  return (
    <div>
      <button onClick={toggle}>Menu</button>
      {isOpen && <ul>...</ul>}
    </div>
  )
}
```

Des librairies entières sont construites sur ce pattern : **Headless UI**, **Radix UI**, **Downshift**, **TanStack Table**.

> **Analogie** : C'est l'**Inversion of Control** appliquée au UI. Le framework fournit le comportement, le développeur fournit le rendu. On y reviendra en détail dans le cours suivant.

---

## Résumé

| Pattern         | Quand l'utiliser                       | Signature                              |
| --------------- | -------------------------------------- | -------------------------------------- |
| **Hook**        | Partage de logique (cas général)       | `function useX(): Result`              |
| **Render Prop** | Logique qui contrôle le rendu          | `children: (data) => ReactNode`        |
| **HOC**         | Enrichir un composant sans le modifier | `withX(Component) → EnhancedComponent` |
| **Headless**    | Logique complète, markup libre         | Hook ou composant sans UI              |

> **À retenir** : dans du code moderne, 90% des cas sont résolus par des hooks. Les Render Props couvrent 9% (cas JSX). Les HOC sont réservés au 1% restant (code legacy, librairies).

---

→ Prochain cours : [Composition avancée](./04_advanced_composition.md)
→ [Exercices du module](./exercises.md)
