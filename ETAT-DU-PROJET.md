# ColocManager — État du projet

> Récapitulatif de l'avancement et checklist pour rendre le projet présentable et fonctionnel.  
> Dernière mise à jour : juin 2026

---

## 1. Présentation

**ColocManager** est une application web de gestion de colocation, projet de fin d'année **RNCP 5**. Elle vise à centraliser les **dépenses partagées**, les **tâches ménagères** et la **liste de courses**.

### Public cible

- Étudiants et jeunes actifs vivant en colocation
- Familles souhaitant mieux organiser leurs dépenses et tâches

### Objectifs fonctionnels

- Offrir une interface intuitive pour suivre les finances du foyer
- Faciliter la répartition équitable des tâches
- Centraliser l'organisation quotidienne du foyer

---

## 2. Architecture technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 19 + Vite, React Router, CSS custom, Lucide icons |
| Backend | Symfony 7.3, API REST, Doctrine ORM |
| Authentification | JWT via cookie httpOnly (Lexik JWT) |
| Base de données | MySQL 8 |
| Infra dev | Docker Compose (backend, nginx, frontend, MySQL, phpMyAdmin) |

### Services Docker

| Service | Rôle |
|---------|------|
| `backend` | API Symfony (PHP-FPM) |
| `nginx` | Reverse proxy API (port 8088) |
| `frontend` | Dev server Vite (port 5173) |
| `db` | MySQL 8 (port 3307) |
| `phpmyadmin` | Admin BDD (port 8081) |

### Tables principales (MLD)

- `users`, `colocations`, `colocation_user`
- `expenses`, `expense_shares`
- `tasks`, `task_rotation_members`
- `shopping_items`
- `invitation_tokens`

Documentation détaillée : [`MLD.md`](./MLD.md) · [`README.md`](./README.md) · [`Charte-graphique.md`](./Charte-graphique.md)

---

## 3. Avancement par module

### Légende

| Symbole | Signification |
|---------|---------------|
| ✅ | Fonctionnel et connecté |
| 🟡 | Partiellement implémenté ou mocké |
| 🔴 | Non implémenté |

| Module | Backend | Frontend | Statut global |
|--------|---------|----------|---------------|
| Base de données & modélisation | ✅ | — | ✅ |
| Authentification & utilisateurs | ✅ | ✅ | ✅ |
| Gestion des colocations | ✅ | 🔴 | 🟡 |
| Gestion des dépenses | ✅ | 🟡 | 🟡 |
| Tableau de bord | 🔴 | 🟡 (mock) | 🔴 |
| Planning des tâches | ✅ | ✅ | ✅ |
| Liste de courses | 🔴 | 🟡 (mock) | 🔴 |
| Sécurité | 🟡 | 🟡 | 🟡 |
| Tests & qualité | 🔴 | 🔴 | 🔴 |
| Docker (environnement dev) | 🟡 | 🟡 | 🟡 |
| Documentation | 🟡 | — | 🟡 |

> **Note :** le fichier [`TODO-Symphony.md`](./TODO-Symphony.md) indique tout en « à faire » — il est **obsolète** par rapport à l'état réel du code. Ce document fait foi.

---

## 4. Détail de ce qui est fait

### Backend — solide et structuré

Architecture propre : DTOs, services métier, `ColocationAccessChecker`, gestion centralisée des erreurs API.

#### Authentification

- `POST /api/register` — inscription
- `POST /api/login` — connexion (JWT en cookie httpOnly)
- `POST /api/logout` — déconnexion
- `GET /api/me` — profil utilisateur
- `PUT /api/me` — mise à jour du profil
- `DELETE /api/me` — suppression de compte

#### Colocations

