# Composition avancée

## Introduction

La composition est le **mécanisme fondamental** de React. Là où l'héritage domine en OOP classique (Java, PHP), React favorise la composition à tous les niveaux. Ce cours explore les patterns de composition avancés qui permettent de créer des APIs de composants flexibles et maintenables.

> **Analogie backend** : Si tu connais le principe "Composition over Inheritance" de SOLID, React le pousse à l'extrême. Il n'y a **aucun** mécanisme d'héritage de composants en React.

---

## Le Slots Pattern

### Le problème

Un composant `Card` a besoin de zones personnalisables : header, body, footer.

```tsx
// Approche naïve : tout en props
<Card
  title="Mon titre"
  subtitle="Sous-titre"
  body={<p>Contenu</p>}
  footer={<button>Action</button>}
  headerIcon={<Icon name="star" />}
/>
// Rigide, les types deviennent vite ingérables
```

### La solution : Slots via props nommées

```tsx
interface CardProps {
  header: ReactNode
  children: ReactNode // body = children (slot par défaut)
  footer?: ReactNode
}

function Card({ header, children, footer }: CardProps) {
  return (
    <div className="card">
      <div className="card-header">{header}</div>
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  )
}

// Utilisation : chaque "slot" est indépendant
;<Card
  header={
    <div className="flex justify-between">
      <h2>Titre</h2>
      <Icon name="star" />
    </div>
  }
  footer={<button className="btn-primary">Sauvegarder</button>}
>
  <p>Le contenu principal va dans children.</p>
</Card>
```

> **Analogie Vue.js** : C'est exactement le concept de **named slots** (`<slot name="header">`). En React, on utilise des props `ReactNode` au lieu de slots nommés. `children` est le slot par défaut.

### Slots vs Compound Components

| Critère      | Slots (props ReactNode) | Compound Components     |
| ------------ | ----------------------- | ----------------------- |
| Complexité   | Faible                  | Moyenne                 |
| État partagé | Non                     | Oui (via Context)       |
| Cas d'usage  | Layout, zones statiques | Composants interactifs  |
| Exemple      | Card, Page, Modal       | Tabs, Accordion, Select |

