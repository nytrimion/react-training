# Formulaires React

## Introduction

Les formulaires en React peuvent être gérés de deux manières fondamentalement différentes :
- **Controlled** (contrôlé) : React est la source de vérité
- **Uncontrolled** (non-contrôlé) : Le DOM garde la valeur

Cette section couvre les deux approches et quand utiliser chacune.

---

## Controlled Components (Composants contrôlés)

Dans un composant contrôlé, la valeur de l'input est **toujours** synchronisée avec le state React.

### Principe

```tsx
function ControlledInput() {
  const [value, setValue] = useState('')

  return (
    <input
      type="text"
      value={value}                              // React contrôle la valeur
      onChange={e => setValue(e.target.value)}   // Chaque frappe met à jour le state
    />
  )
}
```

### Flux de données

```
User tape "A"
    ↓
onChange déclenché (e.target.value = "A")
    ↓
setValue("A") appelé
    ↓
Re-render avec value="A"
    ↓
Input affiche "A"
```

### Exemple complet : formulaire de connexion

```tsx
interface LoginForm {
  email: string
  password: string
}

function LoginForm() {
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<Partial<LoginForm>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Effacer l'erreur quand l'utilisateur corrige
    if (errors[name as keyof LoginForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const newErrors: Partial<LoginForm> = {}
    if (!form.email) newErrors.email = 'Email required'
    if (!form.password) newErrors.password = 'Password required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Submit
    console.log('Submitting:', form)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && <span id="email-error">{errors.email}</span>}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        {errors.password && <span id="password-error">{errors.password}</span>}
      </div>

      <button type="submit">Login</button>
    </form>
  )
}
```

---

## Types d'inputs contrôlés

### Input text

```tsx
const [value, setValue] = useState('')
<input type="text" value={value} onChange={e => setValue(e.target.value)} />
```

### Textarea

```tsx
const [text, setText] = useState('')
<textarea value={text} onChange={e => setText(e.target.value)} />
```

### Select

```tsx
const [selected, setSelected] = useState('')
<select value={selected} onChange={e => setSelected(e.target.value)}>
  <option value="">Choose...</option>
  <option value="a">Option A</option>
  <option value="b">Option B</option>
</select>
```

### Select multiple

```tsx
const [selected, setSelected] = useState<string[]>([])

const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const values = Array.from(e.target.selectedOptions, option => option.value)
  setSelected(values)
}

<select multiple value={selected} onChange={handleChange}>
  <option value="a">A</option>
  <option value="b">B</option>
  <option value="c">C</option>
</select>
```

### Checkbox

```tsx
const [checked, setChecked] = useState(false)
<input
  type="checkbox"
  checked={checked}
  onChange={e => setChecked(e.target.checked)}
/>
```

### Checkbox multiple (groupe)

```tsx
const [selected, setSelected] = useState<string[]>([])

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { value, checked } = e.target
  setSelected(prev =>
    checked
      ? [...prev, value]
      : prev.filter(v => v !== value)
  )
}

{['a', 'b', 'c'].map(option => (
  <label key={option}>
    <input
      type="checkbox"
      value={option}
      checked={selected.includes(option)}
      onChange={handleChange}
    />
    {option.toUpperCase()}
  </label>
))}
```

### Radio

```tsx
const [selected, setSelected] = useState('')

{['a', 'b', 'c'].map(option => (
  <label key={option}>
    <input
      type="radio"
      name="myRadio"
      value={option}
      checked={selected === option}
      onChange={e => setSelected(e.target.value)}
    />
    {option.toUpperCase()}
  </label>
))}
```

### Input number

```tsx
const [value, setValue] = useState(0)
<input
  type="number"
  value={value}
  onChange={e => setValue(Number(e.target.value))}
/>
```

> **Attention** : `e.target.value` est toujours une string, même pour `type="number"`. Convertis avec `Number()` ou `parseInt()`.

---

## Uncontrolled Components (Composants non-contrôlés)

Dans un composant non-contrôlé, le **DOM** garde la valeur. On la récupère au moment du submit via une `ref`.

### Principe

```tsx
import { useRef } from 'react'

function UncontrolledInput() {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Value:', inputRef.current?.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" ref={inputRef} defaultValue="initial" />
      <button type="submit">Submit</button>
    </form>
  )
}
```

### Différences clés

| Aspect | Controlled | Uncontrolled |
|--------|------------|--------------|
| Source de vérité | React state | DOM |
| Prop valeur | `value` | `defaultValue` |
| Mise à jour | À chaque frappe | Seulement au submit |
| Validation live | ✅ Facile | ❌ Complexe |
| Performance | Re-renders fréquents | Pas de re-render |

