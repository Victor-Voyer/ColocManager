# MLD — ColocManager

> Modèle Logique de Données  
> Tech stack : **Symfony (API REST)** · **React (SPA)** · **MySQL** · **Docker**

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
| `avatar_url` | VARCHAR(255) | NULLABLE |
| `created_at` | DATETIME | NOT NULL |
| `updated_at` | DATETIME | NOT NULL |

> Le rôle d'un utilisateur est défini **par colocation** dans la table pivot `colocation_user`, pas globalement ici.

---

### 2. `colocations`

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT |
| `name` | VARCHAR(255) | NOT NULL |
| `invitation_code` | VARCHAR(64) | NOT NULL, UNIQUE |
| `created_at` | DATETIME | NOT NULL |
| `updated_at` | DATETIME | NOT NULL |

---

### 3. `colocation_user` *(pivot N-N)*

| Colonne | Type | Contraintes |
|---|---|---|
| `user_id` | INT | FK → users.id, NOT NULL |
| `colocation_id` | INT | FK → colocations.id, NOT NULL |
| `role` | ENUM('admin', 'member') | NOT NULL, DEFAULT 'member' |
| `joined_at` | DATETIME | NOT NULL |

> **PK composite** : `(user_id, colocation_id)`

---

### 4. `invitation_tokens`

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT |
| `colocation_id` | INT | FK → colocations.id, NOT NULL |
| `created_by` | INT | FK → users.id, NOT NULL |
| `token` | VARCHAR(255) | NOT NULL, UNIQUE |
| `email` | VARCHAR(255) | NULLABLE |
| `expires_at` | DATETIME | NOT NULL |
| `used_at` | DATETIME | NULLABLE |

> `email` est renseigné uniquement lors d'une invitation ciblée par email. `used_at` permet de savoir si le lien a déjà été utilisé.

---

### 5. `expenses`

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT |
| `colocation_id` | INT | FK → colocations.id, NOT NULL |
| `paid_by` | INT | FK → users.id, NOT NULL |
| `amount` | DECIMAL(10,2) | NOT NULL |
| `description` | VARCHAR(500) | NOT NULL |
| `category` | VARCHAR(100) | NULLABLE |
| `split_mode` | ENUM('equal', 'weighted', 'custom') | NOT NULL, DEFAULT 'equal' |
| `expense_date` | DATE | NOT NULL |
| `created_at` | DATETIME | NOT NULL |
| `updated_at` | DATETIME | NOT NULL |

#### Détail du `split_mode`

| Valeur | Comportement |
|---|---|
| `equal` | Montant divisé équitablement entre tous les membres concernés |
| `weighted` | Chaque membre a un pourcentage défini librement (somme = 100%) |
| `custom` | Montants fixes définis manuellement par membre ; seuls les membres concernés ont une ligne dans `expense_shares` |

---

### 6. `expense_shares`

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT |
| `expense_id` | INT | FK → expenses.id, NOT NULL |
| `user_id` | INT | FK → users.id, NOT NULL |
| `amount_owed` | DECIMAL(10,2) | NOT NULL |
| `percentage` | DECIMAL(5,2) | NULLABLE |
| `is_paid` | BOOLEAN | NOT NULL, DEFAULT FALSE |
| `paid_at` | DATETIME | NULLABLE |

> **UNIQUE** : `(expense_id, user_id)` — un membre ne peut avoir qu'une seule part par dépense.  
> `percentage` est renseigné uniquement si `split_mode = 'weighted'`, afin de conserver le % original pour l'affichage et la modification ultérieure.

---

### 7. `tasks`

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT |
| `colocation_id` | INT | FK → colocations.id, NOT NULL |
| `assigned_to` | INT | FK → users.id, NULLABLE |
| `title` | VARCHAR(255) | NOT NULL |
| `description` | TEXT | NULLABLE |
| `status` | ENUM('pending', 'in_progress', 'done') | NOT NULL, DEFAULT 'pending' |
| `priority` | ENUM('low', 'medium', 'high') | NOT NULL, DEFAULT 'medium' |
| `recurrence` | ENUM('none', 'daily', 'weekly', 'monthly') | NOT NULL, DEFAULT 'none' |
| `rotation_index` | INT | NOT NULL, DEFAULT 0 |
| `due_date` | DATE | NULLABLE |
| `completed_at` | DATETIME | NULLABLE |
| `created_at` | DATETIME | NOT NULL |
| `updated_at` | DATETIME | NOT NULL |

> `rotation_index` pointe vers la position actuelle dans `task_rotation_members`.  
> `priority` permet d'appliquer la règle : un membre ne peut pas se voir assigner plusieurs tâches récurrentes de même importance.  
> `assigned_to` est `NULLABLE` car la tâche peut être non assignée, ou gérée par rotation.

---

### 8. `task_rotation_members`

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT |
| `task_id` | INT | FK → tasks.id, NOT NULL |
| `user_id` | INT | FK → users.id, NOT NULL |
| `position` | INT | NOT NULL |

> **UNIQUE** : `(task_id, user_id)` — un membre n'apparaît qu'une fois par rotation.  
> **UNIQUE** : `(task_id, position)` — deux membres ne peuvent pas avoir la même position dans la rotation.

---

