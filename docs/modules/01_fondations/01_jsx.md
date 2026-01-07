# 1. JSX en profondeur

## Qu'est-ce que JSX ?

JSX (JavaScript XML) est une **extension syntaxique** de JavaScript qui permet d'écrire du markup dans le code JavaScript. Ce n'est ni du HTML, ni un langage de template : c'est du JavaScript déguisé.

### Analogie Vue.js

En Vue, tu écris des templates dans une balise `<template>` avec des directives (`v-if`, `v-for`, `@click`). Le compilateur Vue transforme ce template en fonctions de rendu.

En React, tu écris directement en JSX, qui est transformé en appels de fonctions JavaScript par un transpileur (Babel ou SWC).

```vue
<!-- Vue.js -->
<template>
  <div class="greeting">
    <h1>{{ message }}</h1>
  </div>
</template>
```

```tsx
// React JSX
function Greeting() {
  const message = 'Hello'
  return (
    <div className="greeting">
      <h1>{message}</h1>
    </div>
  )
}
```

---

## La transpilation JSX

### Ce que tu écris

```tsx
const element = <h1 className="title">Hello, world!</h1>
```

### Ce que le transpileur produit

```javascript
// Avec React 17+ (nouveau JSX transform)
import { jsx as _jsx } from 'react/jsx-runtime'

const element = _jsx('h1', {
  className: 'title',
  children: 'Hello, world!',
})
```

### Avant React 17 (legacy)

```javascript
// Ancien format - nécessitait `import React from 'react'`
const element = React.createElement('h1', { className: 'title' }, 'Hello, world!')
```

> **Note** : Avec le nouveau JSX transform (React 17+), tu n'as plus besoin d'importer React dans chaque fichier qui utilise JSX. Le transpileur ajoute automatiquement l'import nécessaire.

---

## Règles syntaxiques du JSX

### 1. Un seul élément racine

```tsx
// ❌ Erreur : plusieurs éléments racine
function Bad() {
  return (
    <h1>Title</h1>
    <p>Content</p>
  )
}

// ✅ Solution 1 : wrapper div
function Good1() {
  return (
    <div>
      <h1>Title</h1>
      <p>Content</p>
    </div>
  )
}

// ✅ Solution 2 : Fragment (préféré si pas besoin de wrapper)
function Good2() {
  return (
    <>
      <h1>Title</h1>
      <p>Content</p>
    </>
  )
}

// ✅ Solution 3 : Fragment explicite (utile pour les keys)
import { Fragment } from 'react'

function Good3() {
  return (
    <Fragment>
      <h1>Title</h1>
      <p>Content</p>
    </Fragment>
  )
}
```

### 2. Attributs en camelCase

JSX utilise les noms de propriétés DOM JavaScript, pas les attributs HTML :

```tsx
// HTML          →  JSX
// class         →  className
// for           →  htmlFor
// tabindex      →  tabIndex
// onclick       →  onClick
// readonly      →  readOnly

<label htmlFor="email" className="form-label">
  <input type="email" id="email" tabIndex={0} readOnly={false} />
</label>
```

### 3. Toutes les balises doivent être fermées

```tsx
// ❌ HTML valide mais JSX invalide
<img src="photo.jpg">
<input type="text">
<br>

// ✅ JSX valide
<img src="photo.jpg" />
<input type="text" />
<br />
```

### 4. Les expressions JavaScript entre accolades

```tsx
function UserProfile({ user }: { user: User }) {
  const fullName = `${user.firstName} ${user.lastName}`

  return (
    <div>
      {/* Variable */}
      <h1>{fullName}</h1>

      {/* Expression */}
      <p>Age: {user.birthYear ? new Date().getFullYear() - user.birthYear : 'Unknown'}</p>

      {/* Appel de fonction */}
      <p>Joined: {formatDate(user.createdAt)}</p>

      {/* Propriété d'objet */}
      <img src={user.avatar.url} alt={user.avatar.alt} />
    </div>
  )
}
```

---

## Rendu conditionnel

### Opérateur ternaire (condition ? a : b)

```tsx
function Greeting({ isLoggedIn }: { isLoggedIn: boolean }) {
  return <div>{isLoggedIn ? <h1>Welcome back!</h1> : <h1>Please sign in</h1>}</div>
}
```

### Court-circuit logique (condition && element)

```tsx
function Notifications({ count }: { count: number }) {
  return <div>{count > 0 && <span className="badge">{count}</span>}</div>
}
```

> **Piège** : Attention avec les valeurs falsy !

```tsx
// ❌ Bug : affiche "0" si count === 0
{
  count && <span>{count}</span>
}

// ✅ Correct : conversion explicite en boolean
{
  count > 0 && <span>{count}</span>
}
{
  Boolean(count) && <span>{count}</span>
}
{
  !!count && <span>{count}</span>
}
```

### Variable intermédiaire (pour logique complexe)

