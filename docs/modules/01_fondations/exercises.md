# Exercices - Module 1 : Fondations React

## Organisation

Les exercices suivent une progression :
1. **Découverte** : Premiers pas, manipulation basique
2. **Application** : Mise en pratique des concepts
3. **Consolidation** : Exercice complet avec tests

**Où coder** : `src/exercises/module_01/`

---

## Exercice 1 : JSX et expressions (Découverte)

### Objectif
Créer un composant `ProductCard` qui affiche les informations d'un produit.

### Consigne

Crée le fichier `src/exercises/module_01/ProductCard.tsx` avec :

1. Une interface `Product` avec les propriétés :
   - `id: string`
   - `name: string`
   - `price: number`
   - `inStock: boolean`
   - `imageUrl: string`

2. Un composant `ProductCard` qui :
   - Affiche l'image du produit
   - Affiche le nom
   - Affiche le prix formaté (ex: "€ 29.99")
   - Affiche "In Stock" ou "Out of Stock" selon `inStock`
   - Applique une classe CSS différente selon le stock

### Points à valider
- [ ] JSX correct avec expressions `{}`
- [ ] Rendu conditionnel (ternaire ou &&)
- [ ] Attributs JSX corrects (`className`, pas `class`)
- [ ] Props typées avec interface

### Indice
```tsx
// Pour formater le prix
const formattedPrice = `€ ${price.toFixed(2)}`
```

---

## Exercice 2 : Composants et composition (Application)

### Objectif
Créer un système de composants `Card` composables.

### Consigne

Crée les composants dans `src/exercises/module_01/Card/` :

1. `Card.tsx` : Container principal
   - Accepte `children` et une prop optionnelle `variant: 'default' | 'outlined' | 'elevated'`

2. `CardHeader.tsx` : En-tête de la carte
   - Accepte `title: string` et optionnellement `subtitle?: string`

3. `CardBody.tsx` : Corps de la carte
   - Accepte `children`

4. `CardFooter.tsx` : Pied de la carte
   - Accepte `children`

5. `index.ts` : Barrel export

### Exemple d'utilisation attendu

```tsx
<Card variant="elevated">
  <CardHeader title="My Card" subtitle="A subtitle" />
  <CardBody>
    <p>Card content goes here</p>
  </CardBody>
  <CardFooter>
    <button>Action</button>
  </CardFooter>
</Card>
```

### Points à valider
- [ ] Chaque composant est correctement typé
- [ ] `children` typé comme `React.ReactNode`
- [ ] Valeurs par défaut pour les props optionnelles
- [ ] Export propre via index.ts

---

## Exercice 3 : Liste avec keys (Application)

### Objectif
Créer un composant `UserList` qui affiche une liste d'utilisateurs.

### Consigne

1. Définis l'interface `User` :
   - `id: string`
   - `name: string`
   - `email: string`
   - `role: 'admin' | 'user' | 'guest'`
   - `isActive: boolean`

2. Crée `UserList.tsx` qui :
   - Reçoit `users: User[]` en props
   - Affiche un message si la liste est vide
   - Affiche chaque utilisateur avec son nom, email et rôle
   - Met en évidence les admins (style différent)
   - Indique visuellement les utilisateurs inactifs (grisé ou barré)
   - Utilise des keys correctes

3. Crée `UserRow.tsx` pour extraire la logique d'affichage d'un utilisateur

