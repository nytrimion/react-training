# Module 5 : Forms Avancés & Validation

**Durée estimée** : 7-10h
**Prérequis** : Modules 1-4 complétés

---

## Objectifs du module

À la fin de ce module, tu seras capable de :

- Maîtriser React Hook Form (useForm, Controller, performance)
- Valider des formulaires avec Zod (schemas, inférence TypeScript)
- Implémenter des formulaires complexes (wizard, dynamic fields)
- Assurer l'accessibilité des formulaires (a11y)
- Tester efficacement les formulaires

---

## Structure du module

| Section               | Contenu                                          | Fichier                  |
| --------------------- | ------------------------------------------------ | ------------------------ |
| 1. React Hook Form    | useForm, register, handleSubmit, errors          | `01_rhf_basics.md`       |
| 2. RHF avancé         | Controller, useFieldArray, watch, performance    | `02_rhf_advanced.md`     |
| 3. Zod                | Schemas, parsing, inférence TypeScript           | `03_zod.md`              |
| 4. RHF + Zod          | zodResolver, validation intégrée                 | `04_rhf_zod.md`          |
| 5. Patterns complexes | Wizard forms, dynamic fields, conditional fields | `05_complex_patterns.md` |
| 6. Accessibilité      | aria-\*, focus management, error announcements   | `06_accessibility.md`    |
| 7. Testing            | Testing forms, validation, submission            | `07_testing.md`          |
| Exercices             | Exercices pratiques progressifs                  | `exercises.md`           |

---

## Pourquoi React Hook Form ?

| Aspect      | Controlled (natif)      | React Hook Form                |
| ----------- | ----------------------- | ------------------------------ |
| Re-renders  | À chaque keystroke      | Minimal (uncontrolled)         |
| Validation  | Manuelle                | Intégrée (+ resolvers)         |
| Performance | Peut être problématique | Optimisée par défaut           |
| Boilerplate | Beaucoup                | Peu                            |
| TypeScript  | Manuel                  | Inférence automatique avec Zod |

---

## Pourquoi Zod ?

```typescript
// Schema = Validation + Type TypeScript
const userSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
})

// Le type est inféré automatiquement !
type User = z.infer<typeof userSchema>
// { email: string; age: number }
```

- Single source of truth pour validation ET types
- Runtime validation (pas juste compile-time)
- Composable et extensible
- Excellent support TypeScript

---

## Points clés à aborder

### React Hook Form - Bases

- `register` : connecter un input
- `handleSubmit` : gérer la soumission
- `formState.errors` : afficher les erreurs
- `watch` : observer des valeurs
- Mode de validation (onChange, onBlur, onSubmit)

### React Hook Form - Avancé

- `Controller` : pour les composants UI libraries
- `useFieldArray` : champs dynamiques
- `useFormContext` : formulaires imbriqués
- Performance : éviter les re-renders inutiles
- Reset et default values

### Zod

- Types primitifs et objets
- Transformations (`.transform()`)
- Refinements (`.refine()`)
- Union et discriminated unions
- Error messages customisés

### Accessibilité (a11y)

- Labels et `htmlFor`
- `aria-invalid`, `aria-describedby`
- Messages d'erreur accessibles
- Focus management après erreur
- Annonces pour screen readers

---

## Checklist de validation

Avant de passer au module suivant :

- [ ] Créer un formulaire avec React Hook Form + Zod
- [ ] Implémenter un wizard form multi-étapes
- [ ] Ajouter des champs dynamiques avec useFieldArray
- [ ] Assurer l'accessibilité complète (tester avec screen reader)
- [ ] Écrire des tests pour validation et soumission

---

> **Note** : Le contenu détaillé de ce module sera rédigé quand tu seras prêt à l'aborder.

→ Retour à la [vue d'ensemble](../../00_overview.md)