```tsx
function StatusMessage({ status }: { status: 'loading' | 'error' | 'success' }) {
  let content: React.ReactNode

  if (status === 'loading') {
    content = <Spinner />
  } else if (status === 'error') {
    content = <ErrorMessage />
  } else {
    content = <SuccessMessage />
  }

  return <div className="status">{content}</div>
}
```

### Pattern matching avec objet

```tsx
const statusComponents = {
  loading: <Spinner />,
  error: <ErrorMessage />,
  success: <SuccessMessage />,
} as const

function StatusMessage({ status }: { status: keyof typeof statusComponents }) {
  return <div className="status">{statusComponents[status]}</div>
}
```

---

## Rendu de listes

### Avec .map()

```tsx
interface Task {
  id: string
  title: string
  completed: boolean
}

function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          {task.completed ? '✅' : '⬜'} {task.title}
        </li>
      ))}
    </ul>
  )
}
```

### L'importance des keys

Les `key` permettent à React d'identifier quel élément a changé, été ajouté ou supprimé lors de la réconciliation.

```tsx
// ❌ Mauvais : utiliser l'index comme key
{
  tasks.map((task, index) => (
    <li key={index}>{task.title}</li> // Problème si la liste est réordonnée
  ))
}

// ✅ Bon : utiliser un identifiant stable et unique
{
  tasks.map((task) => <li key={task.id}>{task.title}</li>)
}
```

> **Quand l'index est acceptable** : uniquement si la liste est statique (jamais réordonnée, filtrée, ou avec des ajouts/suppressions au milieu).

---

## Styles en JSX

### Style inline (objet JavaScript)

```tsx
// ❌ Pas comme en HTML
<div style="color: red; font-size: 16px">

// ✅ Objet avec propriétés camelCase
<div style={{ color: 'red', fontSize: '16px' }}>

// ✅ Avec variable
const titleStyle: React.CSSProperties = {
  color: 'red',
  fontSize: '16px',
  fontWeight: 'bold',
}

<h1 style={titleStyle}>Title</h1>
```

### Classes CSS (className)

```tsx
// Classe statique
<div className="container">

// Classe dynamique
<div className={isActive ? 'active' : 'inactive'}>

// Plusieurs classes
<div className={`card ${isSelected ? 'selected' : ''} ${size}`}>

// Avec une librairie comme clsx (recommandé)
import clsx from 'clsx'

<div className={clsx('card', { selected: isSelected }, size)}>
```

---

## Commentaires en JSX

```tsx
function Example() {
  return (
    <div>
      {/* Ceci est un commentaire JSX */}
      <h1>Title</h1>

      {/*
        Commentaire
        multi-lignes
      */}
      <p>Content</p>
    </div>
  )
}
```

---

## JSX est "juste" du JavaScript

C'est le point clé à comprendre. JSX n'est qu'une syntaxe plus agréable pour créer des objets JavaScript. Cela signifie que tu peux :

### Stocker du JSX dans des variables

```tsx
const header = (
  <header>
    <h1>My App</h1>
  </header>
)
const footer = <footer>© 2024</footer>

function Layout() {
  return (
    <div>
      {header}
      <main>Content</main>
      {footer}
    </div>
  )
}
```

### Retourner du JSX depuis des fonctions

```tsx
function renderStatus(isOnline: boolean) {
  if (isOnline) {
    return <span className="online">🟢 Online</span>
  }
  return <span className="offline">🔴 Offline</span>
}

function User({ isOnline }: { isOnline: boolean }) {
  return <div>{renderStatus(isOnline)}</div>
}
```

### Passer du JSX comme props

```tsx
function Card({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="card-header">{title}</div>
      <div className="card-body">{children}</div>
    </div>
  )
}

// Utilisation
;<Card
  title={
    <>
      <strong>Important</strong> Notice
    </>
  }
>
  <p>Card content here</p>
</Card>
```

---

## Différences clés JSX vs Templates Vue

| Aspect             | Vue Templates           | React JSX                  |
| ------------------ | ----------------------- | -------------------------- |
| Syntaxe conditions | `v-if="condition"`      | `{condition && <X/>}`      |
| Syntaxe boucles    | `v-for="item in items"` | `{items.map(item => ...)}` |
| Binding data       | `{{ value }}`           | `{value}`                  |
| Événements         | `@click="handler"`      | `onClick={handler}`        |
| Two-way binding    | `v-model="value"`       | `value={x} onChange={...}` |
| Compilation        | Build time              | Build time (identique)     |
| Typage             | Limité (Volar aide)     | Natif TypeScript           |

---

## Points clés à retenir

1. **JSX = JavaScript** : Ce n'est pas un template, c'est du JS transformé
2. **Transpilation** : JSX → `jsx()` ou `createElement()`
3. **Un seul élément racine** : Utilise les Fragments `<>...</>` si nécessaire
4. **camelCase** : `className`, `onClick`, `htmlFor`
5. **Expressions entre `{}`** : Pas de directives, juste du JavaScript
6. **Keys obligatoires** : Pour les listes, avec un identifiant stable

---

→ [Continuer avec les Composants typés](./02_components.md)
