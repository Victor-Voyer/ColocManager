---
name: authentication
description: >-
  Guide l'implémentation et la modification de l'authentification dans tout
  type de projet (SPA, API, SSR, mobile). Utiliser pour login/register/logout,
  sécurité des routes, tokens ou sessions, CORS, cookies, profil utilisateur,
  autorisation et isolation des données.
---

# Authentification — guide générique

Skill applicable à **tout projet**. Avant toute modification, **identifier le modèle d'auth du dépôt** (voir phase 1). Ne pas imposer JWT, session ou OAuth sans l'avoir confirmé dans le code.
## Phase 1 — Découvrir le projet

Parcourir le dépôt et remplir mentalement ce tableau :

| Question | Où chercher |
|----------|-------------|
| Stratégie auth | Config sécurité (`security.yaml`, middleware, guards), README, `.env` |
| Backend / frontend | Structure monorepo ou repos séparés |
| Stockage identité | Entité User, table `users`, provider auth |
| Transport credentials | Cookie session, header `Authorization: Bearer`, refresh token |
| Routes publiques vs protégées | `access_control`, middleware, route guards |
| Client HTTP | `fetch`/`axios` + `credentials` ou interceptors token |
| Isolation données | Rôles, tenant_id, org_id, user_id dans les requêtes |

**Patterns courants :**

```
A) Session + cookie     → stateful, credentials: 'include', SameSite
B) JWT stateless        → Authorization: Bearer, refresh optionnel
C) OAuth / SSO          → redirect, callback, token exchange
D) SSR / cookies httpOnly → pas de token en localStorage côté client
E) API key / service    → header dédié, pas de login utilisateur
```

Documenter brièvement le modèle détecté avant d'éditer.

---

## Phase 2 — Cartographier l'architecture

Schéma générique à adapter :

```
Client (UI / mobile / SSR)
    │  credentials (cookie | Bearer | API key)
    ▼
Couche transport (proxy dev | CORS prod)
    ▼
Middleware / Firewall / Guards
    ▼
Utilisateur authentifié (rôles, claims, tenant)
    ▼
Données filtrées par propriétaire / rôle / tenant
```

### Endpoints auth typiques

| Méthode | Chemin (convention) | Auth | Comportement attendu |
|---------|---------------------|------|----------------------|
| `POST` | `/api/auth/register` ou `/api/register` | Non | Créer compte — auto-login **optionnel** |
| `POST` | `/api/auth/login` ou `/api/login` | Non | Établir session ou renvoyer token(s) |
| `POST` | `/api/auth/logout` | Oui* | Invalider session / révoquer token |
| `GET` | `/api/auth/me` ou `/api/user` | Oui | Profil utilisateur courant |
| `PATCH` | `/api/auth/me` | Oui | Mise à jour profil |
| `POST` | `/api/auth/refresh` | Variable | Renouveler JWT (si applicable) |

\* Logout peut être côté client uniquement pour JWT sans blacklist.

Lister les **vrais chemins** du projet dans un commentaire ou une section locale si le skill est copié dans un repo.

### Fichiers à localiser (noms indicatifs)

**Backend**

| Zone | Exemples de chemins |
|------|---------------------|
| Config sécurité | `config/packages/security.yaml`, `middleware/auth.*`, `guards/` |
| Session / CORS | `framework.yaml`, `cors.*`, `session.*` |
| Entité utilisateur | `Entity/User.*`, `models/user.*` |
| Controllers auth | `*Auth*Controller`, `*Login*`, `*Register*`, `UserController` |
| Handlers / strategies | `*SuccessHandler`, `*FailureHandler`, `JwtAuthenticator` |
| Services | `Register*Service`, `Update*Service`, `AuthService` |
| DTO / validation | `Register*Request`, `Login*Dto`, validators |
| Isolation données | Repositories `*ForUser`, scopes tenant, policies |

**Frontend / client**

