# Compound Components

## Introduction

Le pattern **Compound Components** permet de créer des composants qui fonctionnent ensemble de manière implicite, partageant un état interne via Context sans que l'utilisateur ait à gérer le wiring manuellement.

> **Analogie design pattern** : C'est le pattern **Composite**. Un composant parent orchestre ses enfants, qui ont une API implicite. Pense à `<select>` et `<option>` en HTML natif : `<option>` n'a aucun sens en dehors d'un `<select>`, et le `<select>` gère automatiquement quel `<option>` est sélectionné.

> **Analogie Vue.js** : Vue n'a pas d'équivalent direct. Les scoped slots s'en rapprochent, mais le pattern Compound Components de React va plus loin en encapsulant totalement la communication parent-enfant via Context.

---

## Le problème : Props Explosion

Imagine un composant Accordion configurable via props :

```tsx
// API "monolithique" : tout passe par les props du parent
<Accordion
  items={[
    { title: 'Section 1', content: <p>Contenu 1</p> },
    { title: 'Section 2', content: <p>Contenu 2</p> },
  ]}
  defaultOpen={0}
  onToggle={(index) => console.log(index)}
  renderTitle={(title, isOpen) => (
    <div className={isOpen ? 'bold' : ''}>{title}</div>
  )}
  renderContent={(content) => (
    <div className="p-4">{content}</div>
  )}
/>
```

**Problèmes** :
- API complexe et rigide
- Configuration limitée : que faire si on veut un séparateur entre deux items spécifiques ?
- Composabilité nulle : impossible d'ajouter un comportement custom à un seul item
- Types TypeScript difficiles à maintenir

---

## La solution : Compound Components

```tsx
// API composable : chaque sous-composant est indépendant
<Accordion defaultValue="section-1">
  <Accordion.Item value="section-1">
    <Accordion.Trigger>Section 1</Accordion.Trigger>
    <Accordion.Content>
      <p>Contenu 1</p>
    </Accordion.Content>
  </Accordion.Item>

  <hr className="my-2" />  {/* Séparateur custom : pas de prop spéciale */}

  <Accordion.Item value="section-2">
    <Accordion.Trigger>
      <span className="font-bold">Section 2 (custom)</span>
    </Accordion.Trigger>
    <Accordion.Content>
      <p>Contenu 2</p>
    </Accordion.Content>
  </Accordion.Item>
</Accordion>
```

**Avantages** :
- API déclarative et lisible
- Composabilité totale : chaque enfant peut être customisé indépendamment
- Flexibilité : insérer du contenu arbitraire entre les items
- Typable proprement en TypeScript

---

## Implémentation pas à pas

### 1. Définir les Contexts internes

Un Compound Component utilise typiquement **deux niveaux de Context** :

```tsx
// Context de l'Accordion (global) : quel item est ouvert
interface AccordionContextType {
  openValue: string | null
  toggle: (value: string) => void
}

const AccordionContext = createContext<AccordionContextType | null>(null)

// Context de l'Item (local) : la valeur de cet item spécifique
interface AccordionItemContextType {
  value: string
  isOpen: boolean
}

const AccordionItemContext = createContext<AccordionItemContextType | null>(null)
```

> **Point clé** : ces Contexts sont **internes**. L'utilisateur du composant ne les voit jamais, ne les importe jamais.

### 2. Le composant parent : Accordion

```tsx
interface AccordionProps {
  defaultValue?: string
  children: ReactNode
}

function Accordion({ defaultValue, children }: AccordionProps) {
  const [openValue, setOpenValue] = useState<string | null>(defaultValue ?? null)

  const toggle = (value: string) => {
    setOpenValue((prev) => (prev === value ? null : value))
  }

  return (
    <AccordionContext.Provider value={{ openValue, toggle }}>
      <div role="region">{children}</div>
    </AccordionContext.Provider>
  )
}
```

### 3. Le sous-composant Item

```tsx
interface AccordionItemProps {
  value: string
  children: ReactNode
}

function AccordionItem({ value, children }: AccordionItemProps) {
  const accordion = useAccordionContext()
  const isOpen = accordion.openValue === value

  return (
    <AccordionItemContext.Provider value={{ value, isOpen }}>
      <div>{children}</div>
    </AccordionItemContext.Provider>
  )
}
```

### 4. Trigger et Content

```tsx
function AccordionTrigger({ children }: { children: ReactNode }) {
  const accordion = useAccordionContext()
  const item = useAccordionItemContext()

  return (
    <button
      onClick={() => accordion.toggle(item.value)}
      aria-expanded={item.isOpen}
    >
      {children}
    </button>
  )
}

function AccordionContent({ children }: { children: ReactNode }) {
  const item = useAccordionItemContext()

  if (!item.isOpen) return null

  return <div role="region">{children}</div>
}
```

### 5. Assembler avec la notation dot

```tsx
// Attacher les sous-composants au parent
Accordion.Item = AccordionItem
Accordion.Trigger = AccordionTrigger
Accordion.Content = AccordionContent
```