---

## Quand utiliser quoi ?

### ✅ Préférer Controlled quand :

- Validation en temps réel
- Formatage automatique (téléphone, carte bancaire)
- Désactiver le bouton submit si invalide
- Valeurs interdépendantes (ex: date début < date fin)
- Formulaires complexes avec logique métier

### ✅ Préférer Uncontrolled quand :

- Formulaires simples (recherche, newsletter)
- Intégration avec du code non-React
- Optimisation de performance (rare)
- Fichiers (`<input type="file">` est toujours uncontrolled)

### Règle pratique

> Par défaut, utilise **controlled**. C'est le pattern React idiomatique.

---

## Validation

### Validation synchrone

```tsx
const [email, setEmail] = useState('')
const [error, setError] = useState('')

const validate = (value: string): string => {
  if (!value) return 'Email required'
  if (!value.includes('@')) return 'Invalid email'
  return ''
}

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value
  setEmail(value)
  setError(validate(value))
}

const handleBlur = () => {
  setError(validate(email))
}
```

### Validation au submit

```tsx
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()

  const errors: Record<string, string> = {}

  if (!form.email) errors.email = 'Required'
  if (!form.password) errors.password = 'Required'
  if (form.password.length < 8) errors.password = 'Min 8 characters'

  if (Object.keys(errors).length > 0) {
    setErrors(errors)
    return
  }

  submitForm(form)
}
```

### Validation asynchrone (ex: email unique)

```tsx
const [email, setEmail] = useState('')
const [checking, setChecking] = useState(false)
const [error, setError] = useState('')

const checkEmail = async (value: string) => {
  setChecking(true)
  try {
    const exists = await api.checkEmailExists(value)
    setError(exists ? 'Email already used' : '')
  } finally {
    setChecking(false)
  }
}

// Debounce pour éviter trop de requêtes
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value
  setEmail(value)

  // Validation locale d'abord
  if (!value.includes('@')) {
    setError('Invalid email')
    return
  }

  // Puis validation async (avec debounce en pratique)
  checkEmail(value)
}
```

---

## Comparaison avec Vue.js

| Concept | Vue.js | React |
|---------|--------|-------|
| Two-way binding | `v-model` | `value` + `onChange` |
| Valeur initiale | `v-model="ref('')"` | `useState('')` |
| Non-contrôlé | Pas idiomatique | `defaultValue` + `ref` |
| Validation | Vee-Validate, Vuelidate | Manuel ou React Hook Form |

### v-model vs controlled

```vue
<!-- Vue : deux-way binding automatique -->
<input v-model="email" />
```

```tsx
// React : binding explicite
const [email, setEmail] = useState('')
<input value={email} onChange={e => setEmail(e.target.value)} />
```

> La verbosité de React est intentionnelle : elle rend le flux de données **explicite**.

---

## Pattern : handler générique

Pour réduire le boilerplate avec plusieurs inputs :

```tsx
interface FormData {
  firstName: string
  lastName: string
  email: string
}

function Form() {
  const [form, setForm] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: ''
  })

  // Un seul handler pour tous les inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  return (
    <form>
      <input name="firstName" value={form.firstName} onChange={handleChange} />
      <input name="lastName" value={form.lastName} onChange={handleChange} />
      <input name="email" value={form.email} onChange={handleChange} />
    </form>
  )
}
```

> **Important** : L'attribut `name` doit correspondre exactement à la clé dans le state.

---

## Anti-patterns

### 1. Mélanger controlled et uncontrolled

```tsx
// ❌ Warning React : passer de controlled à uncontrolled
const [value, setValue] = useState<string | undefined>(undefined)
<input value={value} onChange={...} />  // undefined → uncontrolled !

// ✅ Toujours une string
const [value, setValue] = useState('')
```

### 2. Oublier preventDefault

```tsx
// ❌ La page recharge
<form onSubmit={handleSubmit}>

// ✅
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  // ...
}
```

### 3. Validation seulement côté client

```tsx
// ❌ Insuffisant pour la sécurité
if (isValidEmail(email)) {
  submitToServer(email)
}

// ✅ Toujours valider aussi côté serveur
// La validation client est pour l'UX, pas la sécurité
```

---

## Exercice de compréhension

1. Quelle est la différence entre `value` et `defaultValue` ?
2. Pourquoi `<input type="file">` est toujours non-contrôlé ?
3. Comment gérer un groupe de checkboxes en controlled ?
4. Quand préférer un formulaire non-contrôlé ?

---

→ [Section suivante : Architecture du state](./04_state_architecture.md)