> **Règle** : utilise les Slots quand les zones sont indépendantes (pas d'état partagé). Utilise les Compound Components quand les sous-parties interagissent.

---

## Inversion of Control (IoC)

### Le concept

L'IoC en React consiste à **laisser le consommateur décider** du comportement, au lieu de tout contrôler dans le composant.

### Niveaux d'IoC

```
Niveau 0 : Tout est contrôlé par le composant
  <UserList users={users} />

Niveau 1 : Le rendu est customisable (Render Prop / Slot)
  <UserList users={users} renderItem={(user) => <CustomCard user={user} />} />

Niveau 2 : La logique est extraite (Headless Hook)
  const { items, sort, filter } = useUserList(users)
  // Le consommateur construit tout le JSX

Niveau 3 : Inversion totale (Headless Component)
  // Le composant fournit comportement + accessibilité
  // Le consommateur fournit 100% du markup et du style
```

### Exemple progressif : une liste triable

**Niveau 0 — Tout intégré :**

```tsx
function SortableList({ items }: { items: string[] }) {
  const [sorted, setSorted] = useState(items)
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = () => {
    const newDirection = direction === 'asc' ? 'desc' : 'asc'
    setDirection(newDirection)
    setSorted(
      [...items].sort((a, b) => (newDirection === 'asc' ? a.localeCompare(b) : b.localeCompare(a)))
    )
  }

  return (
    <div>
      <button onClick={handleSort}>Trier {direction}</button>
      <ul>
        {sorted.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
```

Problèmes : impossible de changer le markup, la logique de tri, ou le rendu d'un item.

**Niveau 2 — Hook headless :**

```tsx
function useSortable<T>(items: T[], compareFn: (a: T, b: T) => number) {
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc')

  const sorted = [...items].sort((a, b) =>
    direction === 'asc' ? compareFn(a, b) : compareFn(b, a)
  )

  const toggleDirection = () => {
    setDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  return { sorted, direction, toggleDirection }
}

// Utilisation : contrôle total du rendu
function UserList({ users }: { users: User[] }) {
  const { sorted, direction, toggleDirection } = useSortable(users, (a, b) =>
    a.name.localeCompare(b.name)
  )

  return (
    <div>
      <button onClick={toggleDirection}>Nom {direction === 'asc' ? '↑' : '↓'}</button>
      <div className="grid grid-cols-3">
        {sorted.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  )
}
```

> **Clé** : Le hook fournit les données et les actions. Le composant décide de tout le rendu. C'est la séparation totale entre logique et présentation.

---

## Le pattern `as` (polymorphisme de composant)

Permet à un composant de changer son élément HTML racine :

```tsx
type ButtonProps<T extends React.ElementType = 'button'> = {
  as?: T
  children: ReactNode
  variant?: 'primary' | 'secondary'
} & React.ComponentPropsWithoutRef<T>

function Button<T extends React.ElementType = 'button'>({
  as,
  children,
  variant = 'primary',
  ...props
}: ButtonProps<T>) {
  const Component = as || 'button'

  return (
    <Component
      className={`btn btn-${variant}`}
      {...props}
    >
      {children}
    </Component>
  )
}

// Utilisation
<Button>Click me</Button>                           // <button>
<Button as="a" href="/page">Lien</Button>            // <a>
<Button as={Link} to="/page">Router Link</Button>    // <Link>
```

> **Attention** : Ce pattern est puissant mais complexe à typer correctement. Des librairies comme Radix UI l'utilisent via `asChild` (une approche plus simple). Ne l'implémente que si tu en as vraiment besoin.

---

## Children Manipulation

React fournit des utilitaires pour manipuler `children` programmatiquement :

```tsx
import { Children, cloneElement, isValidElement, type ReactNode } from 'react'

function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2">
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child

        // Injecter une prop à chaque enfant
        return cloneElement(child, {
          size: 'sm', // Force la taille pour tous les boutons
        })
      })}
    </div>
  )
}
```

### Quand utiliser `Children` / `cloneElement`

| Situation                      | Recommandation                                 |
| ------------------------------ | ---------------------------------------------- |
| Injecter des props aux enfants | Préférer Context ou Compound Components        |
| Compter les enfants            | `Children.count(children)` est OK              |
| Filtrer les enfants par type   | Fragile, préférer la composition               |
| Ajouter du wrapping            | OK pour des cas simples (espacement, dividers) |

> **Attention** : `cloneElement` est considéré comme un **anti-pattern** dans la plupart des cas. Le Context est presque toujours une meilleure solution. React le mentionne comme "uncommon" dans sa documentation.

---

## Composition vs Configuration

Deux philosophies de design d'API :

### Configuration (top-down)

```tsx
// Tout est configuré via des props/objets
<DataTable
  columns={[
    { key: 'name', label: 'Nom', sortable: true },
    { key: 'email', label: 'Email', render: (val) => <a href={`mailto:${val}`}>{val}</a> },
  ]}
  data={users}
  pagination={{ pageSize: 10 }}
  onSort={handleSort}
/>
```

**Avantages** : API concise, facile à sérialiser, bonne pour les cas standards.
**Inconvénients** : Rigide, difficile d'ajouter des cas spéciaux.

### Composition (bottom-up)

```tsx
// Chaque partie est un composant indépendant
<DataTable data={users}>
  <DataTable.Header>
    <DataTable.Column sortable>Nom</DataTable.Column>
    <DataTable.Column>
      {(email: string) => <a href={`mailto:${email}`}>{email}</a>}
    </DataTable.Column>
  </DataTable.Header>
  <DataTable.Body />
  <DataTable.Pagination pageSize={10} />
</DataTable>
```

**Avantages** : Flexible, extensible, chaque partie customisable.
**Inconvénients** : Plus verbeux, courbe d'apprentissage.

### Quelle approche choisir ?

```
Composant interne, usage simple → Configuration
Composant réutilisable, besoins variés → Composition
Librairie publique → Composition (avec des presets de configuration)
```

> **Pattern hybride** : les meilleures librairies offrent les deux. Un mode "simple" avec configuration, et un mode "avancé" avec composition.

---

## Résumé

| Pattern                   | Quand                                    | Exemple                          |
| ------------------------- | ---------------------------------------- | -------------------------------- |
| **Slots**                 | Zones personnalisables sans état partagé | Card, Layout, Modal              |
| **IoC / Headless**        | Le consommateur contrôle le rendu        | useSortable, useCombobox         |
| **`as` prop**             | Changer l'élément racine                 | Button as Link                   |
| **Children manipulation** | Injection de props aux enfants           | Rare, préférer Context           |
| **Configuration**         | API simple, cas standards                | DataTable avec colonnes en props |
| **Composition**           | API flexible, cas variés                 | DataTable avec sous-composants   |

---

→ Prochain cours : [State Management](./05_state_management.md)
→ [Exercices du module](./exercises.md)
