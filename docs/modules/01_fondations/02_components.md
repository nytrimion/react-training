# 2. Composants fonctionnels typés

## Qu'est-ce qu'un composant React ?

Un composant React est une **fonction JavaScript qui retourne du JSX**. C'est l'unité de base de toute application React.

### Analogie Vue.js

En Vue, tu définis un composant avec un SFC (Single File Component) `.vue` qui contient `<template>`, `<script>` et `<style>`.

En React, un composant est simplement une fonction. Pas de structure imposée, pas de fichier spécial.

```vue
<!-- Vue.js SFC -->
<script setup lang="ts">
defineProps<{
  name: string
}>()
</script>

<template>
  <h1>Hello, {{ name }}!</h1>
</template>
```

```tsx
// React - Composant fonctionnel
interface GreetingProps {
  name: string
}

function Greeting({ name }: GreetingProps) {
  return <h1>Hello, {name}!</h1>
}
```

---

## Conventions de nommage

### Le composant

```tsx
// ✅ PascalCase pour les composants
function UserProfile() { ... }
function NavigationMenu() { ... }

// ❌ camelCase (React ne reconnaîtra pas comme composant)
function userProfile() { ... }  // Sera traité comme balise HTML
```

> **Pourquoi PascalCase ?** React distingue les composants custom des éléments DOM natifs par la casse. `<div>` est un élément HTML, `<UserProfile>` est un composant.

### Le fichier

Plusieurs conventions existent :

```
// Convention 1 : PascalCase (populaire)
UserProfile.tsx

// Convention 2 : kebab-case (style Vue/Angular)
user-profile.tsx

// Convention 3 : dossier + index
UserProfile/
├── index.tsx
├── UserProfile.tsx
└── UserProfile.test.tsx
```

Pour cette formation, on utilisera **PascalCase** pour les fichiers de composants.

---

## Anatomie d'un composant

```tsx
// 1. Imports
import { formatDate } from '@/lib/utils'
import { Avatar } from '@/components/Avatar'

// 2. Types (props)
interface UserCardProps {
  user: User
  showAvatar?: boolean
}

// 3. Le composant (fonction)
function UserCard({ user, showAvatar = true }: UserCardProps) {
  // 4. Logique interne (hooks, variables, fonctions)
  const joinDate = formatDate(user.createdAt)

  // 5. Rendu (JSX)
  return (
    <div className="user-card">
      {showAvatar && <Avatar src={user.avatar} />}
      <h2>{user.name}</h2>
      <p>Joined: {joinDate}</p>
    </div>
  )
}

// 6. Export
export { UserCard }
```

---

## Typer les props

### Interface dédiée (recommandé)

```tsx
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean  // Optionnel
  variant?: 'primary' | 'secondary' | 'danger'  // Union type
}

function Button({ label, onClick, disabled = false, variant = 'primary' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  )
}
```

### Type inline (pour les composants simples)

```tsx
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>
}
```

### Avec `type` au lieu de `interface`

```tsx
type ButtonProps = {
  label: string
  onClick: () => void
}

// Équivalent, choix de style
```

> **Interface vs Type** : Pour les props, les deux fonctionnent. `interface` permet l'extension (`extends`), `type` permet les unions plus facilement. Choisis une convention et reste cohérent.

---

## Props avec valeurs par défaut

### Dans la déstructuration (recommandé)

```tsx
interface CardProps {
  title: string
  bordered?: boolean
  size?: 'sm' | 'md' | 'lg'
}

function Card({ title, bordered = true, size = 'md' }: CardProps) {
  return (
    <div className={`card card-${size} ${bordered ? 'bordered' : ''}`}>
      <h2>{title}</h2>
    </div>
  )
}
```

### Avec defaultProps (legacy, à éviter)

```tsx
// ❌ Ancienne méthode, moins bien typée
Card.defaultProps = {
  bordered: true,
  size: 'md',
}
```

---

## Le prop `children`

