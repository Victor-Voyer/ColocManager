# MLD : ColocManager

> Modèle Logique de Données
> Tech stack : **Symfony (API REST)** · **React (SPA)** · **MySQL**

---

## Règles métier validées

Cette section fait office de compte rendu de cadrage. Chaque règle ci dessous a été validée explicitement, et c'est elle qui justifie les champs présents dans les tables plus bas.

1. **Un seul admin par colocation**, jamais plusieurs en même temps. C'est le créateur du foyer qui l'est par défaut.
2. **L'admin ne peut pas supprimer son compte ni quitter le foyer sans avoir désigné un nouvel admin au préalable**, tant qu'il reste d'autres membres dans la colocation.
3. **Un membre (admin ou non) ne peut pas quitter le foyer ni supprimer son compte s'il a une dette active**, que ce soit en tant que débiteur (il doit encore de l'argent à quelqu'un) ou en tant que créancier (quelqu'un lui doit encore de l'argent).
4. **La répartition d'une dépense est saisie manuellement par le créateur**, membre par membre, montant par montant, lui compris. Pas de calcul automatique équitable.
5. **La somme des montants saisis doit être égale au montant total de la dépense.** Chaque membre concerné, y compris le payeur, a une ligne explicite.
6. **Un membre peut signaler qu'il a remboursé sa part** sur une dépense donnée.
7. **Le code d'invitation est unique, rattaché à la colocation, régénérable par l'admin, et valable 24h.** Pas de limite au nombre de membres dans un foyer.
8. **Une dépense et sa répartition ne sont pas modifiables une fois créées.** Pour corriger, il faut supprimer la dépense et la recréer.
9. **Si l'admin est le dernier membre de la colocation** et souhaite la quitter ou supprimer son compte, ça supprime définitivement la colocation (pas de transfert possible puisqu'il n'y a personne à qui transférer).
10. **L'admin ne peut pas retirer un membre qui a une dette active**, même de force. La règle 3 s'applique aussi bien à un départ volontaire qu'à une exclusion par l'admin.
11. **La personne assignée à une tâche peut toujours changer son statut** (la marquer en cours ou terminée), même si elle n'en est pas la créatrice. La restriction "seul le créateur ou l'admin peut modifier une tâche" (voir tables `tasks`) s'applique au titre, à la description, à l'assignation et à la suppression, pas au changement de statut.

---

## Ce qui a changé par rapport à la version d'origine (avec Docker)

- **Suppression de `colocation_user`** : un user appartient à une seule colocation à la fois, une simple FK `colocation_id` sur `users` suffit. La gestion admin/membre passe par une colonne `role` sur `users`, pas par une table pivot.
- **Suppression de `invitation_tokens`** : remplacé par `invitation_code` + `invitation_code_expires_at` directement sur `colocations`, pas de flow d'invitation par email.
- **Suppression de `shopping_items`**, **`task_rotation_members`**, **`messages`** : hors périmètre du CDC actuel.
- **`expenses` / `expense_shares`** : plus de `split_mode` (`equal` / `weighted` / `custom`), la répartition est toujours saisie à la main par le créateur. `is_paid` / `paid_at` réintroduits sur `expense_shares` : indispensables pour appliquer la règle "on ne peut pas quitter le foyer avec une dette active".
- **`tasks`** : suppression de `recurrence` et `rotation_index`. `priority` conservée. `created_by` ajouté pour distinguer créateur et assigné (permission admin sur les tâches des autres).
- **`role` sur `users`** : admin/membre, simple colonne, avec règles de transfert obligatoire avant suppression de compte ou départ.
- **Retrait de Docker** de la stack technique.

---

## Tables

### 1. `users`

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT |
| `first_name` | VARCHAR(100) | NOT NULL |
| `last_name` | VARCHAR(100) | NOT NULL |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE |
| `password_hash` | VARCHAR(255) | NOT NULL |
| `colocation_id` | INT | FK → colocations.id, NULLABLE |
| `role` | ENUM('admin', 'member') | NOT NULL, DEFAULT 'member' |
| `created_at` | DATETIME | NOT NULL |
| `updated_at` | DATETIME | NOT NULL |

