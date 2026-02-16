# Exercices - Module 3 : Hooks Avancés & React 19

Ces exercices sont progressifs. Chaque exercice introduit de nouveaux concepts tout en consolidant les précédents.

---

## Exercice 1 : useLocalStorage Hook

**Objectif** : Créer un custom hook qui synchronise le state avec localStorage.

### Spécifications

Créer un hook `useLocalStorage<T>` qui :
- Persiste une valeur dans localStorage
- Initialise la valeur depuis localStorage si elle existe
- Met à jour localStorage quand la valeur change
- Gère les erreurs de parsing JSON
- Supporte les valeurs initiales de type fonction (lazy init)

### Interface

```tsx
function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, (value: T | ((prev: T) => T)) => void]
```

### Structure suggérée

```
src/hooks/
  useLocalStorage.ts
  useLocalStorage.test.ts
```

### Points d'attention

- Lazy initialization pour éviter de lire localStorage à chaque render
- Cleanup si la clé change
- Synchronisation entre onglets (optionnel, bonus)
- Gérer le cas où localStorage n'est pas disponible (SSR)

### Tests à implémenter

1. Retourne la valeur initiale si localStorage est vide
2. Retourne la valeur de localStorage si elle existe
3. Met à jour localStorage quand la valeur change
4. Supporte le functional update
5. Gère les erreurs de parsing JSON
6. Fonctionne avec différents types (string, number, object, array)

---

## Exercice 2 : useFetch Hook

**Objectif** : Créer un hook de data fetching avec gestion des états et cleanup.

### Spécifications

Créer un hook `useFetch<T>` qui :
- Fetch une URL et retourne les données
- Gère les états loading, error, data
- Annule le fetch si le composant est démonté (AbortController)
- Évite les race conditions quand l'URL change
- Supporte un refetch manuel

### Interface

```tsx
interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

function useFetch<T>(url: string): UseFetchResult<T>
```

### Structure suggérée

```
src/hooks/
  useFetch.ts
  useFetch.test.ts
```

### Points d'attention

- AbortController pour annuler les requêtes
- Flag `ignore` pour éviter les race conditions
- Ne pas mettre à jour le state après unmount
- Réinitialiser l'état quand l'URL change

### Tests à implémenter

1. Retourne loading=true initialement
2. Retourne les données après fetch réussi
3. Retourne l'erreur après fetch échoué
4. Annule le fetch au démontage
5. Gère les race conditions (URL change rapidement)
6. Refetch fonctionne correctement

---

## Exercice 3 : Modal avec Focus Trap

**Objectif** : Créer un composant Modal accessible avec gestion du focus.

### Spécifications

Créer un composant `Modal` qui :
- S'affiche en overlay au-dessus du contenu
- Ferme au clic sur le backdrop ou touche Escape
- Trap le focus à l'intérieur (Tab/Shift+Tab restent dans la modal)
- Restore le focus à l'élément précédent à la fermeture
- Empêche le scroll du body quand ouverte

### Interface

```tsx
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}
```

### Structure suggérée

```
src/components/Modal/
  Modal.tsx
  Modal.test.tsx
  useFocusTrap.ts     # Hook pour le focus trap
  useScrollLock.ts    # Hook pour bloquer le scroll
  index.ts
```

### Points d'attention

- `useRef` pour stocker l'élément précédemment focusé
- `useEffect` pour gérer les event listeners (Escape, click outside)
- Focus trap : trouver tous les éléments focusables
- Portal React pour le rendu (`createPortal`)
- Accessibilité : `role="dialog"`, `aria-modal`, `aria-labelledby`

### Tests à implémenter

1. Affiche le contenu quand isOpen=true
2. N'affiche rien quand isOpen=false
3. Appelle onClose au clic sur le backdrop
4. Appelle onClose à la touche Escape
5. Focus le premier élément focusable à l'ouverture
6. Restore le focus à la fermeture

---

## Exercice 4 : Infinite Scroll List

**Objectif** : Implémenter une liste avec chargement infini.

### Spécifications

