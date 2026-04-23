# Exercices - Module 4 : Patterns & Architecture

Ces exercices sont progressifs. Chaque exercice introduit de nouveaux concepts tout en consolidant les précédents.

---

## Exercice 1 : ThemeContext

**Objectif** : Créer un Context complet pour gérer un thème (dark/light) avec le pattern recommandé.

### Spécifications

Créer un `ThemeContext` qui :

- Fournit le thème courant (`light` | `dark`) et une fonction `toggleTheme`
- Persiste le choix dans `localStorage` (réutiliser `useLocalStorage` du module 3)
- Respecte la préférence système via `prefers-color-scheme` comme valeur initiale
- Applique la classe `dark` sur `<html>` quand le thème est dark

### Interface

```tsx
interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}
```

### Structure suggérée

```
src/contexts/
  ThemeContext.tsx         # createContext + Provider + hook useTheme
src/app/theme-demo/
  page.tsx                # Page de démo avec composants utilisant le thème
```

### Points d'attention

- `createContext<ThemeContextType | null>(null)` avec hook custom qui throw
- Ne PAS exporter le context directement, uniquement le Provider et le hook
- Utiliser `useEffect` pour synchroniser la classe CSS sur `<html>`
- Lazy initialization depuis localStorage / `matchMedia`

### Tests à implémenter

1. Le Provider fournit le thème par défaut
2. `toggleTheme` bascule entre light et dark
3. `useTheme` throw en dehors du Provider
4. Le thème est persisté dans localStorage

---

## Exercice 2 : NotificationContext avec Context Splitting

**Objectif** : Implémenter un système de notifications avec séparation state/dispatch pour optimiser les re-renders.

### Spécifications

Créer un système de notifications qui :

- Permet d'ajouter des notifications (success, error, warning, info)
- Supprime automatiquement les notifications après un délai configurable
- Sépare le state (liste des notifications) du dispatch (add, remove)
- Affiche les notifications sous forme de toast

### Interfaces

```tsx
type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number // ms, défaut 5000
}

interface NotificationState {
  notifications: Notification[]
}

type NotificationAction =
  | { type: 'ADD'; payload: Omit<Notification, 'id'> }
  | { type: 'REMOVE'; payload: string }

interface NotificationDispatchContextType {
  addNotification: (type: NotificationType, message: string, duration?: number) => void
  removeNotification: (id: string) => void
}
```

### Structure suggérée

```
src/contexts/
  NotificationContext.tsx    # Deux contexts : State + Dispatch
src/components/
  NotificationToast.tsx      # Composant d'affichage d'une notification
  NotificationContainer.tsx  # Conteneur qui affiche toutes les notifications
src/app/notifications-demo/
  page.tsx                   # Page de démo
```

### Points d'attention

- **useReducer** pour gérer les actions de manière prévisible
- **Deux contexts séparés** : `NotificationStateContext` et `NotificationDispatchContext`
- Le composant qui ajoute des notifications ne doit PAS re-rendre quand la liste change
- Utiliser `useRef` pour les timers de suppression automatique
- Générer les IDs avec `crypto.randomUUID()`

### Tests à implémenter

1. Ajouter une notification met à jour le state
2. Supprimer une notification l'enlève du state
3. Les notifications disparaissent après le délai
4. Les composants qui n'utilisent que dispatch ne re-rendent pas quand le state change

---

## Exercice 3 : Accordion (Compound Component)

**Objectif** : Créer un composant Accordion en utilisant le pattern Compound Components avec Context.

### Spécifications

Créer un `Accordion` composé de :

- `Accordion` : conteneur principal, gère quel item est ouvert
- `Accordion.Item` : un item de l'accordion, identifié par une `value`
- `Accordion.Trigger` : le header cliquable qui ouvre/ferme
- `Accordion.Content` : le contenu affiché quand l'item est ouvert

### Interface d'utilisation (API publique)