`children` est une prop spéciale qui contient les éléments passés entre les balises du composant.

### Type de base

```tsx
interface ContainerProps {
  children: React.ReactNode  // Le type le plus permissif
}

function Container({ children }: ContainerProps) {
  return <div className="container">{children}</div>
}

// Utilisation
<Container>
  <h1>Title</h1>
  <p>Content</p>
</Container>
```

### Types de children

```tsx
// React.ReactNode - Accepte tout ce qui peut être rendu
// string, number, boolean, null, undefined, ReactElement, array de ceux-ci
children: React.ReactNode

// React.ReactElement - Uniquement des éléments React (pas de string)
children: React.ReactElement

// string - Uniquement du texte
children: string

// Fonction (render props - on verra plus tard)
children: (data: T) => React.ReactNode
```

### Children optionnel

```tsx
interface PanelProps {
  title: string
  children?: React.ReactNode  // Optionnel
}

function Panel({ title, children }: PanelProps) {
  return (
    <div className="panel">
      <h2>{title}</h2>
      {children && <div className="panel-content">{children}</div>}
    </div>
  )
}
```

### Comparaison avec Vue slots

```vue
<!-- Vue.js : slot par défaut -->
<template>
  <div class="container">
    <slot />
  </div>
</template>
```

```tsx
// React : children
function Container({ children }: { children: React.ReactNode }) {
  return <div className="container">{children}</div>
}
```

---

## Props de rendu (équivalent slots nommés)

En Vue, tu utilises des slots nommés. En React, tu passes des props explicites.

```vue
<!-- Vue.js : slots nommés -->
<template>
  <div class="card">
    <header><slot name="header" /></header>
    <main><slot /></main>
    <footer><slot name="footer" /></footer>
  </div>
</template>
```

```tsx
// React : props de rendu
interface CardProps {
  header: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
}

function Card({ header, children, footer }: CardProps) {
  return (
    <div className="card">
      <header>{header}</header>
      <main>{children}</main>
      {footer && <footer>{footer}</footer>}
    </div>
  )
}

// Utilisation
<Card
  header={<h1>My Card</h1>}
  footer={<button>Submit</button>}
>
  <p>Card content here</p>
</Card>
```

---

## Props de type fonction (callbacks)

### Event handlers

```tsx
interface ButtonProps {
  onClick: () => void  // Pas d'arguments
  onClickWithEvent: (event: React.MouseEvent<HTMLButtonElement>) => void
}
```

### Callbacks avec données

```tsx
interface SearchInputProps {
  onSearch: (query: string) => void
  onResultSelect: (result: SearchResult) => void
}

function SearchInput({ onSearch, onResultSelect }: SearchInputProps) {
  return (
    <input
      type="search"
      onChange={(e) => onSearch(e.target.value)}
    />
  )
}
```

### Convention de nommage

```tsx
// Préfixe "on" pour les props de callback
onClick, onChange, onSubmit, onSelect, onClose

// Le handler dans le composant parent souvent préfixé "handle"
function Parent() {
  const handleClick = () => console.log('clicked')
  return <Button onClick={handleClick} />
}
```

---

## Composants génériques

Pour des composants réutilisables qui doivent fonctionner avec différents types de données.

### Liste générique

```tsx
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  keyExtractor: (item: T) => string
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  )
}

// Utilisation - TypeScript infère le type T
<List
  items={users}
  renderItem={(user) => <span>{user.name}</span>}
  keyExtractor={(user) => user.id}
/>
```

### Select générique

```tsx
interface SelectProps<T> {
  options: T[]
  value: T | null
  onChange: (value: T) => void
  getLabel: (option: T) => string
  getValue: (option: T) => string
}

function Select<T>({
  options,
  value,
  onChange,
  getLabel,
  getValue,
}: SelectProps<T>) {
  return (
    <select
      value={value ? getValue(value) : ''}
      onChange={(e) => {
        const selected = options.find((o) => getValue(o) === e.target.value)
        if (selected) onChange(selected)
      }}
    >
      <option value="">Select...</option>
      {options.map((option) => (
        <option key={getValue(option)} value={getValue(option)}>
          {getLabel(option)}
        </option>
      ))}
    </select>
  )
}
```

