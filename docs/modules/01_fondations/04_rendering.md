# 4. Cycle de rendu et réconciliation

## Le modèle mental de React

Pour maîtriser React, il est essentiel de comprendre **comment** il met à jour l'UI. Ce chapitre est plus théorique mais fondamental pour éviter les bugs de performance et comprendre les comportements parfois surprenants.

### Analogie avec ton expérience

En PHP/Go, tu génères du HTML côté serveur à chaque requête. Le navigateur reçoit une page complète et la remplace.

En Vue.js, le système de réactivité (Proxy) détecte automatiquement les changements et met à jour le DOM chirurgicalement.

En React, **tu décris l'UI souhaitée**, et React détermine les changements minimaux à appliquer au DOM. C'est un modèle déclaratif avec réconciliation.

---

## UI = f(state)

La formule centrale de React :

```
UI = f(state)
```

- **UI** : Ce qui est affiché (le DOM)
- **f** : Ta fonction composant
- **state** : Les données actuelles

À chaque changement de state, React :

1. Appelle ta fonction composant avec le nouveau state
2. Compare le résultat avec le rendu précédent
3. Applique uniquement les différences au DOM

```tsx
function Counter({ count }: { count: number }) {
  // Cette fonction est appelée À CHAQUE rendu
  console.log('Counter rendered with:', count)

  return <span>{count}</span>
}
```

---

## Le Virtual DOM

### Qu'est-ce que c'est ?

Le Virtual DOM est une **représentation JavaScript légère** du DOM réel. C'est un arbre d'objets qui décrit l'UI.

```tsx
// Ce JSX...
<div className="card">
  <h1>Title</h1>
  <p>Content</p>
</div>

// ...devient cet objet (simplifié)
{
  type: 'div',
  props: {
    className: 'card',
    children: [
      { type: 'h1', props: { children: 'Title' } },
      { type: 'p', props: { children: 'Content' } }
    ]
  }
}
```

### Pourquoi un Virtual DOM ?

1. **Performance** : Manipuler des objets JS est rapide, manipuler le DOM est lent
2. **Batching** : React peut grouper plusieurs changements
3. **Abstraction** : Permet le rendu sur différentes plateformes (DOM, Native, etc.)

---

## L'algorithme de réconciliation

Quand le state change, React doit déterminer quoi mettre à jour. C'est le travail du **reconciler**.

### Règles de comparaison

#### 1. Éléments de types différents = reconstruction complète

```tsx
// Avant
<div><Counter /></div>

// Après
<span><Counter /></span>

// React détruit le div ET le Counter, puis crée un nouveau span avec un nouveau Counter
// Le state interne de Counter est perdu !
```

#### 2. Éléments du même type = mise à jour des attributs

```tsx
// Avant
<div className="old" style={{ color: 'red' }} />

// Après
<div className="new" style={{ color: 'blue' }} />

// React garde le même élément DOM et met à jour className et style
```

#### 3. Composants du même type = mise à jour des props

```tsx
// Avant
<Counter count={1} />

// Après
<Counter count={2} />

// React appelle Counter avec les nouvelles props
// L'instance du composant et son state interne sont préservés
```

---

## Le rôle crucial des keys

### Le problème sans keys

```tsx
function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li>{todo.text}</li> // ⚠️ Pas de key
      ))}
    </ul>
  )
}
```

Si tu ajoutes un élément au début de la liste :

```
Avant: [B, C]
Après: [A, B, C]
```

Sans key, React compare position par position :

- Position 0 : `B` → `A` (mise à jour du texte)
- Position 1 : `C` → `B` (mise à jour du texte)
- Position 2 : rien → `C` (création)

Résultat : 3 opérations au lieu d'une seule insertion !

### La solution avec keys

```tsx
{
  todos.map((todo) => <li key={todo.id}>{todo.text}</li>)
}
```

Avec les keys, React identifie chaque élément :

- `key="A"` : nouveau → création
- `key="B"` : existe, même position → rien
- `key="C"` : existe, même position → rien

Résultat : 1 seule opération.

### Règles pour les keys

```tsx
// ✅ Identifiant stable et unique
<li key={todo.id}>

// ✅ Combinaison si pas d'id unique
<li key={`${todo.category}-${todo.name}`}>

// ⚠️ Index acceptable UNIQUEMENT si la liste est statique
<li key={index}>  // OK si jamais de réordonnement/ajout/suppression

// ❌ Valeur aléatoire = catastrophe (recrée tout à chaque rendu)
<li key={Math.random()}>
<li key={crypto.randomUUID()}>
```

---

## Déclencheurs de re-render

Un composant re-render quand :

### 1. Son state change

```tsx
function Counter() {
  const [count, setCount] = useState(0)

  // Chaque appel à setCount déclenche un re-render
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### 2. Ses props changent

```tsx
function Display({ value }: { value: number }) {
  console.log('Display rendered') // Appelé quand value change
  return <span>{value}</span>
}
```

### 3. Son parent re-render

**C'est le point le plus important et souvent mal compris.**

```tsx
function Parent() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <Child /> {/* Re-render même si Child ne dépend pas de count ! */}
    </div>
  )
}

