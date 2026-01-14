# Exercices - Module 2 : State & Events

Ces exercices sont progressifs. Chaque exercice introduit de nouveaux concepts tout en consolidant les précédents.

---

## Exercice 1 : Counter avec contrôles

**Objectif** : Pratiquer `useState`, les événements, et le functional update.

### Spécifications

Créer un composant `Counter` avec :
- Affichage du compteur actuel
- Bouton "Increment" (+1)
- Bouton "Decrement" (-1)
- Bouton "Reset" (remet à 0)
- Bouton "Double" (multiplie par 2)
- Le compteur ne peut pas descendre en dessous de 0

### Structure suggérée

```
src/components/Counter/
  Counter.tsx
  Counter.test.tsx
  index.ts
```

### Points d'attention

- Utiliser le functional update (`setCount(c => c + 1)`)
- Gérer le cas où decrement ne doit pas passer sous 0
- Typage TypeScript strict

### Tests à implémenter

1. Affiche 0 au départ
2. Increment ajoute 1
3. Decrement soustrait 1
4. Decrement ne descend pas sous 0
5. Reset remet à 0
6. Double multiplie par 2

---

## Exercice 2 : Toggle Switch

**Objectif** : Pratiquer les états booléens et l'accessibilité.

### Spécifications

Créer un composant `Toggle` avec :
- Un switch on/off visuel
- Label optionnel
- Callback `onChange` quand l'état change
- État initial configurable via prop
- Accessible au clavier (Space pour toggle)

### Interface des props

```tsx
interface ToggleProps {
  label?: string
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
}
```

### Points d'attention

- Utiliser un `<button>` avec `role="switch"` et `aria-checked`
- Gérer le focus et la navigation clavier
- Styling avec des classes CSS conditionnelles

### Tests à implémenter

1. Affiche l'état off par défaut
2. Toggle on/off au click
3. Appelle onChange avec le nouvel état
4. Supporte defaultChecked
5. Toggle avec la touche Space
6. Affiche le label si fourni

---

## Exercice 3 : Formulaire de contact

**Objectif** : Pratiquer les formulaires contrôlés et la validation.

### Spécifications

Créer un composant `ContactForm` avec :
- Champs : name, email, message
- Validation :
  - Name : requis, min 2 caractères
  - Email : requis, format valide
  - Message : requis, min 10 caractères
- Affichage des erreurs sous chaque champ
- Bouton submit désactivé si le formulaire est invalide
- Callback `onSubmit` avec les données validées

### Interface

```tsx
interface ContactFormData {
  name: string
  email: string
  message: string
}

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void
}
```

### Points d'attention

- Validation en temps réel (au blur ou à la frappe)
- État des erreurs séparé de l'état du formulaire
- Pattern de handler générique pour les inputs
- Accessibilité : `aria-invalid`, `aria-describedby`

### Tests à implémenter

1. Soumet avec les bonnes données
2. Affiche erreur pour name vide
3. Affiche erreur pour email invalide
4. Affiche erreur pour message trop court
5. Désactive le bouton si invalide
6. Efface l'erreur quand l'utilisateur corrige

---

## Exercice 4 : Liste de tâches (TodoList)

**Objectif** : Pratiquer `useReducer` avec des actions typées.

### Spécifications

Créer une application TodoList avec :
- Ajout de tâches
- Toggle completed
- Suppression de tâches
- Filtres : All, Active, Completed
- Compteur de tâches restantes
- Bouton "Clear completed"

### Actions du reducer

```tsx
type Action =
  | { type: 'ADD_TODO'; payload: string }
  | { type: 'TOGGLE_TODO'; payload: string }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'SET_FILTER'; payload: 'all' | 'active' | 'completed' }
  | { type: 'CLEAR_COMPLETED' }
```

### Structure suggérée