- `POST /api/colocations` — créer (créateur = admin)
- `POST /api/colocations/join` — rejoindre via code d'invitation
- `GET /api/colocations/{id}` — détail
- `PUT /api/colocations/{id}` — modifier (admin)
- `DELETE /api/colocations/{id}` — supprimer (admin)
- `GET /api/colocations/{id}/members` — liste des membres
- `DELETE /api/colocations/{id}/members/{userId}` — exclure un membre (admin)
- `POST /api/colocations/{id}/leave` — quitter la colocation
- `PATCH /api/colocations/{id}/members/{userId}/role` — changer le rôle
- `POST /api/colocations/{id}/invitation-code/regenerate` — régénérer le code (admin)

#### Dépenses

- CRUD complet (`/api/colocations/{id}/expenses`)
- Historique (`/expenses/history`)
- Soldes par membre (`/balances`) — `balance = total payé − total dû`
- Marquer / démarquer une part remboursée (`pay` / `unpay`)
- 3 modes de répartition côté serveur : `equal`, `weighted`, `custom`
- Gestion des arrondis (centime restant attribué au payeur)

#### Tâches

- CRUD complet (`/api/colocations/{id}/tasks`)
- Filtres par statut et membre assigné
- Historique des tâches terminées
- `PATCH /api/tasks/{taskId}/complete` — complétion avec rotation automatique
- Règle anti-conflit : un membre ne peut pas avoir plusieurs tâches récurrentes actives de même priorité

### Frontend — pages connectées

| Route | État | Description |
|-------|------|-------------|
| `/` | ✅ | Landing page soignée, conforme à la charte graphique |
| `/login` | ✅ | Connexion connectée à l'API |
| `/register` | ✅ | Inscription connectée à l'API |
| `/dashboard` | 🟡 | UI complète mais **données fictives** (Alex, montants, activité…) |
| `/expenses` | ✅ | Liste, création, détail, édition, suppression, marquage remboursé |
| `/tasks` | ✅ | Liste filtrée, création, édition, complétion, historique, suppression |
| `/shopping` | 🟡 | UI statique avec articles en dur — **aucune API** |
| `/settings` | 🟡 | Thème clair/sombre fonctionnel ; profil et colocation en dur |

#### Composants réutilisables en place

- `Layout`, `ProtectedRoute`, `GuestRoute`
- `Modal`, `ConfirmDialog`
- `ExpenseForm`, `ExpenseDetailModal`, `ExpensesTable`
- `TaskForm`, `TaskDetailModal`, `TasksTable`
- `ThemeToggle`, `Logo`, `BurgerButton`

---

## 5. Ce qui est partiel ou mocké

### Dashboard (`/dashboard`)

- Stats, graphique de répartition et activité récente sont des **données hardcodées**
- Nom « Alex », montants et événements fictifs
- Boutons « Manage Flat » et « + Add Expense » non branchés
- Aucun endpoint `GET /api/colocations/{id}/dashboard` côté backend

### Liste de courses (`/shopping`)

- 3 articles statiques avec checkboxes non fonctionnelles
- Entités `ShoppingItem` et repositories existent en backend
- **Aucun controller ni service** pour l'API shopping

### Paramètres (`/settings`)

- Thème clair/sombre : ✅ fonctionnel
- Profil (nom, email) : valeurs en dur, bouton « Enregistrer » non connecté à `PUT /api/me`
- Colocation (nom, code) : valeurs en dur, pas de gestion des membres ni de quitter le foyer

### Onboarding colocation — point bloquant

- Après inscription, l'utilisateur arrive sur `/dashboard` **sans colocation**
- Les pages Dépenses et Tâches affichent « Rejoignez ou créez une colocation » mais **aucun flux UI** n'existe pour le faire
- Les boutons homepage « Créer ma colocation » / « Rejoindre un foyer » redirigent vers `/register` au lieu d'un vrai parcours
- `colocationApi.js` n'expose que `getMembers` — pas de `create`, `join`, etc.

### Dépenses — incomplet côté UI

- Le formulaire ne propose que la répartition **égale** (`splitMode: 'equal'`)
- Modes `weighted` et `custom` implémentés backend, absents du frontend
- API `/balances` existante, **aucune page ou section soldes** dans le frontend
- Algorithme de **simplification des dettes** (qui doit combien à qui) : **non implémenté**