Créer un composant `InfiniteList` qui :
- Charge la première page de données au montage
- Charge la page suivante quand l'utilisateur scroll en bas
- Affiche un loader pendant le chargement
- Gère les erreurs avec possibilité de retry
- Détecte la fin des données (plus rien à charger)

### Interface

```tsx
interface InfiniteListProps<T> {
  fetchPage: (page: number) => Promise<{ data: T[]; hasMore: boolean }>
  renderItem: (item: T) => ReactNode
  pageSize?: number
}
```

### Structure suggérée

```
src/components/InfiniteList/
  InfiniteList.tsx
  InfiniteList.test.tsx
  useInfiniteScroll.ts  # Hook avec IntersectionObserver
  index.ts
```

### Points d'attention

- `IntersectionObserver` pour détecter le scroll
- `useRef` pour l'élément sentinel (déclencheur)
- Éviter les appels multiples pendant le chargement
- Cleanup de l'observer au démontage
- `useCallback` pour les fonctions passées à l'observer

### Tests à implémenter

1. Charge la première page au montage
2. Affiche les items retournés
3. Affiche le loader pendant le chargement
4. Charge la page suivante à l'intersection
5. Arrête de charger quand hasMore=false
6. Affiche l'erreur et permet de retry

---

## Exercice 5 : Optimistic Todo avec Server Sync

**Objectif** : Pratiquer `useOptimistic` et `useTransition` avec une vraie synchronisation serveur.

### Spécifications

Reprendre le TodoList du Module 2 et ajouter :
- Simulation d'un serveur (delays, erreurs aléatoires)
- Updates optimistes avec `useOptimistic`
- Indicateur de pending avec `useTransition`
- Rollback automatique en cas d'erreur
- Indication visuelle des todos "en cours de sync"

### Interface

```tsx
// Simuler un serveur
async function serverAddTodo(text: string): Promise<Todo>
async function serverToggleTodo(id: string): Promise<Todo>
async function serverDeleteTodo(id: string): Promise<void>

// Ces fonctions peuvent échouer aléatoirement (10% du temps)
```

### Structure suggérée

```
src/components/OptimisticTodoList/
  OptimisticTodoList.tsx
  OptimisticTodoList.test.tsx
  fakeServer.ts           # Simule les appels serveur
  types.ts
  index.ts
```

### Points d'attention

- `useOptimistic` pour les updates immédiates
- `useTransition` pour marquer les actions comme non-urgentes
- Indication visuelle (opacité, spinner) pour les todos pending
- Gestion des erreurs avec toast ou message
- Rollback propre en cas d'échec

### Tests à implémenter

1. Affiche le todo immédiatement (optimistic)
2. Marque le todo comme pending pendant la sync
3. Confirme le todo après succès serveur
4. Rollback le todo après échec serveur
5. Affiche un message d'erreur
6. Permet de retry après erreur

---

## Exercice 6 : Data Table avec Suspense

**Objectif** : Créer une table de données utilisant Suspense et `use()`.

### Spécifications

Créer un composant `DataTable` qui :
- Utilise `use()` pour consommer les données
- Affiche un skeleton pendant le chargement (Suspense)
- Supporte le tri par colonne
- Supporte la pagination
- Gère les erreurs avec Error Boundary

### Interface

```tsx
interface Column<T> {
  key: keyof T
  header: string
  sortable?: boolean
  render?: (value: T[keyof T], item: T) => ReactNode
}

interface DataTableProps<T> {
  dataPromise: Promise<T[]>
  columns: Column<T>[]
  pageSize?: number
}
```

### Structure suggérée

```
src/components/DataTable/
  DataTable.tsx
  DataTableSkeleton.tsx
  DataTableError.tsx
  DataTable.test.tsx
  types.ts
  index.ts
```

### Points d'attention

- `use()` pour consommer la Promise
- Suspense boundary autour du composant
- Error Boundary pour les erreurs
- Le tri et la pagination sont du derived state (pas de fetch)
- Mémoisation pour les calculs de tri

### Tests à implémenter