```
src/components/TodoList/
  types.ts          # Types et interfaces
  todoReducer.ts    # Reducer et état initial
  TodoList.tsx      # Composant principal
  TodoItem.tsx      # Item individuel
  TodoFilters.tsx   # Filtres
  TodoList.test.tsx # Tests du composant
  todoReducer.test.ts # Tests du reducer
  index.ts
```

### Points d'attention

- Derived state pour les todos filtrés et le compteur
- Tester le reducer en isolation
- ID unique pour chaque todo (`crypto.randomUUID()`)

### Tests à implémenter

**Tests du reducer** :
1. Ajoute un todo
2. Toggle un todo
3. Supprime un todo
4. Change le filtre
5. Efface les completed
6. Ne mute pas l'état

**Tests du composant** :
1. Affiche les todos
2. Ajoute un todo via le formulaire
3. Toggle un todo au click
4. Filtre correctement les todos
5. Affiche le bon compteur

---

## Exercice 5 : Panier d'achat (Shopping Cart)

**Objectif** : Pratiquer l'architecture du state et les calculs dérivés.

### Spécifications

Créer un composant `ShoppingCart` avec :
- Liste de produits disponibles
- Ajout au panier
- Modification de la quantité (+/-)
- Suppression du panier
- Calcul du total
- Affichage du nombre d'articles

### Interface

```tsx
interface Product {
  id: string
  name: string
  price: number
}

interface CartItem {
  product: Product
  quantity: number
}

interface State {
  items: CartItem[]
}
```

### Actions

```tsx
type Action =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
```

### Points d'attention

- Si on ajoute un produit déjà présent, incrémenter la quantité
- La quantité minimale est 1 (sinon supprimer)
- Derived state : total, nombre d'articles
- Formater les prix correctement

### Tests à implémenter

1. Ajoute un produit au panier
2. Incrémente la quantité si déjà présent
3. Met à jour la quantité
4. Supprime si quantité = 0
5. Calcule le total correctement
6. Vide le panier

---

## Challenge : Formulaire multi-étapes (Wizard)

**Objectif** : Combiner tous les concepts du module.

### Spécifications

Créer un formulaire d'inscription en 3 étapes :

**Étape 1 : Informations personnelles**
- Prénom, Nom, Date de naissance

**Étape 2 : Coordonnées**
- Email, Téléphone, Adresse

**Étape 3 : Préférences**
- Newsletter (checkbox)
- Thème (radio : light/dark/system)
- Notifications (select multiple)

### Fonctionnalités

- Navigation Précédent/Suivant
- Indicateur de progression
- Validation par étape (ne peut pas passer à l'étape suivante si invalide)
- Récapitulatif avant soumission
- Possibilité de revenir en arrière et modifier

### Architecture suggérée

```tsx
type WizardState = {
  currentStep: number
  data: {
    personal: { firstName: string; lastName: string; birthDate: string }
    contact: { email: string; phone: string; address: string }
    preferences: { newsletter: boolean; theme: string; notifications: string[] }
  }
  errors: Record<string, string>
}

type Action =
  | { type: 'SET_FIELD'; payload: { step: string; field: string; value: unknown } }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'SUBMIT' }
```

### Points d'attention

- `useReducer` pour gérer l'état complexe
- Validation dynamique selon l'étape
- Persistance optionnelle dans localStorage
- Accessibilité : focus management entre étapes

---

## Critères de validation

Pour chaque exercice, assure-toi de :

- [ ] TypeScript strict (pas de `any`)
- [ ] Tests passants avec bonne couverture
- [ ] Utilisation de userEvent (pas fireEvent)
- [ ] Accessibilité de base respectée
- [ ] Pas de mutation d'état
- [ ] Functional updates quand nécessaire

---

## Conseils

1. **Commence simple** : Fais marcher le cas nominal avant les edge cases
2. **Tests d'abord** : Écris le test, puis l'implémentation (TDD light)
3. **Itère** : Un comportement à la fois
4. **Demande des reviews** : Claude peut réviser ton code à chaque étape

---

→ Retour au [README du module](./README.md)