| Zone | Exemples de chemins |
|------|---------------------|
| État auth global | `AuthContext`, `authStore`, `useAuth`, Pinia/Vuex module |
| Services API | `authService`, `apiClient`, interceptors axios |
| Routes protégées | `ProtectedRoute`, `authGuard`, middleware Nuxt/Next |
| Routes invité | `GuestRoute`, redirect si déjà connecté |
| Config dev | `vite.config` proxy, `next.config` rewrites, env API |

---

## Phase 3 — Flux standards

### Bootstrap (chargement app)

1. Au démarrage, vérifier l'état auth (`GET /me`, lecture token, validation cookie).
2. Succès → hydrater l'utilisateur en mémoire / store.
3. Échec → état « non connecté », pas de crash.
4. Afficher un loader pendant la résolution (`isBootstrapping` / `isLoading`).

### Login

1. Formulaire → `POST login` avec identifiants (email/username + password).
2. Backend valide, hash compare, émet session ou JWT.
3. Réponse JSON avec utilisateur **sans** mot de passe ni secrets.
4. Client met à jour le store ; redirection vers zone protégée.

### Register

1. `POST register` avec champs validés (DTO / schema).
2. Unicité email/username (DB constraint + check applicatif).
3. Hash mot de passe côté serveur uniquement.
4. Auto-login ou redirection login — **suivre le comportement existant du projet**.

### Logout

1. Appel endpoint logout **ou** suppression token côté client (selon modèle).
2. Réinitialiser store, cache (React Query, SWR, etc.).
3. Gérer réponses non-JSON (redirect HTML, `204` vide).

---

## Règles transverses

### Mot de passe

- Hash **uniquement** côté serveur (bcrypt, argon2, etc.).
- Règles de complexité : une seule source de vérité (backend) ; UI alignée.
- Vérifier fuite (`NotCompromisedPassword`, Have I Been Pwned) si disponible.
- Désactiver contraintes lourdes en env test si documenté.

### Sérialisation utilisateur

Exposer uniquement les champs publics :

```
id, email, name / firstname / lastname, avatar, roles (si pertinent)
```

Jamais : `password`, hash, tokens internes, clés API.

### Ajouter un endpoint protégé

1. Route couverte par la règle d'accès existante (middleware, `access_control`, guard).
2. Récupérer l'utilisateur courant (`#[CurrentUser]`, `req.user`, `@AuthenticationPrincipal`, etc.).
3. Retourner `401` si absent ; `403` si rôle ou permission insuffisante.
4. **Filtrer les données** par propriétaire / tenant — ne pas se fier au seul rôle générique.

### Ajouter une route UI protégée

1. Envelopper avec le guard / composant protégé du projet.
2. S'appuyer sur le hook/store auth — **ne pas dupliquer** la logique dans chaque page.
3. Respecter le stockage credentials du projet (cookie vs localStorage vs memory).

### Appels HTTP client

| Modèle | Configuration |
|--------|---------------|
| Session cookie | `credentials: 'include'` (fetch) ou `withCredentials: true` (axios) |
| JWT | Header `Authorization: Bearer <token>` via interceptor |
| Refresh | Interceptor 401 → refresh → retry ou logout |

Toujours passer par le **client HTTP centralisé** du projet.

---

## Variables d'environnement (types)

| Variable (exemples) | Usage |
|---------------------|-------|
| `APP_SECRET` / `JWT_SECRET` | Signature session ou JWT |
| `JWT_EXPIRATION`, `REFRESH_EXPIRATION` | Durée de vie tokens |
| `CORS_ALLOW_ORIGIN` | Origines + credentials en prod |
| `DATABASE_URL` | Persistance utilisateurs |
| `VITE_*`, `NEXT_PUBLIC_*` | URL API, proxy dev |
| OAuth | `CLIENT_ID`, `CLIENT_SECRET`, redirect URIs |

Lister les variables **réelles** du projet après discovery.

---

## Pièges fréquents