Pour que TypeScript accepte cette notation, il faut déclarer les propriétés :

```tsx
// Approche propre avec Object.assign
const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
})

export { Accordion }
```

> **Pourquoi la dot notation ?** C'est une convention qui communique clairement la relation parent-enfant. `Accordion.Item` dit "Item fait partie d'Accordion" de manière évidente. C'est purement ergonomique — techniquement, des exports séparés fonctionneraient aussi.

---

## Hooks internes avec validation

```tsx
function useAccordionContext(): AccordionContextType {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error(
      'Accordion compound components must be used within <Accordion>'
    )
  }
  return context
}

function useAccordionItemContext(): AccordionItemContextType {
  const context = useContext(AccordionItemContext)
  if (!context) {
    throw new Error(
      'Accordion.Trigger/Content must be used within <Accordion.Item>'
    )
  }
  return context
}
```

Ces messages d'erreur explicites guident le développeur vers le bon usage.

---

## Mode contrôlé vs non contrôlé

Comme les `<input>` natifs, un bon Compound Component supporte les deux modes :

```tsx
interface AccordionProps {
  // Non contrôlé
  defaultValue?: string

  // Contrôlé
  value?: string
  onValueChange?: (value: string | null) => void

  children: ReactNode
}

function Accordion({ defaultValue, value, onValueChange, children }: AccordionProps) {
  const [internalValue, setInternalValue] = useState<string | null>(
    defaultValue ?? null
  )

  // Le mode est déterminé par la présence de la prop `value`
  const isControlled = value !== undefined
  const openValue = isControlled ? value : internalValue

  const toggle = (itemValue: string) => {
    const newValue = openValue === itemValue ? null : itemValue

    if (!isControlled) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <AccordionContext.Provider value={{ openValue, toggle }}>
      <div>{children}</div>
    </AccordionContext.Provider>
  )
}
```

> **Pattern familier** : c'est exactement le pattern "contrôlé vs non contrôlé" des formulaires React (module 2), appliqué à un composant custom.

---

## Accessibilité (a11y)

Un Compound Component de qualité production inclut les attributs ARIA :

```tsx
function AccordionTrigger({ children }: { children: ReactNode }) {
  const accordion = useAccordionContext()
  const item = useAccordionItemContext()
  const contentId = `accordion-content-${item.value}`
  const triggerId = `accordion-trigger-${item.value}`

  return (
    <h3>
      <button
        id={triggerId}
        onClick={() => accordion.toggle(item.value)}
        aria-expanded={item.isOpen}
        aria-controls={contentId}
      >
        {children}
      </button>
    </h3>
  )
}

function AccordionContent({ children }: { children: ReactNode }) {
  const item = useAccordionItemContext()
  const contentId = `accordion-content-${item.value}`
  const triggerId = `accordion-trigger-${item.value}`

  if (!item.isOpen) return null

  return (
    <div
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
    >
      {children}
    </div>
  )
}
```

---

## Exemples courants de Compound Components

| Composant | Sous-composants | Context partagé |
|---|---|---|
| `Tabs` | `Tabs.List`, `Tabs.Tab`, `Tabs.Panel` | Onglet actif |
| `Accordion` | `Accordion.Item`, `Accordion.Trigger`, `Accordion.Content` | Item ouvert |
| `Select` | `Select.Trigger`, `Select.Options`, `Select.Option` | Option sélectionnée, ouvert/fermé |
| `Dialog` | `Dialog.Trigger`, `Dialog.Content`, `Dialog.Close` | Ouvert/fermé |
| `Menu` | `Menu.Button`, `Menu.Items`, `Menu.Item` | Ouvert/fermé, focus |

Ces patterns se retrouvent dans les librairies populaires : Radix UI, Headless UI, Ark UI.

---

## Quand utiliser ce pattern

### Bon usage

- Composants UI avec plusieurs parties liées (tabs, accordions, dropdowns)
- Composants qui ont besoin de flexibilité dans le rendu
- API publique destinée à d'autres développeurs

### Mauvais usage

- Composants simples sans sous-parties (un bouton, un input)
- Quand une simple prop suffit
- Composants internes non réutilisés

> **Règle** : si ton composant a plus de 5-6 props de configuration dont certaines sont des render functions, c'est probablement un candidat pour le pattern Compound Components.

---

## Résumé

| Concept | Détail |
|---|---|
| Compound Components | Composants qui partagent un état implicite via Context |
| Dot notation | `Parent.Child` pour communiquer la relation |
| Deux niveaux de Context | Global (parent) + Local (item) |
| `Object.assign` | Assembler le composant avec ses sous-composants |
| Contrôlé / non contrôlé | Supporter les deux modes comme les inputs natifs |
| Context interne | Jamais exporté, encapsulé dans des hooks privés |

---

→ Prochain cours : [Render Props & HOC](./03_render_props_hoc.md)
→ [Exercices du module](./exercises.md)