1. Affiche le skeleton pendant le chargement
2. Affiche les données après résolution
3. Trie par colonne au clic sur le header
4. Pagine correctement les données
5. Affiche l'erreur si la Promise rejette
6. Reset fonctionne après erreur

---

## Challenge : Real-time Collaborative Editor

**Objectif** : Combiner tous les concepts du module dans un éditeur collaboratif simulé.

### Spécifications

Créer un éditeur de texte collaboratif (simulé) avec :

**Fonctionnalités de base :**
- Zone de texte éditable
- Sauvegarde automatique (debounced)
- Indicateur de statut (saved, saving, error)

**Simulation multi-utilisateurs :**
- Simuler des curseurs d'autres utilisateurs
- Afficher les positions en temps réel
- Simuler des modifications concurrentes

**Gestion d'état avancée :**
- `useReducer` pour l'état complexe
- `useOptimistic` pour les sauvegardes
- `useTransition` pour les updates non-urgentes
- `useRef` pour les valeurs mutables (timers, positions)

### Architecture suggérée

```tsx
type EditorState = {
  content: string
  cursors: Map<string, CursorPosition>
  status: 'idle' | 'saving' | 'saved' | 'error'
  lastSaved: Date | null
  version: number
}

type EditorAction =
  | { type: 'UPDATE_CONTENT'; payload: string }
  | { type: 'UPDATE_CURSOR'; payload: { userId: string; position: CursorPosition } }
  | { type: 'SET_STATUS'; payload: EditorState['status'] }
  | { type: 'SYNC_FROM_SERVER'; payload: { content: string; version: number } }
```

### Structure suggérée

```
src/components/CollaborativeEditor/
  CollaborativeEditor.tsx
  CollaborativeEditor.test.tsx
  editorReducer.ts
  useAutoSave.ts
  useCursorSync.ts
  fakeWebSocket.ts        # Simule les événements temps réel
  types.ts
  index.ts
```

### Points d'attention

- Debounce de la sauvegarde (500ms après la dernière frappe)
- Cleanup des subscriptions WebSocket simulées
- Gestion des conflits de version
- Performance : éviter les re-renders inutiles
- Accessibilité : labels, focus visible

### Tests à implémenter

1. Sauvegarde automatique après debounce
2. Affiche le statut de sauvegarde
3. Gère les erreurs de sauvegarde
4. Affiche les curseurs des autres utilisateurs
5. Met à jour le contenu depuis le "serveur"
6. Gère les conflits de version

---

## Critères de validation

Pour chaque exercice, assure-toi de :

- [ ] TypeScript strict (pas de `any`)
- [ ] Tests passants avec bonne couverture
- [ ] Cleanup dans tous les useEffect
- [ ] Gestion des race conditions
- [ ] Pas de memory leaks (vérifier les warnings act())
- [ ] Accessibilité de base respectée
- [ ] Code lisible et bien structuré

---

## Conseils

1. **Commence par les tests** : Écris le test, puis l'implémentation
2. **Un hook = une responsabilité** : Compose plusieurs hooks simples
3. **Cleanup d'abord** : Pense au cleanup avant d'implémenter l'effect
4. **Mesure avant d'optimiser** : N'utilise useMemo/useCallback que si nécessaire
5. **Console propre** : Aucun warning act() ou autre dans la console

---

## Progression suggérée

| Exercice | Difficulté | Concepts clés | Durée estimée |
|----------|------------|---------------|---------------|
| 1. useLocalStorage | ⭐⭐ | useEffect, lazy init, cleanup | 1h |
| 2. useFetch | ⭐⭐⭐ | AbortController, race conditions | 1.5h |
| 3. Modal | ⭐⭐⭐ | useRef, focus, portals | 2h |
| 4. Infinite Scroll | ⭐⭐⭐ | IntersectionObserver, refs | 2h |
| 5. Optimistic Todo | ⭐⭐⭐⭐ | useOptimistic, useTransition | 2h |
| 6. DataTable | ⭐⭐⭐⭐ | use(), Suspense, Error Boundary | 2h |
| Challenge | ⭐⭐⭐⭐⭐ | Tous les concepts | 3-4h |

---

→ Retour au [README du module](./README.md)