### Tests & documentation

- Aucun test unitaire ou d'intégration (backend ou frontend)
- Pas de NelmioApiDoc / Swagger
- Pas de fixtures pour données de démo
- Pas de `.env.example`
- MCD visuel absent (seul le MLD textuel existe)

---

## 6. Checklist — rendre le projet présentable et fonctionnel

### Priorité 1 — Bloquant fonctionnel

- [ ] **Flux création / rejoindre une colocation**
  - [ ] Page ou modal « Créer un foyer » / « Rejoindre avec un code »
  - [ ] Étendre `colocationApi.js` (`create`, `join`, `show`, `update`, `leave`, etc.)
  - [ ] Rediriger vers l'onboarding si `user.colocations` est vide
  - [ ] Corriger les CTA homepage (ne plus pointer vers `/register` pour rejoindre)

- [ ] **Module liste de courses (complet)**
  - [ ] Backend : `ShoppingController` + service (CRUD, statut, archivage, historique)
  - [ ] Frontend : remplacer le mock de `ShoppingList.jsx` par l'intégration API
  - [ ] Séparation visuelle « À acheter » / « Acheté »
  - [ ] Bouton « Effacer les articles achetés »

- [ ] **Dashboard connecté aux vraies données**
  - [ ] Endpoint `GET /api/colocations/{id}/dashboard` ou agrégation frontend
  - [ ] Solde individuel, total dépenses du mois, tâches en attente
  - [ ] Activité récente (dernières dépenses, tâches complétées)
  - [ ] Remplacer toutes les données fictives par les données réelles

- [ ] **Page Paramètres fonctionnelle**
  - [ ] Édition profil via `PUT /api/me` (nom, email, mot de passe, avatar)
  - [ ] Affichage et copie du code d'invitation
  - [ ] Gestion colocation : modifier le nom, quitter le foyer
  - [ ] Gestion des membres pour les admins (liste, exclusion, changement de rôle)

### Priorité 2 — Cœur métier dépenses

- [ ] **Vue des soldes**
  - [ ] Page ou section « Qui doit combien à qui » branchée sur `GET /balances`
  - [ ] Algorithme de simplification des dettes (minimiser les transactions)

- [ ] **Modes de répartition avancés dans le formulaire dépenses**
  - [ ] UI pour `weighted` (pourcentages par membre, somme = 100 %)
  - [ ] UI pour `custom` (montants fixes par membre)

- [ ] **Filtres dépenses**
  - [ ] UI pour filtres date, catégorie, membre (API déjà prévue)

### Priorité 3 — Présentation et cohérence UX

- [ ] **Homogénéiser la langue**
  - [ ] Traduire les labels du layout (`Dashboard` → `Tableau de bord`, etc.)
  - [ ] Uniformiser FR/EN dans toute l'application

- [ ] **Parcours utilisateur complet de bout en bout**
  - [ ] Inscription → création coloc → ajout dépense → consultation soldes → tâche → courses
  - [ ] Jeu de données de démo (fixtures Symfony) pour la soutenance

- [ ] **Fichiers d'environnement et README d'installation**
  - [ ] `.env.example` backend et frontend
  - [ ] Instructions : `docker-compose up`, migrations, fixtures, commandes utiles

- [ ] **Mettre à jour `TODO-Symphony.md`**
  - [ ] Refléter l'avancement réel module par module

### Priorité 4 — Exigences RNCP / qualité

- [ ] **Tests backend**
  - [ ] Calcul des parts (`ExpenseShareCalculator`)
  - [ ] Soldes et arrondis
  - [ ] Rotation des tâches
  - [ ] Permissions colocation (accès refusé si non membre)
  - [ ] Tests d'intégration API (auth, CRUD dépenses, CRUD tâches)

- [ ] **Tests frontend**
  - [ ] Formulaire de connexion
  - [ ] Composants liste de dépenses et soldes
  - [ ] Configurer Vitest + React Testing Library

