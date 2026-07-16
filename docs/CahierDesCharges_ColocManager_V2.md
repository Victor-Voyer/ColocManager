# CAHIER DES CHARGES : ColocManager

> Application de gestion de colocation
> Version 2 : périmètre simplifié, validé en session de cadrage

---

## 1. Contexte et présentation du projet

ColocManager est une application web de gestion quotidienne de colocation. Le projet constitue le projet de fin d'année dans le cadre du diplôme RNCP Niveau 5 en Développement Web.

Cette version du cahier des charges remplace la précédente. Le périmètre a été volontairement réduit pour rester réalisable par deux développeurs juniors sur un temps limité, puis précisé au fil d'une session de cadrage sur le modèle de données. Les règles métier qui en résultent sont détaillées section 5.

L'application couvre deux axes fonctionnels : la gestion des dépenses partagées avec répartition et suivi des remboursements, et la gestion des tâches ménagères.

---

## 2. Objectifs du projet

- Fonctionnel : une interface simple pour suivre les finances et les tâches d'un foyer
- Technique : une API REST Symfony, un frontend React, environnement dockerisé
- Pédagogique : démontrer la maîtrise du cycle complet de développement (conception, sécurité, réalisation) dans le cadre du RNCP 5

---

## 3. Stack technique

- Backend : Symfony (API REST), authentification JWT (LexikJWTAuthenticationBundle)
- Frontend : React (SPA), consommation de l'API en JSON
- Base de données : MySQL, ORM Doctrine
- Environnement Docker : backend (PHP-FPM + Nginx), frontend et MySQL orchestrés via `docker-compose`, partagés entre les deux développeurs (plus un conteneur phpMyAdmin pour l'administration de la base)

> Détail complet du modèle de données : voir MLD.md.

---

## 4. Périmètre fonctionnel

### 4.1 Authentification & compte

| Fonctionnalité | Description | Priorité |
|---|---|---|
| Inscription | Création de compte par email et mot de passe, hashé (bcrypt via Symfony Password Hasher) | HAUTE |
| Connexion | Authentification par JWT renvoyé en cookie httpOnly, jamais stocké en localStorage | HAUTE |
| Déconnexion | Invalidation du cookie, redirection vers la page de connexion | HAUTE |
| Profil | Consultation et modification des informations de base (nom) | MOYENNE |
| Suppression de compte | Bloquée si l'utilisateur a une dette active, ou s'il est admin sans successeur désigné (voir 4.2 et section 5) | HAUTE |

### 4.2 Colocation (foyer) & rôles

| Fonctionnalité | Description | Priorité |
|---|---|---|
| Créer un foyer | Génère un nom et un code d'invitation unique. Le créateur devient automatiquement admin | HAUTE |
| Rejoindre un foyer | Saisie du code d'invitation, valable 24h après sa génération | HAUTE |
| Régénérer le code | Réservé à l'admin, met à jour le code et sa date d'expiration | MOYENNE |
| Liste des membres | Affichage des colocataires et de leur rôle (admin / membre) | MOYENNE |
| Transférer le rôle admin | L'admin désigne un autre membre comme nouvel admin. Un seul admin à la fois | HAUTE |
| Quitter le foyer | Bloqué en cas de dette active, ou si admin sans successeur désigné. Si l'admin est seul dans le foyer, quitter supprime la colocation. La suppression de la colocation qui en résulte est elle-même bloquée s'il reste des dépenses enregistrées dans le foyer | HAUTE |
| Retirer un membre | Réservé à l'admin. Bloqué si le membre visé a une dette active | MOYENNE |

### 4.3 Dépenses & remboursements

| Fonctionnalité | Description | Priorité |
|---|---|---|
| Ajouter une dépense | Montant, description, catégorie, date. Répartition saisie manuellement par le créateur, membre par membre, lui compris. La somme des parts doit être égale au montant total | HAUTE |
| Historique | Liste des dépenses du foyer, filtrable par catégorie | MOYENNE |
| Suppression | Une dépense n'est pas modifiable après création. Pour corriger une répartition, il faut supprimer et recréer | MOYENNE |
| Marquer une part comme remboursée | Chaque membre signale le remboursement de sa propre part | HAUTE |
| Soldes | Vue "qui doit combien à qui", calculée à la volée à partir des parts non remboursées | HAUTE |

### 4.4 Tâches ménagères

| Fonctionnalité | Description | Priorité |
|---|---|---|
| Créer une tâche | Titre, description, membre assigné, échéance, priorité | HAUTE |
| Liste des tâches | Affichage des tâches du foyer, filtrable par statut | MOYENNE |
| Modifier / assigner / supprimer | Réservé au créateur de la tâche ou à l'admin | MOYENNE |
| Changer le statut | Ouvert en plus à la personne assignée, même si elle n'est pas la créatrice de la tâche | HAUTE |

---

## 5. Règles métier transverses

Ces règles ont été validées en session de cadrage sur le modèle de données. Elles s'appliquent quel que soit le module concerné et priment sur toute autre interprétation du périmètre fonctionnel ci-dessus.

1. Un seul admin par colocation à la fois. Le créateur du foyer l'est par défaut.
2. Un admin ne peut pas supprimer son compte ni quitter le foyer sans avoir désigné un nouvel admin au préalable, tant qu'il reste d'autres membres dans la colocation.
3. Aucun membre, admin ou non, ne peut quitter le foyer ni supprimer son compte s'il a une dette active, en tant que débiteur (il doit de l'argent) ou en tant que créancier (on lui doit de l'argent).
4. La répartition d'une dépense est saisie manuellement par son créateur, montant par montant, membre par membre, lui compris. Aucun calcul de répartition automatique.
5. La somme des montants saisis pour une dépense doit être strictement égale au montant total de la dépense.
6. Un membre peut signaler qu'il a remboursé sa part sur une dépense donnée.
7. Le code d'invitation est unique, rattaché à la colocation, régénérable par l'admin, et valable 24 heures après sa génération. Aucune limite au nombre de membres d'un foyer.
8. Une dépense et sa répartition ne sont pas modifiables après création. Seules la création et la suppression sont possibles.
9. Si l'admin est le dernier membre de la colocation et souhaite la quitter ou supprimer son compte, la colocation est supprimée définitivement avec lui.
10. L'admin ne peut pas retirer un membre qui a une dette active, même de force.
11. La personne assignée à une tâche peut toujours changer son statut, même si elle n'en est pas la créatrice. Les autres actions sur une tâche (titre, description, assignation, suppression) restent réservées au créateur ou à l'admin.
12. Une colocation ne peut pas être supprimée tant qu'il reste des dépenses enregistrées dans son historique, y compris dans le cas où l'admin, dernier membre, quitte le foyer ou supprime son compte (règle 9).

---

## 6. Sécurité

- Hachage des mots de passe : bcrypt via Symfony Password Hasher
- Authentification : JWT en cookie httpOnly, jamais accessible en JavaScript côté front
- Validation des entrées : composant Validator de Symfony sur tous les endpoints, notamment la somme des parts d'une dépense
- Permissions : Voter Symfony, avec deux niveaux de vérification (rôle admin, et couple créateur / assigné pour les tâches)
- Protection SQL : ORM Doctrine, requêtes paramétrées
- HTTPS en production

---

## 7. Modèle de données (résumé)

| Table | Description |
|---|---|
| `users` | Comptes utilisateurs : identité, mot de passe hashé, colocation actuelle, rôle |
| `colocations` | Foyers : nom, code d'invitation, date d'expiration du code |
| `expenses` | Dépenses : montant, description, catégorie, payeur |
| `expense_shares` | Répartition d'une dépense par membre, avec statut de remboursement |
| `tasks` | Tâches ménagères : titre, statut, priorité, créateur, assigné |

> Schéma complet, contraintes de clés étrangères et justification de chaque champ : voir MLD.md.

---

## 8. Répartition du travail

Projet développé par deux développeurs sur quatre sprints. Chaque développeur porte une fonctionnalité de bout en bout, back et front, plutôt qu'une découpe horizontale back/front entre les deux.

- Dev A : Authentification (sprint 1) puis Profil et suppression de compte (sprint 2) puis Dépenses, y compris la saisie de répartition (sprint 3)
- Dev B : Foyer, invitation et rôles (sprint 1) puis Tâches (sprint 2) puis Remboursements : marquer payé, soldes, détection des dettes (sprint 3)
- Sprint 4, commun : intégration, tests croisés, corrections

> Détail tâche par tâche : voir le plan de sprint dans Notion.

---

## 9. Hors périmètre

Ces points ont été évoqués puis explicitement écartés pour garder le projet réalisable dans les temps :

- Liste de courses collaborative
- Messagerie entre colocataires
- Rotation automatique des tâches ménagères
- Un utilisateur membre de plusieurs colocations en même temps
- Répartition automatique (équitable ou pondérée) : la saisie reste manuelle
- Invitation ciblée par email : seul le code partagé est prévu
- Plusieurs admins simultanés sur une même colocation

---

## 10. Évolutions possibles (V2)

- Application mobile (React Native)
- Paiement intégré (remboursement direct via Stripe)
- Notifications push
- Export PDF des relevés de comptes
- Invitation ciblée par email en complément du code
- Rotation automatique des tâches récurrentes
