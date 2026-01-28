# useRef en profondeur

## Introduction

`useRef` est un hook qui permet de stocker une valeur **mutable** qui persiste entre les renders, **sans déclencher de re-render** quand elle change.

Il a deux usages principaux :
1. **Références DOM** : accéder directement aux éléments HTML
2. **Valeurs mutables** : stocker des valeurs qui ne doivent pas déclencher de render

---

## Syntaxe de base

```tsx
const ref = useRef<T>(initialValue)

// Accéder à la valeur
ref.current

// Modifier la valeur (ne déclenche PAS de re-render)
ref.current = newValue
```

L'objet retourné par `useRef` a une seule propriété : `current`.

---

## Usage 1 : Références DOM

### Accéder à un élément

```tsx
function TextInput() {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.focus()
  }

  return (
    <>
      <input ref={inputRef} />
      <button onClick={handleClick}>Focus</button>
    </>
  )
}
```

### Typage des refs DOM

```tsx
// Les types correspondent aux éléments HTML
const inputRef = useRef<HTMLInputElement>(null)
const divRef = useRef<HTMLDivElement>(null)
const buttonRef = useRef<HTMLButtonElement>(null)
const canvasRef = useRef<HTMLCanvasElement>(null)
const videoRef = useRef<HTMLVideoElement>(null)

// Pour tout élément HTML générique
const elementRef = useRef<HTMLElement>(null)
```

### Pourquoi `null` comme valeur initiale ?

```tsx
const inputRef = useRef<HTMLInputElement>(null)
//                                        ^^^^
```

L'élément n'existe pas encore au moment où le composant s'exécute la première fois. React assignera l'élément à `ref.current` après le premier render.

### Analogie Vue.js

```vue
<!-- Vue.js : template ref -->
<template>
  <input ref="inputRef" />
  <button @click="inputRef?.focus()">Focus</button>
</template>

<script setup>
const inputRef = ref<HTMLInputElement | null>(null)
</script>
```

```tsx
// React : useRef
function Component() {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <input ref={inputRef} />
      <button onClick={() => inputRef.current?.focus()}>Focus</button>
    </>
  )
}
```

---

## Usage 2 : Valeurs mutables persistantes

### Le problème avec les variables locales

```tsx
function Counter() {
  let renderCount = 0  // ❌ Réinitialisé à chaque render
  renderCount++

  return <div>Renders: {renderCount}</div>  // Toujours 1
}
```

### La solution avec useRef

```tsx
function Counter() {
  const renderCount = useRef(0)
  renderCount.current++  // Persiste entre les renders

  return <div>Renders: {renderCount.current}</div>
}
```

### Différence avec useState

| | `useState` | `useRef` |
|---|---|---|
| Déclenche un re-render | ✅ Oui | ❌ Non |
| Valeur disponible immédiatement | ❌ Après le render | ✅ Immédiatement |
| Idéal pour | UI, données affichées | Valeurs internes, références |

### Cas d'usage typiques

#### 1. Stocker la valeur précédente

```tsx
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)

  useEffect(() => {
    ref.current = value
  })

  return ref.current  // Retourne la valeur AVANT la mise à jour
}

// Usage
function Counter() {
  const [count, setCount] = useState(0)
  const prevCount = usePrevious(count)

  return (
    <div>
      Current: {count}, Previous: {prevCount}
    </div>
  )
}
```

#### 2. Stocker un ID de timer

```tsx
function Timer() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const start = () => {
    intervalRef.current = setInterval(() => {
      console.log('tick')
    }, 1000)
  }

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  useEffect(() => {
    return () => stop()  // Cleanup au démontage
  }, [])

  return (
    <>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </>
  )
}
```

#### 3. Flag pour éviter les effets au premier render

```tsx
function Component({ data }: { data: Data }) {
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return  // Skip le premier render
    }

    // Exécuté seulement après le premier render
    console.log('Data changed:', data)
  }, [data])
}
```

#### 4. Stocker une fonction callback à jour

```tsx
function useEventCallback<T extends (...args: unknown[]) => unknown>(fn: T): T {
  const ref = useRef(fn)

  useEffect(() => {
    ref.current = fn
  })

  return useCallback((...args: Parameters<T>) => {
    return ref.current(...args)
  }, []) as T
}
```

---

## forwardRef : Passer des refs aux enfants

Par défaut, un composant ne peut pas recevoir une `ref` comme prop :

```tsx
// ❌ Ne fonctionne pas
function MyInput({ ref }: { ref: Ref<HTMLInputElement> }) {
  return <input ref={ref} />
}
```

### Solution : forwardRef

```tsx
import { forwardRef } from 'react'

const MyInput = forwardRef<HTMLInputElement, InputProps>(
  function MyInput(props, ref) {
    return <input {...props} ref={ref} />
  }
)

// Usage
function Form() {
  const inputRef = useRef<HTMLInputElement>(null)

  return <MyInput ref={inputRef} placeholder="Enter text" />
}
```

### Avec TypeScript