---

## Étendre les props d'éléments HTML natifs

Souvent, tu veux créer un composant qui "enveloppe" un élément HTML et ajoute des fonctionnalités.

### ComponentProps / ComponentPropsWithoutRef

```tsx
import { ComponentProps } from 'react'

// Hérite toutes les props de <button>
interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary'
  isLoading?: boolean
}

function Button({ variant = 'primary', isLoading, children, ...rest }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      disabled={isLoading || rest.disabled}
      {...rest}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  )
}

// Utilisation : toutes les props de button sont disponibles
<Button variant="primary" type="submit" onClick={handleClick}>
  Submit
</Button>
```

### Pour les inputs

```tsx
import { ComponentProps } from 'react'

interface TextInputProps extends ComponentProps<'input'> {
  label: string
  error?: string
}

function TextInput({ label, error, id, ...rest }: TextInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s/g, '-')

  return (
    <div className="form-field">
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} {...rest} />
      {error && <span className="error">{error}</span>}
    </div>
  )
}
```

---

## Patterns de typage avancés

### Props conditionnelles (discriminated unions)

```tsx
// Soit href (lien) soit onClick (bouton), jamais les deux
type ButtonAsLink = {
  as: 'link'
  href: string
  onClick?: never
}

type ButtonAsButton = {
  as?: 'button'
  onClick: () => void
  href?: never
}

type ButtonProps = (ButtonAsLink | ButtonAsButton) & {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}

function Button({ as, children, variant = 'primary', ...props }: ButtonProps) {
  if (as === 'link') {
    return (
      <a href={props.href} className={`btn btn-${variant}`}>
        {children}
      </a>
    )
  }

  return (
    <button onClick={props.onClick} className={`btn btn-${variant}`}>
      {children}
    </button>
  )
}

// Utilisation
<Button as="link" href="/about">About</Button>
<Button onClick={() => console.log('click')}>Click me</Button>
```

### Polymorphic components (as prop)

```tsx
import { ComponentProps, ElementType } from 'react'

type BoxProps<T extends ElementType> = {
  as?: T
  children: React.ReactNode
} & ComponentProps<T>

function Box<T extends ElementType = 'div'>({
  as,
  children,
  ...props
}: BoxProps<T>) {
  const Component = as || 'div'
  return <Component {...props}>{children}</Component>
}

// Utilisation
<Box>Default div</Box>
<Box as="section" id="main">Section</Box>
<Box as="a" href="/home">Link</Box>
```

---

## Exports et organisation

### Export nommé (recommandé)

```tsx
// Button.tsx
export function Button() { ... }

// Import
import { Button } from '@/components/Button'
```

### Export par défaut (moins recommandé)

```tsx
// Button.tsx
export default function Button() { ... }

// Import - le nom peut varier
import Button from '@/components/Button'
import MyButton from '@/components/Button'  // Possible mais confus
```

### Barrel exports (index.ts)

```tsx
// components/index.ts
export { Button } from './Button'
export { Card } from './Card'
export { Input } from './Input'

// Import groupé
import { Button, Card, Input } from '@/components'
```

---

## Points clés à retenir

1. **Composant = fonction** qui retourne du JSX
2. **PascalCase** obligatoire pour les noms de composants
3. **Interface pour les props** : nommée `[Component]Props`
4. **Valeurs par défaut** : dans la déstructuration
5. **children** : type `React.ReactNode` pour maximum de flexibilité
6. **Callbacks** : préfixe `on` (onClick, onChange)
7. **Génériques** : pour les composants réutilisables avec différents types
8. **ComponentProps** : pour étendre les éléments HTML natifs

---

→ [Continuer avec la Composition](./03_composition.md)
