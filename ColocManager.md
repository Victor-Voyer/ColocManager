# 🏠 ColocManager  
## Outil de gestion de colocation (Projet de fin d’année RNCP 5)

---

## 📌 1. Présentation du projet

**ColocManager** est une application web permettant aux colocataires de gérer facilement la vie en colocation : dépenses partagées, répartition des charges, planning des tâches ménagères, gestion des courses et communication interne.

L’objectif est de proposer une solution centralisée, simple et sécurisée pour éviter les conflits liés à l’organisation et aux finances.

---

## 🎯 2. Problématique

En colocation, les difficultés principales sont :

- Suivi des dépenses communes
- Répartition équitable des charges
- Organisation des tâches ménagères
- Manque de visibilité sur qui doit quoi
- Mauvaise communication

ColocManager répond à ces problématiques via une plateforme collaborative accessible en ligne.

---

## 👥 3. Cible utilisateur

- Étudiants en colocation
- Jeunes actifs partageant un logement
- Colocations longue durée
- Maisons partagées

---

## 🚀 4. Fonctionnalités principales

### 🔐 Authentification & gestion des utilisateurs
- Inscription / Connexion
- Authentification sécurisée (JWT)
- Gestion des rôles :
  - Admin de la colocation
  - Membre
- Invitation par lien ou email

---

### 💸 Gestion des dépenses

- Ajout d’une dépense (montant, catégorie, description)
- Attribution à un ou plusieurs colocataires
- Calcul automatique des parts
- Visualisation des soldes
- Historique des transactions

#### Logique de calcul des soldes :
- Répartition équitable par défaut
- Possibilité de pondération personnalisée

Exemple :
> Une dépense de 120€ partagée entre 3 colocataires = 40€ chacun

---

### 📊 Tableau de bord

- Vue globale des dettes/crédits
- Total des dépenses du mois
- Graphiques par catégorie
- Solde individuel

---

### 🧹 Planning des tâches ménagères

- Création de tâches
- Attribution à un membre
- Système de rotation automatique
- Marquage comme "terminé"
- Historique des tâches réalisées

---

### 🛒 Liste de courses collaborative

- Ajout d’articles
- Statut (à acheter / acheté)
- Attribution facultative
- Historique

---

### 💬 Messagerie interne (optionnel / bonus)

- Messages liés à la colocation
- Notifications en temps réel
- Système simple de discussion

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