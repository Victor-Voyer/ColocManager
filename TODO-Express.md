# ColocManager — Checklist de développement (version Express)

> Variante backend : **Express (API REST)** · **React (SPA)** · **MySQL** · **Docker**

---

## Avancement global

| Module | Statut |
|---|---|
| Base de données & Modélisation | 🔴 À faire |
| Authentification & Utilisateurs | 🔴 À faire |
| Gestion des colocations | 🔴 À faire |
| Gestion des dépenses | 🔴 À faire |
| Tableau de bord | 🔴 À faire |
| Planning des tâches ménagères | 🔴 À faire |
| Liste de courses collaborative | 🔴 À faire |
| Messagerie interne *(bonus)* | 🔴 À faire |
| Frontend (React) | 🔴 À faire |
| Sécurité | 🔴 À faire |
| Tests & Qualité | 🔴 À faire |
| Docker & Déploiement | 🔴 À faire |
| Documentation | 🔴 À faire |

---

## 1. Base de données & Modélisation

### Conception
- Réaliser le MCD (Modèle Conceptuel de Données)
- Réaliser le MLD (Modèle Logique de Données)
- Valider les relations entre les entités (1-N, N-N)
- Définir les contraintes d'intégrité (clés étrangères, NOT NULL, UNIQUE)

### Tables à créer (Sequelize)
- `users` — id, nom, prénom, email, password (hashé), rôle, created_at
- `colocations` — id, nom, code_invitation, created_at
- `colocation_user` *(table pivot)* — user_id, colocation_id, rôle (admin/membre), joined_at
- `expenses` — id, montant, description, catégorie, payé_par (user_id), colocation_id, date, created_at
- `expense_shares` — id, expense_id, user_id, montant_dû, payé (bool)
- `tasks` — id, titre, description, assigné_à (user_id), colocation_id, statut, due_date, completed_at
- `shopping_items` — id, nom, quantité, statut, assigné_à (user_id), colocation_id, created_at
- `messages` *(bonus)* — id, contenu, user_id, colocation_id, created_at

### Mise en place Express & Base de données
- Initialiser le projet Node (`npm init -y`)
- Installer les dépendances de base : `express`, `cors`, `helmet`, `morgan`, `dotenv`
- Choisir un ORM/query builder : **Sequelize**
- Configurer la connexion MySQL dans `.env` (host, port, user, password, database)
- Configurer l'ORM choisi (schémas, modèles, migrations)
- Générer et exécuter les migrations de base de données
- Créer des scripts `npm` pour lancer les migrations et les seeds
- Créer des jeux de données de test (seeds/fixtures)

---

## 2. Authentification & Utilisateurs

### Backend (Express)
- Créer le modèle `User` avec les champs nécessaires
- Installer les dépendances d'authentification : `bcrypt`, `jsonwebtoken`
- Mettre en place une structure de projet claire :
  - `src/app.ts` ou `src/server.ts`
  - `src/routes/`
  - `src/controllers/`
  - `src/services/` 
  - `src/middlewares/` 
  - `src/models/` 
- Créer un middleware d'authentification JWT (`authenticateToken`)
- Créer un middleware de gestion des rôles (`requireRole('ADMIN_COLOC')`, etc.)

#### Endpoints d'authentification
- Implémenter `POST /api/auth/register`
  - Validation des champs (email unique, mot de passe fort) — via `zod`
  - Hash du mot de passe avec `bcrypt`
  - Création de l'utilisateur en base
  - Retour d'un token JWT à la création
- Implémenter `POST /api/auth/login` (connexion)
  - Authentification par email/mot de passe
  - Vérification du hash
  - Retour d'un JWT valide + durée d'expiration