> `colocation_id` NULLABLE : un compte peut exister sans foyer (avant de créer/rejoindre, ou après en avoir quitté un).
> Le créateur d'un foyer reçoit `role = 'admin'` automatiquement, un membre qui rejoint via le code reçoit `role = 'member'`.
> Transfert d'admin : endpoint dédié qui fait passer l'ancien admin à `member` et le nouveau à `admin` en une transaction, dans la même colocation uniquement.

---

### 2. `colocations`

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT |
| `name` | VARCHAR(255) | NOT NULL |
| `invitation_code` | VARCHAR(64) | NOT NULL, UNIQUE |
| `invitation_code_expires_at` | DATETIME | NOT NULL |
| `created_at` | DATETIME | NOT NULL |
| `updated_at` | DATETIME | NOT NULL |

> `invitation_code_expires_at` = date de génération + 24h. Régénérer le code (par l'admin) met à jour les deux colonnes en même temps. `POST /api/colocations/join` doit vérifier que le code fourni correspond ET que `invitation_code_expires_at` n'est pas dépassée.

---

### 3. `expenses`

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT |
| `colocation_id` | INT | FK → colocations.id, NOT NULL |
| `paid_by` | INT | FK → users.id, NOT NULL |
| `amount` | DECIMAL(10,2) | NOT NULL |
| `description` | VARCHAR(500) | NOT NULL |
| `category` | VARCHAR(100) | NULLABLE |
| `expense_date` | DATE | NOT NULL |
| `created_at` | DATETIME | NOT NULL |
| `updated_at` | DATETIME | NOT NULL |

> Pas de colonne `split_mode` : la répartition est toujours saisie manuellement par le créateur via `expense_shares`, il n'y a qu'un seul mode de fonctionnement.

---

### 4. `expense_shares`

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT |
| `expense_id` | INT | FK → expenses.id, NOT NULL |
| `user_id` | INT | FK → users.id, NOT NULL |
| `amount_owed` | DECIMAL(10,2) | NOT NULL |
| `is_paid` | BOOLEAN | NOT NULL, DEFAULT FALSE |
| `paid_at` | DATETIME | NULLABLE |
| `created_at` | DATETIME | NOT NULL |

> **UNIQUE** : `(expense_id, user_id)`, un membre ne peut avoir qu'une seule part par dépense.
> Une ligne par membre concerné, **y compris le payeur**. La ligne du payeur (`user_id = expenses.paid_by`) est créée avec `is_paid = TRUE` automatiquement : il a déjà couvert sa propre part en payant la dépense en entier. Les autres lignes démarrent à `is_paid = FALSE`.
> **Validation back obligatoire à la création d'une dépense** : la somme de tous les `amount_owed` (payeur inclus) doit être strictement égale à `expenses.amount`.
> `POST /api/expenses/:id/shares/:shareId/mark-paid` : un membre marque sa propre part comme remboursée (`is_paid = TRUE`, `paid_at = now()`).

---

### 5. `tasks`

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT |
| `colocation_id` | INT | FK → colocations.id, NOT NULL |
| `created_by` | INT | FK → users.id, NULLABLE |
| `assigned_to` | INT | FK → users.id, NULLABLE |
| `title` | VARCHAR(255) | NOT NULL |
| `description` | TEXT | NULLABLE |
| `status` | ENUM('pending', 'in_progress', 'done') | NOT NULL, DEFAULT 'pending' |
| `priority` | ENUM('low', 'medium', 'high') | NOT NULL, DEFAULT 'medium' |
| `due_date` | DATE | NULLABLE |
| `created_at` | DATETIME | NOT NULL |
| `updated_at` | DATETIME | NOT NULL |

> `assigned_to` NULLABLE : une tâche peut exister sans être assignée.
> `created_by` sert à la permission : un membre normal ne peut modifier/supprimer que ses propres tâches, l'admin peut intervenir sur toutes les tâches de la colocation.

---

## Schéma des relations

```
colocations
   │
   ├── users (colocation_id, NULLABLE, avec role admin/member)
   │
   ├── expenses (colocation_id)
   │       │
   │       ├── paid_by ──── users
   │       │
   │       └── expense_shares (is_paid, paid_at)
   │               └── user_id ──── users
   │
   └── tasks (colocation_id)
           ├── created_by ──── users (NULLABLE)
           └── assigned_to ──── users (NULLABLE)
```

---

## Récapitulatif des cardinalités

| Relation | Type |
|---|---|
| `colocations` → `users` | **1-N** (NULLABLE côté user) |
| `colocations` → `expenses` | **1-N** |
| `users` → `expenses` (payeur) | **1-N** |
| `expenses` → `expense_shares` | **1-N** |
| `users` → `expense_shares` | **1-N** |
| `colocations` → `tasks` | **1-N** |
| `users` → `tasks` (créateur) | **1-N** (NULLABLE) |
| `users` → `tasks` (assigné) | **1-N** (NULLABLE) |

---

## Contraintes `ON DELETE` à définir

| Clé étrangère | Comportement recommandé | Raison |
|---|---|---|
| `users.colocation_id` | `SET NULL` | Le départ est déjà validé par la logique métier avant suppression (règles 2 et 3), un simple détachement suffit côté DB |
| `expenses.colocation_id` | `CASCADE` | Projet simple, pas de contrainte comptable forte à conserver après suppression du foyer |
| `expenses.paid_by` | `RESTRICT` | Un user ne peut pas supprimer son compte avec une dette active en tant que créancier (règle 3), ce cas ne devrait jamais se présenter. `RESTRICT` sert de garde fou côté DB |
| `expense_shares.expense_id` | `CASCADE` | Supprimer les parts quand la dépense est supprimée |
| `expense_shares.user_id` | `RESTRICT` | Même logique que `expenses.paid_by`, filet de sécurité si la validation applicative a un trou |
| `tasks.colocation_id` | `CASCADE` | Supprimer les tâches d'un foyer supprimé |
| `tasks.assigned_to` | `SET NULL` | Si un membre quitte ou supprime son compte, la tâche redevient non assignée |
| `tasks.created_by` | `SET NULL` | Le créateur peut disparaître, la tâche reste |

> Changement par rapport à la version précédente : `paid_by` et `expense_shares.user_id` repassent en `RESTRICT` au lieu de `CASCADE`. Avant, on cascadait pour que "Supprimer mon compte" marche toujours. Maintenant que la règle 3 interdit explicitement de supprimer son compte avec une dette active, `RESTRICT` devient cohérent : si la validation applicative a un trou, la DB refuse quand même de perdre l'historique.

---

## Points de conception à valider

1. **Un user, une seule colocation à la fois** : simplifie tout le modèle (FK simple, pas de pivot N-N).

2. **Permissions admin** : gérées côté Symfony via un Voter (`role === 'admin'`), pas de table de permissions séparée. Concerne : modifier le nom du foyer, retirer un membre (sauf s'il a une dette active, règle 10), régénérer le code, modifier/supprimer une tâche qui n'est pas la sienne.

3. **Permissions sur les tâches, en détail** : titre / description / assignation / suppression réservés au créateur ou à l'admin. Le changement de statut est ouvert en plus à la personne assignée (règle 11), même si elle n'a pas créé la tâche. Deux niveaux de check dans le Voter, pas juste un.

4. **Blocage suppression de compte / départ de foyer** : centraliser cette logique dans un seul service Symfony, appelé à la fois par `DELETE /api/account` et par l'endpoint "quitter le foyer", pour ne pas dupliquer les règles 2, 3 et 10 à plusieurs endroits. Ce service doit aussi gérer le cas admin seul dans la coloc (règle 9) : suppression en cascade de la colocation entière si c'est le dernier membre.

5. **Détection des dettes actives** : un user a une dette active s'il existe une ligne `expense_shares` avec `is_paid = FALSE` où soit `user_id = lui` (il doit), soit où il est `paid_by` de l'`expense` liée à une ligne `expense_shares` non payée d'un autre membre (on lui doit). Une requête avec jointure suffit, pas besoin de table supplémentaire. Cette même vérification sert pour bloquer un départ volontaire ET une exclusion par l'admin (règle 10).

6. **Arrondis** : la répartition étant saisie manuellement, ça retire le problème d'arrondi côté back, c'est au créateur de faire en sorte que la somme tombe juste (validation bloquante sinon).

7. **Pas d'endpoint `PUT` sur une dépense ou sa répartition** (règle 8) : seulement `POST` (créer) et `DELETE` (supprimer, ce qui cascade sur `expense_shares` même si certaines parts sont déjà marquées remboursées). Ça simplifie le back, pas de logique de recalcul à gérer sur une modification partielle.