### Points à valider
- [ ] Keys stables et uniques (pas d'index)
- [ ] Rendu conditionnel pour la liste vide
- [ ] Styles conditionnels selon le rôle et le statut
- [ ] Composant `UserRow` bien extrait

---

## Exercice 4 : Props avancées (Application)

### Objectif
Créer un composant `Button` flexible et bien typé.

### Consigne

Crée `src/exercises/module_01/Button.tsx` avec :

1. Props de base :
   - `children: React.ReactNode`
   - `variant?: 'primary' | 'secondary' | 'danger'` (défaut: 'primary')
   - `size?: 'sm' | 'md' | 'lg'` (défaut: 'md')
   - `disabled?: boolean`
   - `loading?: boolean`
   - `onClick?: () => void`

2. Le bouton doit :
   - Appliquer des classes CSS selon variant et size
   - Afficher "Loading..." quand `loading` est true
   - Être disabled quand `loading` ou `disabled` est true
   - Passer le reste des props au bouton natif (`type`, `form`, etc.)

3. Utilise `ComponentProps<'button'>` pour hériter des props natives

### Points à valider
- [ ] Typage avec discriminated union ou extension de props natives
- [ ] Spread des props restantes
- [ ] État loading géré correctement
- [ ] Accessibilité (aria-disabled quand loading)

---

## Exercice 5 : Composant générique (Consolidation)

### Objectif
Créer un composant `DataList<T>` générique et réutilisable.

### Consigne

Crée `src/exercises/module_01/DataList.tsx` :

```tsx
interface DataListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T) => string
  emptyMessage?: string
  header?: React.ReactNode
  footer?: React.ReactNode
}
```

Le composant doit :
1. Être générique (fonctionne avec n'importe quel type de données)
2. Afficher le header si fourni
3. Afficher le message vide si pas d'items
4. Rendre chaque item avec la fonction `renderItem`
5. Afficher le footer si fourni

### Exemples d'utilisation

```tsx
// Avec des strings
<DataList
  items={['Apple', 'Banana', 'Cherry']}
  renderItem={(fruit) => <span>{fruit}</span>}
  keyExtractor={(fruit) => fruit}
/>

// Avec des objets
<DataList
  items={products}
  renderItem={(product) => <ProductCard product={product} />}
  keyExtractor={(product) => product.id}
  emptyMessage="No products found"
  header={<h2>Products</h2>}
/>
```

### Points à valider
- [ ] Générique TypeScript correct
- [ ] Tous les cas gérés (vide, header, footer)
- [ ] Keys correctes
- [ ] Inférence de type automatique à l'utilisation

---

## Exercice 6 : Test complet (Consolidation)

### Objectif
Écrire des tests pour le composant `UserList` de l'exercice 3.

### Consigne

Crée `src/exercises/module_01/UserList.test.tsx` avec les tests suivants :

1. **Test de rendu vide**
   - Vérifie que le message "No users" s'affiche quand la liste est vide

2. **Test de rendu de liste**
   - Vérifie que tous les utilisateurs sont affichés
   - Vérifie que les noms et emails sont visibles

3. **Test du style admin**
   - Vérifie que les admins ont un style/classe différent

4. **Test du style inactif**
   - Vérifie que les utilisateurs inactifs sont visuellement différents

5. **Test d'accessibilité basique**
   - Vérifie que la liste utilise un élément `<ul>` ou `<ol>`
   - Vérifie que chaque utilisateur est dans un `<li>`

### Points à valider
- [ ] Utilisation de `render` et `screen`
- [ ] Queries appropriées (getByRole, getByText)
- [ ] Tests indépendants (chacun fait son propre render)
- [ ] Assertions claires

### Structure attendue

```tsx
import { render, screen } from '@testing-library/react'
import { UserList } from './UserList'

describe('UserList', () => {
  const mockUsers = [
    { id: '1', name: 'Alice', email: 'alice@test.com', role: 'admin', isActive: true },
    { id: '2', name: 'Bob', email: 'bob@test.com', role: 'user', isActive: false },
  ]

  it('shows empty message when no users', () => {
    // À implémenter
  })

  it('renders all users', () => {
    // À implémenter
  })

  // etc.
})
```

---

## Challenge : ProfileCard complet

### Objectif
Combiner tous les concepts du module dans un composant complet.

### Consigne

Crée un composant `ProfileCard` qui :

1. **Interface complète**
   ```tsx
   interface ProfileCardProps {
     user: {
       id: string
       name: string
       email: string
       avatar: string
       bio?: string
       social?: {
         twitter?: string
         github?: string
         linkedin?: string
       }
     }
     variant?: 'compact' | 'full'
     onContact?: () => void
     onFollow?: () => void
   }
   ```

2. **Rendu**
   - Mode `compact` : avatar, nom, email seulement
   - Mode `full` : tout, incluant bio et liens sociaux
   - Boutons Contact/Follow si les handlers sont fournis
   - Icônes pour les réseaux sociaux (utilise des emojis ou caractères Unicode)

3. **Composition**
   - Utilise tes composants `Card` de l'exercice 2

4. **Tests**
   - Au moins 5 tests couvrant les différents cas

### Critères de réussite
- [ ] TypeScript strict sans erreur
- [ ] Tous les cas de rendu conditionnel fonctionnent
- [ ] Composition avec les composants Card
- [ ] Tests passants
- [ ] Code lisible et bien structuré

---

## Validation du module

Quand tu as terminé les exercices :

1. Tous les tests passent : `pnpm test`
2. Pas d'erreur TypeScript : `pnpm type-check` (si configuré)
3. Code linté : `pnpm lint`

Tu peux ensuite demander une review à Claude et passer au [Module 2 : State & Events](../02_state/README.md).
