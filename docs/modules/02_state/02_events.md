# Événements React

## Introduction

React utilise un système d'événements synthétiques (`SyntheticEvent`) qui encapsule les événements natifs du navigateur. Cela garantit un comportement cohérent cross-browser et s'intègre avec le système de rendu de React.

---

## Syntaxe de base

### Convention de nommage

| HTML natif | React |
|------------|-------|
| `onclick` | `onClick` |
| `onchange` | `onChange` |
| `onsubmit` | `onSubmit` |
| `onmouseover` | `onMouseOver` |
| `onfocus` | `onFocus` |

> **Règle** : camelCase au lieu de lowercase

### Handler inline vs référence

```tsx
// ✅ Référence à une fonction (recommandé pour la lisibilité)
function handleClick() {
  console.log('Clicked')
}
<button onClick={handleClick}>Click</button>

// ✅ Inline pour les cas simples
<button onClick={() => setCount(c => c + 1)}>+1</button>

// ❌ Éviter : appel de fonction (exécuté au render !)
<button onClick={handleClick()}>Click</button>
```

---

## SyntheticEvent

React encapsule tous les événements dans un `SyntheticEvent` :

```tsx
function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
  // Propriétés communes
  event.target        // L'élément qui a déclenché l'événement
  event.currentTarget // L'élément sur lequel le handler est attaché
  event.type          // 'click', 'change', etc.

  // Méthodes
  event.preventDefault()   // Empêcher le comportement par défaut
  event.stopPropagation()  // Arrêter la propagation (bubbling)

  // Accès à l'événement natif (rarement nécessaire)
  event.nativeEvent
}
```

### Pourquoi SyntheticEvent ?

1. **Cross-browser** : Normalise les différences entre navigateurs
2. **Performance** : Event pooling (historique, supprimé en React 17+)
3. **Intégration** : S'intègre avec le batching de React

---

## Typage TypeScript des événements

### Types d'événements courants

```tsx
// Événements de souris
onClick: React.MouseEvent<HTMLButtonElement>
onDoubleClick: React.MouseEvent<HTMLDivElement>
onMouseEnter: React.MouseEvent<HTMLElement>

// Événements de clavier
onKeyDown: React.KeyboardEvent<HTMLInputElement>
onKeyUp: React.KeyboardEvent<HTMLInputElement>
onKeyPress: React.KeyboardEvent<HTMLInputElement>  // Déprécié

// Événements de formulaire
onChange: React.ChangeEvent<HTMLInputElement>
onSubmit: React.FormEvent<HTMLFormElement>
onInput: React.FormEvent<HTMLInputElement>

// Événements de focus
onFocus: React.FocusEvent<HTMLInputElement>
onBlur: React.FocusEvent<HTMLInputElement>

// Événements tactiles
onTouchStart: React.TouchEvent<HTMLDivElement>
onTouchMove: React.TouchEvent<HTMLDivElement>

// Événements de drag
onDrag: React.DragEvent<HTMLDivElement>
onDrop: React.DragEvent<HTMLDivElement>
```

### Pattern générique

```
React.[Type]Event<HTMLElementType>
```

- `Type` : Mouse, Keyboard, Change, Form, Focus, Touch, Drag, etc.
- `HTMLElementType` : HTMLButtonElement, HTMLInputElement, HTMLDivElement, etc.

### Exemples pratiques

```tsx
// Input text
function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  const value = e.target.value  // string
  setName(value)
}

// Select
function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
  const value = e.target.value  // string (la valeur de l'option)
  setStatus(value)
}

// Checkbox
function handleCheck(e: React.ChangeEvent<HTMLInputElement>) {
  const checked = e.target.checked  // boolean
  setAgree(checked)
}

// Form submit
function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()  // Empêcher le rechargement de la page
  // Traiter le formulaire
}

// Keyboard
function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === 'Enter') {
    submitSearch()
  }
  if (e.key === 'Escape') {
    clearInput()
  }
}
```

---

## Typer les handlers comme props

### Approche 1 : Type inline

```tsx
interface ButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  onHover?: (event: React.MouseEvent<HTMLButtonElement>) => void
}
```

### Approche 2 : Types prédéfinis React

```tsx
interface ButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>
  onHover?: React.MouseEventHandler<HTMLButtonElement>
}
```

### Approche 3 : ComponentProps (le plus flexible)

```tsx
import { ComponentProps } from 'react'

interface ButtonProps extends ComponentProps<'button'> {
  variant: 'primary' | 'secondary'
}

// Hérite automatiquement de onClick, onFocus, disabled, etc.
```

---

## Event delegation (délégation d'événements)

React attache automatiquement **tous** les handlers au niveau de la racine (root), pas sur chaque élément. Cette délégation est transparente et automatique — tu n'as rien à faire.

### React délègue déjà pour toi

Quand tu écris `<button onClick={fn}>`, React n'ajoute pas un listener sur ce bouton. Il utilise un unique listener global qui route les événements vers les bons handlers. C'est une optimisation interne.

