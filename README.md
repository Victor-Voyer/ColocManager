# ColocManager

Application de gestion de colocation (projet RNCP 5) : dépenses partagées, tâches ménagères, gestion des membres.

## Fonctionnalités implémentées

- Authentification JWT (cookie httpOnly)
- Création / rejoindre une colocation via code d'invitation
- Gestion des membres (transfert admin, retrait, quitter)
- Dépenses partagées avec répartition manuelle ou automatique
- Validation des remboursements par le créateur de la dépense
- Soldes par membre
- Tâches ménagères avec permissions (créateur, assigné, admin)
- Tableau de bord connecté à l'API

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | React 19, Vite, React Router |
| Backend | Symfony 7.3, API REST |
| Base de données | MySQL 8 |
| Infra | Docker Compose |

## Démarrage

```bash
docker compose up --build
```

- Frontend : http://localhost:5173
- API : http://localhost:8088/api
- phpMyAdmin : http://localhost:8081

## Structure du code

```
backend/src/
  Controller/     # Points d'entrée API
  Service/        # Logique métier
  Security/Voter/ # Autorisations (Task, Expense, Colocation, ExpenseShare)
  DTO/            # Validation des entrées
  Entity/         # Modèle Doctrine

frontend/src/
  pages/          # Écrans
  components/     # UI réutilisable
  hooks/          # État métier (useTasks, useExpenses, useColocationMembers)
  api/            # Client HTTP
  utils/          # Helpers partagés (permissions, dates, membres)
```

## Sécurité

- Voters Symfony pour les actions sensibles
- Vérification d'appartenance à la colocation
- Blocage suppression compte / départ si dettes actives ou seul admin

## Évolutions prévues (hors périmètre actuel)

- Temps réel (Mercure)
- Messagerie / liste de courses
- Tests automatisés

## Équipe

Projet réalisé en équipe de 3 dans le cadre d'un diplôme RNCP 5.