### 9. `shopping_items`

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT |
| `colocation_id` | INT | FK → colocations.id, NOT NULL |
| `created_by` | INT | FK → users.id, NOT NULL |
| `assigned_to` | INT | FK → users.id, NULLABLE |
| `name` | VARCHAR(255) | NOT NULL |
| `quantity` | DECIMAL(10,2) | NOT NULL, DEFAULT 1 |
| `unit` | VARCHAR(50) | NULLABLE |
| `status` | ENUM('to_buy', 'bought') | NOT NULL, DEFAULT 'to_buy' |
| `is_archived` | BOOLEAN | NOT NULL, DEFAULT FALSE |
| `created_at` | DATETIME | NOT NULL |
| `bought_at` | DATETIME | NULLABLE |

> `is_archived` permet de conserver les articles achetés dans un historique sans les supprimer (`GET /shopping/history`).  
> `DELETE /shopping/clear-purchased` passe simplement `is_archived = TRUE` sur les articles avec `status = 'bought'`.

---

### 10. `messages` *(bonus)*

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT |
| `colocation_id` | INT | FK → colocations.id, NOT NULL |
| `user_id` | INT | FK → users.id, NOT NULL |
| `content` | TEXT | NOT NULL |
| `created_at` | DATETIME | NOT NULL |
| `deleted_at` | DATETIME | NULLABLE |

> `deleted_at` gère la suppression en soft delete : un utilisateur peut effacer son message sans le supprimer physiquement de la base.

---

## Schéma des relations

```
users ──────────────────────────── colocation_user ──────────────── colocations
  │             (N-N via pivot)                                          │
  │                                                                      ├── invitation_tokens
  ├── expenses (paid_by) ──────────────────────────────────────────────┤
  │       │                                                              ├── expenses
  │       └── expense_shares ── users                                   │
  │                                                                      ├── tasks
  ├── tasks (assigned_to) ─────────────────────────────────────────────┤
  │       │                                                              ├── shopping_items
  │       └── task_rotation_members ── users                            │
  │                                                                      └── messages (bonus)
  ├── shopping_items (assigned_to / created_by)
  │
  └── messages (bonus)
```

---

## Récapitulatif des cardinalités

| Relation | Type |
|---|---|
| `users` ↔ `colocations` | **N-N** via `colocation_user` |
| `colocations` → `expenses` | **1-N** |
| `users` → `expenses` (payeur) | **1-N** |
| `expenses` → `expense_shares` | **1-N** |
| `users` → `expense_shares` | **1-N** |
| `colocations` → `tasks` | **1-N** |
| `users` → `tasks` (assigné) | **1-N** (NULLABLE) |
| `tasks` → `task_rotation_members` | **1-N** |
| `users` → `task_rotation_members` | **1-N** |
| `colocations` → `shopping_items` | **1-N** |
| `users` → `shopping_items` (créateur) | **1-N** |
| `users` → `shopping_items` (assigné) | **1-N** (NULLABLE) |
| `colocations` → `invitation_tokens` | **1-N** |
| `users` → `invitation_tokens` (créateur) | **1-N** |
| `colocations` → `messages` | **1-N** *(bonus)* |
| `users` → `messages` | **1-N** *(bonus)* |

---

## Contraintes `ON DELETE` à définir

| Clé étrangère | Comportement recommandé | Raison |
|---|---|---|
| `colocation_user.user_id` | `CASCADE` | Si un user est supprimé, retirer son appartenance aux colocations |
| `colocation_user.colocation_id` | `CASCADE` | Si une coloc est supprimée, supprimer toutes les appartenances |
| `expenses.colocation_id` | `RESTRICT` | Ne pas supprimer une coloc qui a des dépenses (intégrité comptable) |
| `expenses.paid_by` | `RESTRICT` | Conserver l'historique des paiements |
| `expense_shares.expense_id` | `CASCADE` | Supprimer les parts quand la dépense est supprimée |
| `expense_shares.user_id` | `RESTRICT` | Conserver l'historique des parts dues |
| `tasks.assigned_to` | `SET NULL` | Si un membre quitte, la tâche devient non assignée |
| `task_rotation_members.user_id` | `CASCADE` | Retirer le membre de toutes les rotations s'il est supprimé |
| `shopping_items.assigned_to` | `SET NULL` | Si un membre quitte, l'article devient non assigné |
| `messages.user_id` | `SET NULL` | Conserver les messages même si l'auteur est supprimé *(bonus)* |

---

## Points de conception à valider

1. **`task_rotation_members` vs colonne JSON** — La table dédiée est recommandée pour les requêtes Doctrine et les contraintes d'unicité. Une colonne JSON serait plus simple mais difficile à interroger et valider.

2. **`is_archived` dans `shopping_items`** — Alternative envisageable : une table `shopping_history` séparée. À choisir selon la volumétrie attendue et la simplicité souhaitée.

3. **Soft delete sur `messages`** — `deleted_at` permet à un utilisateur de supprimer son message tout en conservant une trace pour la modération. Peut être étendu à d'autres tables si besoin.

4. **`percentage` dans `expense_shares`** — Uniquement utile pour `split_mode = 'weighted'`. Permet d'afficher le % original dans l'UI et de recalculer proprement en cas de modification du montant total.

5. **Arrondis sur les montants** — Le TODO impose un maximum de 2 décimales. Gérer les écarts d'arrondi côté service Symfony (ex. : ajouter le centime restant à la part du payeur).
