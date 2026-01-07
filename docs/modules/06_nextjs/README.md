# Module 6 : Next.js App Router

**Durée estimée** : 12-18h
**Prérequis** : Modules 1-5 complétés

---

## Objectifs du module

À la fin de ce module, tu seras capable de :

- Comprendre l'architecture App Router (RSC, Client/Server boundary)
- Maîtriser layouts, templates et groupes de routes
- Distinguer et utiliser Server Components vs Client Components
- Gérer le data fetching moderne (fetch, cache, revalidation)
- Implémenter Server Actions pour les mutations
- Créer des API Routes et Route Handlers
- Configurer middleware et authentification
- Optimiser les performances et déployer sur Vercel

---

## Structure du module

| Section                | Contenu                                        | Fichier                |
| ---------------------- | ---------------------------------------------- | ---------------------- |
| 1. App Router          | Architecture, routing, conventions de fichiers | `01_app_router.md`     |
| 2. Layouts & Templates | Layouts imbriqués, templates, groupes          | `02_layouts.md`        |
| 3. Server Components   | RSC, avantages, contraintes, "use client"      | `03_rsc.md`            |
| 4. Data Fetching       | fetch(), cache, revalidation, streaming        | `04_data_fetching.md`  |
| 5. Server Actions      | Mutations, forms, optimistic updates           | `05_server_actions.md` |
| 6. Route Handlers      | API Routes, méthodes HTTP, streaming           | `06_route_handlers.md` |
| 7. Middleware          | Auth, redirects, i18n, edge runtime            | `07_middleware.md`     |
| 8. Performance         | Images, fonts, lazy loading, analytics         | `08_performance.md`    |
| 9. Déploiement         | Vercel, autres platforms, env variables        | `09_deployment.md`     |
| Exercices              | Mini-projet complet                            | `exercises.md`         |

---

## App Router vs Pages Router

| Aspect             | Pages Router (legacy)                  | App Router (moderne)          |
| ------------------ | -------------------------------------- | ----------------------------- |
| Routing            | `pages/` directory                     | `app/` directory              |
| Layouts            | `_app.tsx`, `_document.tsx`            | `layout.tsx` imbriqués        |
| Data fetching      | `getServerSideProps`, `getStaticProps` | `fetch()` dans les composants |
| Composants serveur | Non                                    | Oui (par défaut)              |
| Streaming          | Limité                                 | Natif avec Suspense           |

---

## Concepts clés à comprendre

### React Server Components (RSC)

- Exécutés UNIQUEMENT sur le serveur
- Pas de bundle JS envoyé au client
- Accès direct à la DB, filesystem, secrets
- Pas de state, pas de hooks client
- Directive `"use client"` pour opt-in client

### La frontière Client/Server

```
Server Component (défaut)
    └── Server Component
        └── Client Component ("use client")
            └── Client Component (implicite)
                └── Server Component (NON - doit être passé en children)
```

### Data Fetching moderne

- `fetch()` étendu avec cache et revalidation
- Déduplication automatique des requêtes
- Revalidation : `revalidatePath()`, `revalidateTag()`
- Streaming avec Suspense

### Server Actions

- Fonctions async côté serveur
- Appelables depuis Client Components
- Directive `"use server"`
- Mutations sécurisées sans API endpoint

---

## Points clés à aborder

### Architecture App Router

- Convention de fichiers (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`)
- Route groups `(group)`
- Routes dynamiques `[slug]`, `[...slug]`
- Parallel routes `@slot`
- Intercepting routes `(.)`, `(..)`, `(..)(..)`

### Layouts

- Préservation du state entre navigations
- Layouts imbriqués automatiques
- Templates (remontent le state)
- Metadata API

### Caching

- Full Route Cache
- Data Cache
- Router Cache
- Quand et comment invalider

### Middleware

- Edge Runtime
- Matcher patterns
- Redirections et rewrites
- Headers et cookies
- Authentication patterns

---

## Checklist de validation

Avant de considérer la formation complète :

- [ ] Créer une app avec layouts imbriqués
- [ ] Implémenter du data fetching avec cache et revalidation
- [ ] Créer des Server Actions pour les mutations
- [ ] Configurer un middleware d'authentification
- [ ] Optimiser les images et fonts
- [ ] Déployer sur Vercel

---

## Mini-projet final

Le module se conclut par un mini-projet intégrant tous les concepts :

**Application de gestion de tâches** avec :

- Authentification (middleware)
- CRUD via Server Actions
- Layouts imbriqués (dashboard)
- Optimistic updates
- Déploiement Vercel

---

> **Note** : Le contenu détaillé de ce module sera rédigé quand tu seras prêt à l'aborder.

→ Retour à la [vue d'ensemble](../../00_overview.md)