```tsx
<Accordion defaultValue="item-1">
  <Accordion.Item value="item-1">
    <Accordion.Trigger>Section 1</Accordion.Trigger>
    <Accordion.Content>Contenu de la section 1</Accordion.Content>
  </Accordion.Item>

  <Accordion.Item value="item-2">
    <Accordion.Trigger>Section 2</Accordion.Trigger>
    <Accordion.Content>Contenu de la section 2</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

### Structure suggérée

```
src/components/
  Accordion/
    Accordion.tsx           # Composant principal + sous-composants
    AccordionContext.tsx     # Context interne (2 niveaux)
    index.ts                # Export public
src/app/accordion-demo/
  page.tsx                  # Page de démo
```

### Points d'attention

- **Deux niveaux de Context** : un pour l'Accordion global (quel item ouvert), un pour chaque Item (sa valeur)
- Le context est **interne** : l'utilisateur ne voit que les composants
- `Accordion.Trigger` et `Accordion.Content` doivent fonctionner sans props explicites (données via context)
- Supporter le mode `single` (un seul item ouvert) et optionnellement `multiple`
- Accessibilité : attributs `aria-expanded`, `aria-controls`, `role`

### Tests à implémenter

1. Un seul item est ouvert à la fois (mode single)
2. Cliquer sur un Trigger ouvre/ferme le Content correspondant
3. Le composant fonctionne avec `defaultValue`
4. Les attributs ARIA sont correctement appliqués
5. `Accordion.Trigger` en dehors d'un `Accordion.Item` throw une erreur

---

## Exercice 4 : Tabs (Compound Component)

**Objectif** : Créer un composant Tabs réutilisable avec le pattern Compound Components.

### Spécifications

- `Tabs` : conteneur, gère l'onglet actif
- `Tabs.List` : la barre d'onglets
- `Tabs.Tab` : un onglet cliquable
- `Tabs.Panel` : le contenu associé à un onglet

### Interface d'utilisation

```tsx
<Tabs defaultValue="tab-1">
  <Tabs.List>
    <Tabs.Tab value="tab-1">Onglet 1</Tabs.Tab>
    <Tabs.Tab value="tab-2">Onglet 2</Tabs.Tab>
    <Tabs.Tab value="tab-3" disabled>
      Onglet 3
    </Tabs.Tab>
  </Tabs.List>

  <Tabs.Panel value="tab-1">Contenu 1</Tabs.Panel>
  <Tabs.Panel value="tab-2">Contenu 2</Tabs.Panel>
  <Tabs.Panel value="tab-3">Contenu 3</Tabs.Panel>
</Tabs>
```

### Structure suggérée

```
src/components/
  Tabs/
    Tabs.tsx
    TabsContext.tsx
    index.ts
src/app/tabs-demo/
  page.tsx
```

### Points d'attention

- Pattern similaire à l'Accordion mais avec une UI différente
- Navigation clavier : flèches gauche/droite pour changer d'onglet
- Onglets `disabled` non sélectionnables
- Accessibilité : `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`
- Mode contrôlé (`value` + `onChange`) ET non contrôlé (`defaultValue`)

### Tests à implémenter

1. L'onglet par défaut est sélectionné
2. Cliquer sur un onglet change le panneau affiché
3. Les onglets disabled ne sont pas sélectionnables
4. Navigation clavier (flèches gauche/droite)
5. Les rôles ARIA sont corrects

---

## Exercice 5 : State Management avec Zustand

**Objectif** : Migrer un state géré par Context vers Zustand et comparer.

### Spécifications

Reprendre l'application TodoList (Module 2) et :

- Créer un store Zustand pour gérer les todos
- Implémenter les mêmes fonctionnalités (CRUD, filtre, compteurs)
- Ajouter la persistence via `persist` middleware
- Utiliser les sélecteurs pour optimiser les re-renders
- Ajouter des devtools

### Interface du store

```tsx
interface TodoStore {
  todos: Todo[]
  filter: 'all' | 'active' | 'completed'

  // Actions
  addTodo: (text: string) => void
  toggleTodo: (id: string) => void
  removeTodo: (id: string) => void
  setFilter: (filter: 'all' | 'active' | 'completed') => void