- Implémenter `POST /api/auth/logout` (optionnel côté backend, ou côté client uniquement)
- Implémenter `GET /api/auth/me` (profil de l'utilisateur connecté)
- Implémenter `PUT /api/auth/me` (mise à jour du profil)
- Implémenter `DELETE /api/auth/me` (suppression de compte)

#### Invitations & rôles
- Générer des tokens d'invitation signés ou aléatoires stockés en base
- Système d'invitation par **lien unique** (token + expiration)
- Système d'invitation par **email** (envoi via un service type `nodemailer`)
- Gestion des rôles : `ADMIN_COLOC` / `MEMBER`
- Middleware / helpers pour vérifier les permissions sur chaque ressource

### Frontend (React)
- Page d'inscription (`/register`)
- Page de connexion (`/login`)
- Stockage du JWT (localStorage ou cookie httpOnly via backend)
- Intercepteur Axios pour injecter le token dans les headers
- Gestion de l'expiration du token (redirection vers /login)
- Route protégée (`PrivateRoute`) pour les pages authentifiées
- Page de profil utilisateur (`/profile`)

---

## 3. Gestion des colocations

### Backend (Express)
- Implémenter `POST /api/colocations` (créer une colocation)
  - L'utilisateur créateur devient automatiquement Admin
  - Générer un code/lien d'invitation unique
- Implémenter `GET /api/colocations/:id` (détail d'une colocation)
- Implémenter `PUT /api/colocations/:id` (modifier nom, etc.)
- Implémenter `DELETE /api/colocations/:id` (suppression, Admin uniquement)
- Implémenter `POST /api/colocations/join` (rejoindre via code d'invitation)
- Implémenter `GET /api/colocations/:id/members` (liste des membres)
- Implémenter `DELETE /api/colocations/:id/members/:userId` (exclure un membre, Admin)
- Implémenter `POST /api/colocations/:id/leave` (quitter la colocation)
- Implémenter `PATCH /api/colocations/:id/members/:userId/role` (changer le rôle d'un membre)
- Endpoint pour regénérer le lien d'invitation (Admin)

### Frontend (React)
- Page de création de colocation
- Page pour rejoindre via code ou lien
- Page de gestion des membres (liste, exclusion, rôles)
- Affichage du code/lien d'invitation (avec bouton copier)

---

## 4. Gestion des dépenses

### Backend (Express)
- Implémenter `POST /api/colocations/:id/expenses` (ajouter une dépense)
  - Champs : montant, description, catégorie, date, payé_par
  - Sélection des membres concernés par la dépense
- Implémenter `GET /api/colocations/:id/expenses` (liste des dépenses)
  - Filtres : par date, catégorie, membre
  - Pagination
- Implémenter `GET /api/colocations/:id/expenses/:expenseId` (détail)
- Implémenter `PUT /api/colocations/:id/expenses/:expenseId` (modifier)
- Implémenter `DELETE /api/colocations/:id/expenses/:expenseId` (supprimer)
- **Calcul automatique des parts** :
  - Répartition équitable par défaut (montant / nombre de membres concernés)
  - Répartition pondérée personnalisée (pourcentages libres)
  - Répartition par participants (sélection personnelle)
- Implémenter `GET /api/colocations/:id/balances` (soldes de tous les membres)
  - Calcul : total payé - total dû pour chaque membre
  - Algorithme de simplification des dettes (qui doit combien à qui)
- Implémenter `PATCH /api/expenses/:id/shares/:userId/pay` (marquer une part comme remboursée)
- Implémenter `GET /api/colocations/:id/expenses/history` (historique complet)

### Logique métier — Calcul des soldes
- Calculer pour chaque membre : `solde = total_payé - total_dû`
- Implémenter l'algorithme de simplification des dettes (minimisation des transactions)
- Gérer les arrondis (max 2 décimales)

### Frontend (React)
- Formulaire d'ajout de dépense (avec sélection des membres et mode de répartition)
- Liste des dépenses avec filtres
- Vue détaillée d'une dépense (parts de chaque membre)
- Page des soldes (qui doit combien à qui)
- Bouton "Marquer comme remboursé"
- Historique des transactions)

---

## 5. Tableau de bord

### Backend (Express)
- Implémenter `GET /api/colocations/:id/dashboard` :
  - Solde individuel de l'utilisateur connecté
  - Total des dépenses du mois en cours
  - Répartition des dépenses par catégorie (pour graphique)
  - Résumé des dettes actives
  - Dernières dépenses ajoutées (5-10)
  - Tâches en attente assignées à l'utilisateur

### Frontend (React)
- Page tableau de bord (`/dashboard`)
- Carte "Mon solde" (positif = je suis remboursé, négatif = je dois)
- Carte "Total dépenses du mois"
- Graphique en donut/barres par catégorie (Chart.js ou Recharts)
- Liste "Dernières dépenses"
- Liste "Mes tâches en attente"
- Design responsive et lisible sur mobile

---

## 6. Planning des tâches ménagères

### Backend (Express)
- Implémenter `POST /api/colocations/:id/tasks` (créer une tâche)
  - Champs : titre, description, assigné_à, due_date, récurrence
- Implémenter `GET /api/colocations/:id/tasks` (liste des tâches)
  - Filtres : par statut, par membre assigné
- Implémenter `GET /api/colocations/:id/tasks/:taskId` (détail)
- Implémenter `PUT /api/colocations/:id/tasks/:taskId` (modifier)
- Implémenter `DELETE /api/colocations/:id/tasks/:taskId` (supprimer)
- Implémenter `PATCH /api/tasks/:taskId/complete` (marquer comme terminé)
- **Système de rotation automatique** :
  - Définir l'ordre des membres pour une tâche récurrente
  - Passer automatiquement à la personne suivante une fois terminé
  - Faire en sorte qu'un membre ne puisse pas avoir plusieurs tâches récurrentes importantes
- Implémenter `GET /api/colocations/:id/tasks/history` (historique des tâches terminées / limite à 10 ?)

### Frontend (React)
- Page planning des tâches (`/tasks`)
- Vue liste des tâches (par statut : à faire / terminé)
- Formulaire de création/modification de tâche
- Bouton "Marquer comme terminé"
- Affichage de la rotation (prochain assigné)
- Historique des tâches terminées

---

## 7. Liste de courses collaborative

### Backend (Express)
- Implémenter `POST /api/colocations/:id/shopping` (ajouter un article)
  - Champs : nom, quantité, unité, assigné_à (optionnel)
- Implémenter `GET /api/colocations/:id/shopping` (liste des articles)
  - Filtre par statut (à acheter / acheté)
- Implémenter `PUT /api/colocations/:id/shopping/:itemId` (modifier un article)
- Implémenter `DELETE /api/colocations/:id/shopping/:itemId` (supprimer)
- Implémenter `PATCH /api/shopping/:itemId/status` (basculer le statut)
- Implémenter `DELETE /api/colocations/:id/shopping/clear-purchased` (vider les articles achetés)
- Implémenter `GET /api/colocations/:id/shopping/history` (historique)

### Frontend (React)
- Page liste de courses (`/shopping`)
- Formulaire d'ajout rapide d'un article
- Séparation visuelle "À acheter" / "Acheté"
- Case à cocher pour basculer le statut
- Attribution optionnelle à un membre
- Bouton "Effacer les articles achetés"
- Historique des listes passées

---

## 8. Messagerie interne

### Backend (Express)
- Implémenter `GET /api/colocations/:id/messages` (historique des messages)
  - Pagination (du plus récent au plus ancien)
- Implémenter `POST /api/colocations/:id/messages` (envoyer un message)
- Implémenter `DELETE /api/messages/:messageId` (supprimer son propre message)
- Intégrer WebSocket pour les notifications en temps réel
  - Choisir une stack temps réel : `socket.io`, `ws` ou Server-Sent Events
  - Émettre un événement à chaque nouveau message
  - Gérer l'abonnement côté React

### Frontend (React)
- Page messagerie (`/messages`)
- Affichage de la conversation (bulles, avatar, horodatage)
- Formulaire d'envoi de message
- Mise à jour en temps réel (WebSocket / SSE)
- Notification visuelle (badge) en cas de nouveau message non lu)

---

## 9. Frontend (React)

### Setup & Configuration
- Initialiser le projet avec Vite (`npm create vite@latest`)
- Configurer React Router v6 (`react-router`)
- Installer et configurer Axios avec intercepteurs (token JWT)
- Mettre en place la gestion d'état globale (Context API ou Redux Toolkit)
- Configurer une librairie de composants UI (ex: Tailwind CSS, MUI, shadcn/ui)
- Configurer une librairie de graphiques (Chart.js, Recharts, etc.)
- Mettre en place les variables d'environnement (`.env`) pour l'URL de l'API Express
- Configurer ESLint + Prettier

### Architecture des composants
- `Layout` — Header, Navbar, Footer
- `PrivateRoute` — Redirection si non authentifié
- `LoadingSpinner` — Indicateur de chargement
- `ErrorMessage` — Affichage des erreurs API
- `Modal` — Fenêtre modale réutilisable
- `ConfirmDialog` — Confirmation avant suppression
- `Badge`, `Avatar`, `Card` — Composants génériques

### Pages
- `/` — Page d'accueil (landing page, présentation)
- `/login` — Connexion
- `/register` — Inscription
- `/dashboard` — Tableau de bord
- `/expenses` — Gestion des dépenses
- `/expenses/new` — Ajouter une dépense
- `/balances` — Soldes de la colocation
- `/tasks` — Planning des tâches
- `/shopping` — Liste de courses
- `/messages` — Messagerie
- `/colocation/settings` — Paramètres de la colocation
- `/profile` — Profil utilisateur

### Qualité Frontend
- Responsive design (mobile-first, breakpoints)
- Gestion des états de chargement (skeleton loaders ou spinners)
- Gestion des erreurs API (toast/alert en cas d'erreur)
- Validation des formulaires côté client (react-hook-form + zod/yup)
- Messages de feedback utilisateur (succès, erreur, confirmation)
- Favicon et meta tags (titre, description)

---

## 10. Sécurité

### Backend (Express)
- Hash des mots de passe avec `bcrypt`
- Validation de toutes les entrées utilisateur (Joi, Zod, express-validator…)
- Protection contre l'injection SQL via l'ORM (pas de requêtes brutes non sécurisées)
- Protection CSRF si besoin (surtout si cookies) — `csurf`
- Vérification que chaque utilisateur n'accède qu'aux ressources de **sa** colocation
- Système de permissions granulaire (Admin vs Membre pour chaque endpoint)
- Rate limiting sur les endpoints d'authentification (`express-rate-limit`)
- Expiration des tokens JWT (durée courte + éventuel refresh token)
- Expiration et invalidation des liens d'invitation
- Headers de sécurité HTTP (`helmet`, configuration CORS stricte)
- Logs des actions sensibles (connexions, suppressions, changements de rôle)

### Frontend
- Ne jamais stocker d'informations sensibles en clair dans localStorage
- Sanitiser les données affichées (protection XSS)
- Redirection automatique si token expiré
- Ne pas exposer l'URL de l'API dans le code client (variables d'environnement)

---

## 11. Tests & Qualité

### Backend (Express)
- Définir une stratégie de tests avec Jest, Vitest ou Mocha
- Tests unitaires des services métier (calcul des soldes, rotation des tâches)
- Tests d'intégration des endpoints API (Supertest)
  - Tests d'authentification (register, login, token invalide)
  - Tests CRUD dépenses
  - Tests CRUD tâches
  - Tests des permissions (accès refusé si non membre)
- Taux de couverture de code minimal fixé (ex: 70%)
- Lint backend avec ESLint (règles adaptées à Node/TypeScript si utilisé)

### Frontend (React)
- Tests unitaires des composants (Vitest + React Testing Library)
  - Test du formulaire de connexion
  - Test du composant de liste de dépenses
  - Test du calcul d'affichage des soldes
- Configurer ESLint + règles strictes

### Qualité générale
- Définir et respecter une **convention de commits** (Conventional Commits : `feat:`, `fix:`, `chore:`, etc.)
- Configurer un `.gitignore` complet
- Mettre en place une **pull request template** (si repo partagé)
- Documentation API avec **Swagger/OpenAPI**
  - Installer `swagger-ui-express` + spec OpenAPI (YAML/JSON)
  - Accès à `/api-docs` en développement

---

## 12. Docker & Déploiement

### Docker (développement)
- `Dockerfile` pour le backend Express (Node + nodemon)
- `Dockerfile` pour le frontend React (Node build + Nginx)
- `docker-compose.yml` avec les services :
  - `backend` (Express)
  - `frontend` (React)
  - `db` (MySQL)
  - `phpmyadmin`
  - `realtime` *(si messagerie WebSocket en conteneur séparé, optionnel)*
- Variables d'environnement via `.env` et `.env.docker`
- Volume persistant pour la base de données
- Vérifier que `docker-compose up` lance l'application complète

### Déploiement (production)
- Choisir et configurer un hébergement (VPS OVH, DigitalOcean, etc.)
- `docker-compose.prod.yml` avec configuration de production
  - Mode `NODE_ENV=production` pour Express
  - Build optimisé pour React (`npm run build`)
- Configurer le nom de domaine (DNS)
- Mettre en place **HTTPS** avec Let's Encrypt (Certbot ou Traefik)
- Configurer la base de données distante (ou conteneur avec backup)
- Mettre en place un pipeline CI/CD basique (GitHub Actions)
  - Lancement des tests à chaque push
  - Déploiement automatique sur la branche `main`
- Configurer les logs applicatifs en production
- Mettre en place une stratégie de backup de la base de données

---

## 13. Documentation

### README
- Description du projet
- Prérequis (Docker, Node, npm/pnpm, etc.)
- Instructions d'installation en développement :
  - Cloner le repo
  - Installer les dépendances backend (`npm install`)
  - Installer les dépendances frontend
  - Lancer `docker-compose up` (ou scripts équivalents)
- Commandes utiles (migrations, seeds, tests)
- Architecture du projet (arborescence des dossiers)
- Membres de l'équipe et répartition des rôles

### Documentation technique
- Swagger/OpenAPI accessible sur `/api-docs`
- Schéma de la base de données (MCD/MLD exporté en image)
- Explication de la logique de calcul des soldes et de simplification des dettes
- Explication du système de rotation des tâches
- Description des middlewares backend (auth, erreurs, logs)

### Guide de contribution
- Convention de nommage des branches (`feature/`, `fix/`, `chore/`)
- Convention de commits (Conventional Commits)
- Processus de revue de code (PR obligatoire, au moins 1 review)
- Checklist avant de merger une PR

---

## Évolutions possibles *(hors scope initial)*

- Application mobile (React Native)
- Paiement intégré (Stripe) pour rembourser directement
- Notifications push (PWA)
- Export PDF des comptes mensuels
- Mode multi-colocations (un utilisateur dans plusieurs colocations)
- Statistiques avancées (trends, comparaisons mensuelles)
- Système de pénalités (tâches non réalisées)
- Thème sombre (dark mode)
