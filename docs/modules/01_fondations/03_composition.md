# 3. Composition de composants

## La philosophie React : composition over inheritance

React favorise fortement la **composition** plutôt que l'héritage. En 23 ans de développement, tu as certainement vu des hiérarchies d'héritage complexes. React prend le chemin inverse.

### Pourquoi pas l'héritage ?

```tsx
// ❌ Jamais fait en React (et pour cause)
class SpecialButton extends Button {
  render() {
    return <button className="special">{super.render()}</button>
  }
}
```

React n'utilise pas l'héritage pour la spécialisation des composants. La composition résout tous les cas d'usage de manière plus flexible.

### Analogie avec tes patterns connus

| Pattern OO | Équivalent React |
|------------|------------------|
| Héritage | Composition avec children/props |
| Template Method | Props de rendu / children |
| Decorator | HOC ou hooks (plus tard) |
| Strategy | Props de fonction |

---

## Composition avec children

### Le pattern de base

```tsx
function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>
}

function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card-body">{children}</div>
}

// Composition libre
function UserCard({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader>
        <h2>{user.name}</h2>
      </CardHeader>
      <CardBody>
        <p>{user.bio}</p>
      </CardBody>
    </Card>
  )
}
```

### Comparaison Vue.js

```vue
<!-- Vue.js avec slots -->
<template>
  <Card>
    <template #header>
      <h2>{{ user.name }}</h2>
    </template>
    <p>{{ user.bio }}</p>
  </Card>
</template>
```

En React, pas de syntaxe spéciale : tu composes simplement les composants comme tu veux.

---

## Spécialisation par composition

Au lieu d'hériter, tu crées des composants spécialisés qui utilisent des composants génériques.

### Composant générique

```tsx
interface DialogProps {
  title: string
  children: React.ReactNode
  onClose: () => void
  footer?: React.ReactNode
}

function Dialog({ title, children, onClose, footer }: DialogProps) {
  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <header className="dialog-header">
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Close">×</button>
        </header>
        <div className="dialog-content">{children}</div>
        {footer && <footer className="dialog-footer">{footer}</footer>}
      </div>
    </div>
  )
}
```

### Composants spécialisés

```tsx
// AlertDialog - spécialisation pour les alertes
interface AlertDialogProps {
  message: string
  onConfirm: () => void
  onClose: () => void
}

function AlertDialog({ message, onConfirm, onClose }: AlertDialogProps) {
  return (
    <Dialog
      title="Alert"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose}>Cancel</button>
          <button onClick={onConfirm} className="btn-danger">Confirm</button>
        </>
      }
    >
      <p>{message}</p>
    </Dialog>
  )
}

// ConfirmDialog - autre spécialisation
interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm} className="btn-primary">
            {confirmLabel}
          </button>
        </>
      }
    >
      <p>{message}</p>
    </Dialog>
  )
}
```

---

## Pattern "Container / Presentational"

Un pattern classique qui sépare la logique de l'affichage. Très proche du concept de **Clean Architecture** que tu connais.

### Presentational (UI pure)

```tsx
// UserCard.tsx - Composant de présentation
// Ne sait RIEN de la source des données
interface UserCardProps {
  name: string
  email: string
  avatarUrl: string
  onEdit: () => void
  onDelete: () => void
}

function UserCard({ name, email, avatarUrl, onEdit, onDelete }: UserCardProps) {
  return (
    <div className="user-card">
      <img src={avatarUrl} alt={name} />
      <h3>{name}</h3>
      <p>{email}</p>
      <div className="actions">
        <button onClick={onEdit}>Edit</button>
        <button onClick={onDelete}>Delete</button>
      </div>
    </div>
  )
}
```

### Container (logique)

```tsx
// UserCardContainer.tsx - Gère la logique
function UserCardContainer({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false))
  }, [userId])

  const handleEdit = () => {
    // Navigation ou modal
  }

  const handleDelete = async () => {
    await deleteUser(userId)
    // Refresh ou navigation
  }

  if (loading) return <Spinner />
  if (!user) return <NotFound />

  return (
    <UserCard
      name={user.name}
      email={user.email}
      avatarUrl={user.avatar}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}
```

> **Note** : Ce pattern est moins utilisé depuis l'arrivée des hooks, qui permettent d'encapsuler la logique différemment. On le verra au Module 3.

---

## Slots avec props nommées

En Vue, tu utilises des slots nommés. En React, tu utilises des props qui acceptent du JSX.

### Pattern multi-slots

```tsx
interface PageLayoutProps {
  header: React.ReactNode
  sidebar: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
}

function PageLayout({ header, sidebar, children, footer }: PageLayoutProps) {
  return (
    <div className="page-layout">
      <header className="layout-header">{header}</header>
      <div className="layout-body">
        <aside className="layout-sidebar">{sidebar}</aside>
        <main className="layout-content">{children}</main>
      </div>
      {footer && <footer className="layout-footer">{footer}</footer>}
    </div>
  )
}

// Utilisation
function DashboardPage() {
  return (
    <PageLayout
      header={<Navigation />}
      sidebar={<DashboardMenu />}
      footer={<Copyright />}
    >
      <DashboardContent />
    </PageLayout>
  )
}
```