function Child() {
  console.log('Child rendered') // Appelé à chaque clic sur le bouton
  return <div>I am a child</div>
}
```

> **Attention** : Un re-render ne signifie pas une mise à jour DOM. React compare le Virtual DOM et ne touche le DOM réel que si nécessaire.

---

## Re-render vs DOM update

C'est une distinction cruciale :

```tsx
function Example() {
  const [count, setCount] = useState(0)

  console.log('Component rendered') // Appelé à chaque re-render

  return (
    <div>
      <span>Static content</span> {/* DOM jamais mis à jour */}
      <span>{count}</span> {/* DOM mis à jour seulement ici */}
    </div>
  )
}
```

**Re-render** = React appelle ta fonction et crée un nouveau Virtual DOM
**DOM update** = React modifie le DOM réel (seulement si différent)

Les re-renders sont généralement rapides. Les DOM updates sont plus coûteux mais React les minimise automatiquement.

---

## Batching des updates

React groupe automatiquement plusieurs mises à jour de state.

### Avant React 18

```tsx
// Batching automatique UNIQUEMENT dans les event handlers React
function handleClick() {
  setCount((c) => c + 1)
  setFlag((f) => !f)
  // Un seul re-render
}

// Pas de batching dans les callbacks async
setTimeout(() => {
  setCount((c) => c + 1) // Re-render
  setFlag((f) => !f) // Encore un re-render
}, 1000)
```

### Depuis React 18 (Automatic Batching)

```tsx
// Batching automatique PARTOUT
setTimeout(() => {
  setCount((c) => c + 1)
  setFlag((f) => !f)
  // Un seul re-render !
}, 1000)

fetch('/api').then(() => {
  setCount((c) => c + 1)
  setFlag((f) => !f)
  // Un seul re-render !
})
```

### Forcer un flush immédiat (rare)

```tsx
import { flushSync } from 'react-dom'

function handleClick() {
  flushSync(() => {
    setCount((c) => c + 1)
  })
  // DOM mis à jour ici

  flushSync(() => {
    setFlag((f) => !f)
  })
  // DOM mis à jour ici aussi
}
```

---

## Phases de rendu

Le cycle de vie React se décompose en phases :

### 1. Render Phase (pure)

- React appelle tes composants
- Crée le nouveau Virtual DOM
- Compare avec l'ancien (diffing)
- **Peut être interrompu** (Concurrent React)
- **Aucun side effect** ne doit se produire ici

```tsx
function MyComponent() {
  // Tout ce code est dans la render phase
  const computed = expensiveCalculation()

  // ❌ Side effect interdit dans le rendu
  document.title = 'Bad!'
  localStorage.setItem('bad', 'true')

  return <div>{computed}</div>
}
```

### 2. Commit Phase (effets)

- React applique les changements au DOM
- Les refs sont attachées
- Les effets (useEffect) sont exécutés
- **Ne peut pas être interrompu**

```tsx
function MyComponent() {
  useEffect(() => {
    // ✅ Side effects dans useEffect
    document.title = 'Good!'
  })

  return <div>Content</div>
}
```

---

## Strict Mode et double rendu

En développement, `<StrictMode>` appelle tes composants **deux fois** pour détecter les side effects impurs.

```tsx
// main.tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

```tsx
function Counter() {
  console.log('Render') // Affiché 2 fois en dev !

  // Si tu vois des comportements bizarres avec StrictMode,
  // c'est probablement un side effect dans le rendu
  return <div>Counter</div>
}
```

> **En production**, le double rendu est désactivé. StrictMode n'a aucun impact sur les performances en prod.

---

## Visualiser les re-renders

### React DevTools

1. Installe l'extension React DevTools
2. Ouvre l'onglet "Components"
3. Active "Highlight updates when components render"
4. Les composants qui re-render flashent en surbrillance

### Avec console.log (dev only)

```tsx
function MyComponent() {
  console.log('MyComponent rendered at', Date.now())
  return <div>...</div>
}
```

### Avec useEffect (compte les renders)

```tsx
function MyComponent() {
  const renderCount = useRef(0)
  renderCount.current++

  useEffect(() => {
    console.log('Render count:', renderCount.current)
  })

  return <div>...</div>
}
```

---

## Comparaison avec Vue.js

| Aspect                    | Vue.js                                 | React                      |
| ------------------------- | -------------------------------------- | -------------------------- |
| Détection des changements | Automatique (Proxy)                    | Explicite (setState)       |
| Granularité               | Composant + dépendances                | Composant entier           |
| Re-render du parent       | N'affecte pas les enfants (par défaut) | Re-render tous les enfants |
| Optimisation              | Automatique                            | Manuelle (memo, useMemo)   |
| Virtual DOM               | Oui                                    | Oui                        |

En Vue, le système de réactivité fine-grained fait que seuls les composants qui dépendent d'une donnée modifiée re-render.

En React, un changement de state re-render le composant ET tous ses enfants. C'est par conception : simple à comprendre, mais nécessite parfois des optimisations manuelles (qu'on verra au Module 3).

---

## Points clés à retenir

1. **UI = f(state)** : L'UI est une fonction du state
2. **Virtual DOM** : Représentation légère pour diffing efficace
3. **Keys** : Essentielles pour les listes, doivent être stables et uniques
4. **Re-render ≠ DOM update** : React optimise les updates DOM
5. **Parent re-render → enfants re-render** : Comportement par défaut
6. **Batching** : React groupe les updates de state
7. **Render phase = pure** : Pas de side effects dans le corps du composant

---

→ [Continuer avec Testing](./05_testing.md)
