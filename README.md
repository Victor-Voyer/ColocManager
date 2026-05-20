# 🏠 ColocManager  
## Outil de gestion de colocation (Projet de fin d’année RNCP 5)

---

## 📌 1. Présentation du projet

L’application vise à simplifier la gestion quotidienne d’une colocation en centralisant les informations essentielles comme les dépenses, les tâches ménagères et les événements communs.

---

## 🎯 2. Objectifs

- Offrir une interface intuitive pour suivre les finances du foyer.
- Faciliter la répartition équitable des tâches.
- Améliorer la communication entre colocataires.

---

## 👥 3. Public cible

- Étudiants et jeunes actifs vivant en colocation.
- Familles souhaitant mieux organiser leurs dépenses et tâches.

---

## 🚀 4. Périmètre fonctionnel

### 4.1 Authentification & gestion des comptes

- Création de compte (email/mot de passe).
- Connexion / Déconnexion.
- Profil utilisateur (nom, photo, préférences).

---

### 4.2 Gestion de la colocation (foyer)

- Créer ou rejoindre un foyer via un code unique.
- Liste des membres du foyer.
- Quitter un foyer.

---

### 4.3 Gestion des dépenses partagées

- Ajouter une dépense (montant, catégorie, payeur, bénéficiaires).
- Visualiser les soldes (qui doit combien à qui).
- Historique des transactions.

---

## 🧠 5. Architecture technique

### 🖥 Frontend
- React
- SPA (Single Page Application)
- Responsive design (mobile-first)

### ⚙ Backend
- Symfony
- API REST
- Validation des données
- Middleware d’authentification
- Gestion des permissions
- **Mercure** (`symfony/mercure-bundle`) pour le temps réel

### ⚡ Temps réel (Mercure)
- Hub Mercure pour pousser des événements du serveur vers le client (SSE)
- Publication d’événements depuis Symfony après chaque action (nouveau message, mise à jour de la liste de courses, etc.)
- Abonnement côté React via `EventSource`
- Topics privés par colocation, sécurisés par JWT Mercure

### 🗄 Base de données
- MySQL
- MCD / MLD

Tables principales :
- users
- colocations
- expenses
- expense_shares
- tasks
- shopping_items
- messages

---

## 🔐 6. Sécurité

- Hash des mots de passe
- Protection CSRF
- Validation des entrées
- Gestion des rôles et permissions
- Protection des routes API
- Sécurisation des requêtes SQL (ORM Doctrine)
- Tokens JWT Mercure pour restreindre l’accès aux topics de chaque colocation

---

## 🧪 7. Tests & Qualité

- Tests unitaires backend
- Tests d’intégration API
- Tests frontend
- Analyse des commits / stats
- Convention de commits
- Documentation API

---

## ☁ 8. Déploiement

- Dockerisation de l’application
- Services Docker : backend (Symfony), frontend (React), base de données (MySQL), **Mercure**
- Hébergement VPS ou plateforme cloud
- Base de données distante
- HTTPS

---

## 👨‍💻 9. Répartition du travail (équipe de 3)

### Développeur 1
- API Backend
- Base de données
- Authentification
- Sécurité

### Développeur 2
- Frontend
- UI/UX
- Intégration API

### Développeur 3
- Fonctionnalités avancées
- Tests
- Docker & Déploiement
- Documentation technique

---

## 📈 10. Évolutions possibles

- Application mobile (React Native)
- Paiement intégré (Stripe)
- Notifications push
- Statistiques avancées
- Export PDF des comptes
- Mode multi-colocations
- Système de pénalités

---

## 🎓 11. Compétences démontrées (RNCP 5)

- Analyse du besoin
- Conception base de données
- Architecture API REST
- Authentification sécurisée
- Communication temps réel (Mercure / SSE)
- Gestion des rôles
- Interface utilisateur moderne
- Travail en équipe
- Gestion de projet agile
- Mise en production

---

## 🏁 Conclusion

ColocManager est un projet complet et professionnalisant permettant de démontrer l’ensemble des compétences attendues pour un diplôme RNCP 5 en développement web.

Il combine :
- Logique métier complexe
- Sécurité
- Architecture propre
- Collaboration en équipe
- Déploiement réel