  // Computed (sélecteurs dérivés)
  filteredTodos: () => Todo[]
  stats: () => { total: number; active: number; completed: number }
}
```

### Structure suggérée

```
src/stores/
  useTodoStore.ts            # Store Zustand
src/app/zustand-todo/
  page.tsx                   # Page avec TodoList utilisant Zustand
```

### Points d'attention

- **Pas de Provider** : Zustand ne nécessite pas de Provider
- Utiliser `persist` middleware pour localStorage
- Sélecteurs granulaires : `useTodoStore((state) => state.todos)`
- Comparer la quantité de code vs Context+useReducer
- Devtools : `devtools` middleware

### Tests à implémenter

1. Le store initial a une liste de todos vide
2. `addTodo` ajoute un todo
3. `toggleTodo` change le statut
4. `filteredTodos` respecte le filtre actif
5. La persistence fonctionne (mock de localStorage)

---

## Exercice 6 : Feature complète Clean Architecture

**Objectif** : Structurer une feature complète avec séparation des concerns.

### Spécifications

Créer une fonctionnalité de **gestion de contacts** avec :

- Liste des contacts avec recherche
- Ajout / Édition / Suppression de contacts
- Formulaire de contact avec validation
- API simulée (délai artificiels, possibilité d'erreur)

### Architecture

```
src/features/contacts/
  types/
    Contact.ts              # Types du domaine
  api/
    contactApi.ts           # Couche d'accès aux données (simulée)
  hooks/
    useContacts.ts          # Hook qui orchestre la logique
    useContactForm.ts       # Hook pour le formulaire
  components/
    ContactList.tsx         # Affichage de la liste
    ContactCard.tsx         # Carte d'un contact
    ContactForm.tsx         # Formulaire d'ajout/édition
    ContactSearch.tsx       # Barre de recherche
  contexts/
    ContactContext.tsx       # Context pour partager le state
  index.ts                  # Export public de la feature
```

### Points d'attention

- **Séparation stricte** : les composants ne font QUE de l'affichage
- Les hooks orchestrent la logique métier
- L'API est isolée et facilement remplaçable
- Le Context est optionnel : il sert à éviter le prop drilling au sein de la feature
- Chaque couche est testable indépendamment

### Tests à implémenter

1. **API** : les fonctions retournent les bonnes données
2. **Hooks** : la logique de recherche, filtrage, CRUD fonctionne
3. **Composants** : les composants rendent correctement (avec Context mocké)
4. **Intégration** : le flow complet fonctionne (ajout → apparaît dans la liste)

---

## Challenge : Dashboard avec multi-contextes

**Objectif** : Combiner tous les patterns du module dans un mini-dashboard.

### Spécifications

Créer un dashboard qui intègre :

- **ThemeContext** : dark/light mode
- **AuthContext** : utilisateur connecté (mocké)
- **NotificationContext** : système de toasts
- Un **Compound Component** custom (Tabs ou Accordion pour la navigation)
- Un **store Zustand** pour les données métier (stats, activité)

### Interface

- Header avec nom utilisateur, toggle theme, bouton de déconnexion
- Sidebar avec navigation via Compound Component
- Zone principale avec widgets (stats, graphiques placeholder)
- Notifications toast en overlay

### Points d'attention

- `ComposeProviders` pour organiser les Providers
- Chaque contexte est testable indépendamment
- Les widgets utilisent Zustand pour les données fréquemment mises à jour
- Le thème est appliqué globalement via CSS classes

---

## Ordre recommandé

1. **Exercice 1** (ThemeContext) → Bases du Context API
2. **Exercice 2** (NotificationContext) → Context splitting + useReducer
3. **Exercice 3** (Accordion) → Compound Components
4. **Exercice 4** (Tabs) → Compound Components + accessibilité
5. **Exercice 5** (Zustand) → Alternative à Context
6. **Exercice 6** (Clean Architecture) → Structuration complète
7. **Challenge** (Dashboard) → Intégration de tous les patterns

→ Retour au [README du module](./README.md)