```tsx
interface MyInputProps {
  placeholder?: string
  className?: string
}

const MyInput = forwardRef<HTMLInputElement, MyInputProps>(
  function MyInput({ placeholder, className }, ref) {
    return (
      <input
        ref={ref}
        placeholder={placeholder}
        className={className}
      />
    )
  }
)
```

---

## useImperativeHandle : Exposer une API personnalisée

Parfois, tu veux exposer une API différente de l'élément DOM natif :

```tsx
import { forwardRef, useImperativeHandle, useRef } from 'react'

interface VideoPlayerHandle {
  play: () => void
  pause: () => void
  seekTo: (time: number) => void
}

interface VideoPlayerProps {
  src: string
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer({ src }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null)

    useImperativeHandle(ref, () => ({
      play() {
        videoRef.current?.play()
      },
      pause() {
        videoRef.current?.pause()
      },
      seekTo(time: number) {
        if (videoRef.current) {
          videoRef.current.currentTime = time
        }
      }
    }))

    return <video ref={videoRef} src={src} />
  }
)

// Usage
function App() {
  const playerRef = useRef<VideoPlayerHandle>(null)

  return (
    <>
      <VideoPlayer ref={playerRef} src="/video.mp4" />
      <button onClick={() => playerRef.current?.play()}>Play</button>
      <button onClick={() => playerRef.current?.seekTo(30)}>Go to 30s</button>
    </>
  )
}
```

> ⚠️ Utilise `useImperativeHandle` avec parcimonie. Préfère passer des props quand c'est possible.

---

## Ref callbacks

Au lieu de passer un objet ref, tu peux passer une fonction :

```tsx
function MeasuredComponent() {
  const [height, setHeight] = useState(0)

  const measuredRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      setHeight(node.getBoundingClientRect().height)
    }
  }, [])

  return (
    <>
      <div ref={measuredRef}>Content that might change</div>
      <p>Height: {height}px</p>
    </>
  )
}
```

### Quand utiliser une ref callback ?

- Mesurer un élément après le render
- Attacher un observer (ResizeObserver, IntersectionObserver)
- Logique conditionnelle basée sur l'existence de l'élément

---

## Patterns courants

### 1. Focus au montage

```tsx
function AutofocusInput() {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return <input ref={inputRef} />
}
```

### 2. Scroll vers un élément

```tsx
function MessageList({ messages }: { messages: Message[] }) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div>
      {messages.map(msg => <Message key={msg.id} {...msg} />)}
      <div ref={bottomRef} />
    </div>
  )
}
```

### 3. Stocker la valeur non-stale dans un callback

```tsx
function SearchComponent() {
  const [query, setQuery] = useState('')
  const queryRef = useRef(query)

  useEffect(() => {
    queryRef.current = query
  }, [query])

  const handleSubmit = useCallback(() => {
    // queryRef.current a toujours la valeur actuelle
    console.log('Searching for:', queryRef.current)
  }, [])  // Pas besoin de query dans les deps

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <button onClick={handleSubmit}>Search</button>
    </>
  )
}
```

---

## Anti-patterns

### ❌ Utiliser ref pour éviter les re-renders à tort

```tsx
// ❌ Mauvais : la valeur devrait être dans le state
function Counter() {
  const countRef = useRef(0)

  const increment = () => {
    countRef.current++
    // L'UI ne se met pas à jour !
  }

  return <button onClick={increment}>{countRef.current}</button>
}
```

Si tu as besoin que l'UI reflète la valeur, utilise `useState`.

### ❌ Lire ref.current pendant le render

```tsx
// ❌ Peut causer des comportements imprévisibles
function Component() {
  const ref = useRef(0)
  ref.current++  // Modifié pendant le render

  return <div>{ref.current}</div>  // Lu pendant le render
}
```

Modifie `ref.current` dans les effects ou event handlers, pas pendant le render.

---

## Comparaison Vue.js

| Vue.js | React |
|--------|-------|
| `ref<HTMLInputElement \| null>(null)` | `useRef<HTMLInputElement>(null)` |
| Template ref (`:ref="inputRef"`) | Prop `ref={inputRef}` |
| Accès : `inputRef.value` | Accès : `inputRef.current` |
| Réactif automatiquement | Ne déclenche jamais de re-render |

---

## Exercice de compréhension

Avant de passer à la suite, assure-toi de pouvoir répondre à :

1. Quelle est la différence entre stocker une valeur dans `useState` vs `useRef` ?
2. Pourquoi la valeur initiale d'une ref DOM est-elle `null` ?
3. À quoi sert `forwardRef` et quand en as-tu besoin ?
4. Ce code a-t-il un problème ?
   ```tsx
   function Component() {
     const countRef = useRef(0)
     return <button onClick={() => countRef.current++}>{countRef.current}</button>
   }
   ```
5. Comment utiliserais-tu une ref pour stocker l'ID d'un `setTimeout` ?

---

→ [Section suivante : Mémoisation](./03_memoization.md)