| Problème | Détail |
|----------|--------|
| Mélange session + JWT | Choisir un modèle ; ne pas activer les deux sans raison |
| Token en localStorage | XSS expose le token — préférer httpOnly cookie si possible |
| Oublier `credentials: 'include'` | Session jamais envoyée en cross-origin |
| CORS sans credentials | `Access-Control-Allow-Credentials` + origine explicite (pas `*`) |
| Preflight OPTIONS | Routes OPTIONS en accès public si CORS + credentials |
| Logout non-JSON | Session invalidée serveur même si le client échoue au parse |
| Unicité email race condition | Contrainte UNIQUE en base + validation service |
| Login controller vide | Point d'ancrage firewall — logique dans la config sécurité |
| Isolation oubliée | `ROLE_USER` seul ne suffit pas — filtrer par owner/tenant |
| Refresh token non câblé | Méthode `refreshSession` présente mais jamais appelée |
| Prod cross-origin | Aligner CORS, `SameSite`, domaine cookie, URL API |

---

## Checklist modification auth

```
- [ ] Modèle auth du projet identifié (session | JWT | OAuth | autre)
- [ ] Route publique déclarée si exception à la règle par défaut
- [ ] Réponses API en JSON (pas redirect HTML) pour les clients SPA
- [ ] Credentials transportés correctement (cookie ou Bearer)
- [ ] Données métier filtrées par owner / tenant / rôle
- [ ] Validation côté serveur + messages d'erreur cohérents
- [ ] Pas de changement de stratégie auth sans décision explicite
- [ ] Secrets et hash jamais exposés ni loggés
- [ ] Tests : contraintes allégées ou mocks si env test
```

---

## Exemples par pattern

### Endpoint protégé avec isolation (backend générique)

```php
public function list(#[CurrentUser] ?User $user, ItemRepository $repo): JsonResponse
{
    if (null === $user) {
        return $this->json(['message' => 'Unauthenticated'], 401);
    }
    return $this->json(['items' => $repo->findAllForUser($user)]);
}
```

```typescript
// Express + middleware
app.get('/api/items', authenticate, async (req, res) => {
  const items = await repo.findAllForUser(req.user.id);
  res.json({ items });
});
```

### Client session (fetch)

```javascript
fetch('/api/auth/me', { credentials: 'include' });
```

### Client JWT (axios interceptor)

```javascript
api.interceptors.request.use((config) => {
  const token = authStore.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Route UI protégée (React)

```jsx
const { user, isAuthenticated, isBootstrapping } = useAuth();
if (isBootstrapping) return <Spinner />;
if (!isAuthenticated) return <Navigate to="/login" />;
```

---

## Fonctionnalités souvent absentes — ne pas supposer

Cocher ce qui **existe réellement** dans le projet avant de l'utiliser :

- [ ] JWT / OAuth / SSO
- [ ] Refresh token / rotation
- [ ] Reset password / vérification email
- [ ] 2FA / rate limiting login
- [ ] Rôles multiples (`ADMIN`, etc.)
- [ ] Auto-login après inscription
- [ ] Blacklist / révocation JWT

Pour en ajouter une, évaluer l'impact sur le modèle actuel et la migration des clients.

---

## Adapter ce skill à un projet concret

Lors de l'usage dans un repo spécifique, compléter une section locale (ou fichier `AUTH.md` / `.cursor/skills/authentication/reference.md`) avec :

1. Stack exacte (ex. Symfony 7 + React, Next.js App Router, NestJS + Vue).
2. Stratégie auth retenue et justification.
3. Tableau des endpoints réels avec chemins et réponses.
4. Liste des fichiers clés avec chemins absolus relatifs au repo.
5. Règles d'isolation métier (tenant, org, user).
6. Variables d'environnement du projet.
7. Pièges spécifiques observés.

Le corps de ce skill reste **stable et réutilisable** ; les détails projet vivent dans la section locale.