### Pattern recommandé (React 19+)

```tsx
// ✅ Recommandé : handler inline avec arrow function
// Le React Compiler mémoize automatiquement ces fonctions
function TodoList({ items }: { items: Todo[] }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id} onClick={() => toggleTodo(item.id)}>
          {item.text}
        </li>
      ))}
    </ul>
  )
}
```

### Pattern legacy : délégation manuelle

Avant React 18+ et le React Compiler, on utilisait parfois une délégation manuelle pour éviter de créer des fonctions à chaque render. Ce pattern reste utile à connaître pour maintenir du code legacy :

```tsx
// 🟡 Legacy : délégation manuelle via data attributes
function TodoList({ items }: { items: Todo[] }) {
  const handleClick = (e: React.MouseEvent<HTMLUListElement>) => {
    const target = e.target as HTMLElement
    const itemId = target.closest('li')?.dataset.id
    if (itemId) {
      toggleTodo(itemId)
    }
  }

  return (
    <ul onClick={handleClick}>
      {items.map(item => (
        <li key={item.id} data-id={item.id}>
          {item.text}
        </li>
      ))}
    </ul>
  )
}
```

**Inconvénients du pattern legacy** :
- Perte de type safety (`dataset.id` est `string | undefined`)
- Complexité accrue (`closest()`, cast `as HTMLElement`, null checks)
- Edge cases (clic sur un élément enfant comme une icône)
- Gain minime puisque React délègue déjà en interne

> **Note** : Pour les très grandes listes (> 1000 éléments), la vraie solution est la **virtualisation** (react-window, react-virtuoso), pas la délégation manuelle.

---

## Comparaison avec Vue.js

| Vue.js | React | Notes |
|--------|-------|-------|
| `@click="handler"` | `onClick={handler}` | |
| `@click.prevent` | `onClick={e => { e.preventDefault(); handler() }}` | Pas de modifiers |
| `@click.stop` | `onClick={e => { e.stopPropagation(); handler() }}` | |
| `@click.once` | Gérer manuellement avec un state | |
| `@keyup.enter` | `onKeyUp={e => e.key === 'Enter' && handler()}` | |
| `@input` | `onChange` | `onChange` pour les inputs ! |

### Différence importante : onChange

En HTML/Vue, `change` se déclenche au blur (perte de focus).
En React, `onChange` se déclenche à **chaque frappe** (comme `input` natif).

```tsx
// React onChange = HTML oninput
<input onChange={e => setValue(e.target.value)} />
```

---

## Patterns avancés

### Passer des données au handler

```tsx
// ✅ Recommandé (React 19+ avec Compiler) : inline arrow function
// Le React Compiler mémoize automatiquement ces fonctions
{items.map(item => (
  <button onClick={() => handleDelete(item.id)}>Delete</button>
))}
```

Pour référence, voici l'ancien pattern avec data attributes (utile pour du code legacy sans React Compiler) :

```tsx
// 🟡 Legacy : data attributes
function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
  const id = e.currentTarget.dataset.id
  if (id) deleteItem(id)
}

{items.map(item => (
  <button data-id={item.id} onClick={handleDelete}>Delete</button>
))}
```

### Combinaison de handlers

```tsx
interface InputProps {
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

function CustomInput({ onChange, ...props }: InputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Logique interne
    console.log('Value changed:', e.target.value)
    // Appeler le handler parent
    onChange?.(e)
  }

  return <input onChange={handleChange} {...props} />
}
```

### Événements conditionnels

```tsx
<button
  onClick={isEnabled ? handleClick : undefined}
  disabled={!isEnabled}
>
  {isEnabled ? 'Click me' : 'Disabled'}
</button>
```

---

## Anti-patterns

### 1. Oublier preventDefault sur les formulaires

```tsx
// ❌ La page se recharge !
<form onSubmit={handleSubmit}>

// ✅ Empêcher le comportement par défaut
function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  // ...
}
```

### 2. Appeler la fonction au lieu de la référencer

```tsx
// ❌ handleClick() est exécuté à chaque render
<button onClick={handleClick()}>Click</button>

// ✅ Passer la référence
<button onClick={handleClick}>Click</button>

// ✅ Si tu dois passer des arguments
<button onClick={() => handleClick(id)}>Click</button>
```

### 3. Modifier l'état dans le handler sans functional update

```tsx
// ❌ Problème si plusieurs clics rapides
const handleClick = () => setCount(count + 1)

// ✅ Toujours fiable
const handleClick = () => setCount(c => c + 1)
```

---

## Exercice de compréhension

1. Pourquoi utilise-t-on `onChange` en React là où Vue utilise `@input` ?
2. Comment typer un handler `onClick` pour un `<button>` en TypeScript ?
3. Quelle méthode appeler pour empêcher un formulaire de recharger la page ?
4. Quelle est la différence entre `e.target` et `e.currentTarget` ?

---

→ [Section suivante : Formulaires](./03_forms.md)