- [ ] **Documentation API**
  - [ ] Installer NelmioApiDocBundle
  - [ ] Annoter les endpoints
  - [ ] Exposer `/api/doc` en développement

- [ ] **MCD visuel**
  - [ ] Schéma exporté (image ou outil type dbdiagram.io)

- [ ] **Sécurité complémentaire**
  - [ ] Rate limiting sur login/register
  - [ ] Invitations par email (`InvitationToken` existe, logique à implémenter)

### Priorité 5 — Polish UI

- [ ] **Polish UI**
  - [ ] Toasts / feedback succès-erreur
  - [ ] Loaders ou skeletons pendant les chargements
  - [ ] Responsive mobile testé sur toutes les pages
  - [ ] Graphiques dashboard (Recharts ou Chart.js)

---

## 7. Synthèse visuelle

```
┌─────────────────────────────────────────────────────────────┐
│                        FAIT ✅                               │
│  Auth API+UI · Colocations API · Dépenses API+UI            │
│  Tâches API+UI · Docker dev · MLD · Charte graphique        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   PARTIEL / MOCK 🟡                          │
│  Dashboard · Settings · Shopping UI · Dépenses (split UI)  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      MANQUANT 🔴                             │
│  Onboarding coloc · Shopping API · Vue soldes · Tests       │
│  Doc API · Polish UI                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Estimation réaliste

### Pour une démo fonctionnelle en local (jury)

Se concentrer sur les **7 premiers blocs de la Priorité 1 et 2** :

1. Onboarding colocation
2. Liste de courses complète
3. Dashboard avec vraies données
4. Paramètres fonctionnels
5. Vue des soldes
6. Modes de répartition avancés (au minimum equal bien testé)
7. Fixtures + README d'installation

### Pour une soutenance RNCP complète

Ajouter en plus :

- Tests (backend + frontend)
- Documentation API (Swagger)
- MCD visuel
- Polish UI (feedback utilisateur, responsive, graphiques dashboard)

---

## 9. Structure du dépôt

```
ColocManager/
├── backend/          # API Symfony
│   ├── src/
│   │   ├── Controller/    # Auth, Colocation, Expense, Task, User
│   │   ├── Entity/        # Toutes les entités MLD
│   │   ├── Service/       # Logique métier
│   │   ├── DTO/           # Validation des entrées
│   │   └── Security/      # JWT cookies
│   └── migrations/
├── frontend/         # SPA React + Vite
│   └── src/
│       ├── pages/         # Homepage, Auth, Dashboard, Expenses, Tasks, Shopping, Settings
│       ├── components/    # UI réutilisable
│       ├── api/           # Client HTTP
│       ├── hooks/         # useExpenses, useTasks, useTheme
│       └── context/       # AuthContext
├── docker/           # Config nginx
├── docker-compose.yml
├── README.md
├── MLD.md
├── Charte-graphique.md
├── TODO-Symphony.md  # Checklist détaillée (à mettre à jour)
└── ETAT-DU-PROJET.md # Ce document
```

---

## 10. Compétences RNCP visées

| Compétence | Couverture actuelle |
|------------|---------------------|
| Analyse du besoin | ✅ README + MLD |
| Conception BDD | ✅ MLD détaillé, migrations |
| Architecture API REST | ✅ Backend structuré |
| Authentification sécurisée | ✅ JWT cookie httpOnly |
| Gestion des rôles | 🟡 Admin/membre backend, UI manquante |
| Interface utilisateur moderne | 🟡 Landing + modules principaux, mocks restants |
| Travail en équipe | — (équipe de 3 prévue) |
| Tests & qualité | 🔴 Aucun test |
| Environnement de développement | 🟡 Docker Compose fonctionnel en local |

---

## 11. Évolutions possibles *(hors scope)*

- Application mobile (React Native)
- Paiement intégré (Stripe)
- Notifications push (PWA)
- Export PDF des comptes mensuels
- Mode multi-colocations
- Statistiques avancées
- Système de pénalités