### Comparaison avec Vue

```vue
<!-- Vue.js -->
<PageLayout>
  <template #header><Navigation /></template>
  <template #sidebar><DashboardMenu /></template>
  <DashboardContent />
  <template #footer><Copyright /></template>
</PageLayout>
```

Les deux approches sont équivalentes. React est plus explicite, Vue plus déclaratif.

---

## Composition conditionnelle

### Wrapper conditionnel

```tsx
interface ConditionalWrapperProps {
  condition: boolean
  wrapper: (children: React.ReactNode) => React.ReactNode
  children: React.ReactNode
}

function ConditionalWrapper({ condition, wrapper, children }: ConditionalWrapperProps) {
  return condition ? wrapper(children) : children
}

// Utilisation
function Link({ href, external, children }: LinkProps) {
  return (
    <ConditionalWrapper
      condition={external}
      wrapper={(kids) => (
        <a href={href} target="_blank" rel="noopener noreferrer">{kids}</a>
      )}
    >
      {external ? children : <a href={href}>{children}</a>}
    </ConditionalWrapper>
  )
}

// Version simplifiée plus commune
function Link({ href, external, children }: LinkProps) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }
  return <a href={href}>{children}</a>
}
```

### Provider conditionnel

```tsx
function App({ user }: { user: User | null }) {
  const content = <MainContent />

  // Wrap avec le provider seulement si l'utilisateur est connecté
  if (user) {
    return (
      <UserContext.Provider value={user}>
        {content}
      </UserContext.Provider>
    )
  }

  return content
}
```

---

## Composition et inversion de contrôle

### Le problème : composant trop rigide

```tsx
// ❌ Trop de responsabilités, difficile à customiser
function DataTable({ data, columns }) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map((col) => (
              <td key={col.key}>{row[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

### La solution : inversion de contrôle

```tsx
// ✅ Le parent contrôle le rendu
interface Column<T> {
  key: string
  header: React.ReactNode
  render: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string
  emptyState?: React.ReactNode
}

function DataTable<T>({
  data,
  columns,
  keyExtractor,
  emptyState = <p>No data</p>,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return emptyState
  }

  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={keyExtractor(item)}>
            {columns.map((col) => (
              <td key={col.key}>{col.render(item)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// Utilisation : le parent contrôle tout le rendu
<DataTable
  data={users}
  keyExtractor={(user) => user.id}
  columns={[
    {
      key: 'name',
      header: <strong>Name</strong>,
      render: (user) => <span className="name">{user.name}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => <StatusBadge status={user.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <button onClick={() => editUser(user.id)}>Edit</button>
      ),
    },
  ]}
  emptyState={<EmptyUsersMessage />}
/>
```

---

## Anti-patterns de composition

### ❌ Props drilling excessif

```tsx
// Passer des props à travers 5 niveaux = code smell
<App user={user}>
  <Layout user={user}>
    <Sidebar user={user}>
      <UserMenu user={user}>
        <Avatar user={user} />
      </UserMenu>
    </Sidebar>
  </Layout>
</App>
```

**Solutions** : Context API (Module 4) ou state management.

### ❌ Composants trop monolithiques

```tsx
// ❌ Un composant qui fait tout
function Dashboard() {
  // 500 lignes de code...
  // Fetch data, état, handlers, rendu complexe
}

// ✅ Décomposer en composants plus petits
function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardHeader />
      <DashboardStats />
      <RecentActivity />
      <QuickActions />
    </DashboardLayout>
  )
}
```

### ❌ Composition trop fragmentée

```tsx
// ❌ Trop de petits composants sans valeur ajoutée
function Title({ text }) { return <h1>{text}</h1> }
function Paragraph({ text }) { return <p>{text}</p> }

// ✅ Garder un équilibre - abstraire quand ça a du sens
```

---

## Quand créer un nouveau composant ?

### Critères pour extraire un composant

1. **Réutilisation** : Le même UI apparaît à plusieurs endroits
2. **Complexité** : La logique devient difficile à suivre
3. **Responsabilité unique** : Le composant fait trop de choses
4. **Testabilité** : Tu veux tester une partie en isolation
5. **Lisibilité** : Le JSX devient trop profond

### Règle pratique

> Si ton composant dépasse ~100-150 lignes ou si tu dois scroller pour voir le return, c'est probablement le moment de décomposer.

---

## Points clés à retenir

1. **Composition > Héritage** : Toujours
2. **children** est ta primitive de composition principale
3. **Props de rendu** pour les "slots nommés"
4. **Spécialisation** = composant qui utilise un autre composant
5. **Inversion de contrôle** : laisse le parent décider du rendu
6. **Équilibre** : ni trop monolithique, ni trop fragmenté

---

→ [Continuer avec le Cycle de rendu](./04_rendering.md)
