# Mise en conformité ColocManager — état d'avancement

> Suite directe de l'audit dans `AUDIT-TODO.md`. Ce fichier sert de point de reprise : où j'en suis, ce qui a été vérifié, ce qu'il reste à faire, et comment relancer l'environnement de test.
> Dernière mise à jour : 2026-07-15.

---

## Méthode suivie

Travail découpé en 7 étapes séquentielles (voir liste plus bas). Pour chaque étape : modification du code, génération d'une migration Doctrine, exécution de la migration, puis **vérification réelle** (pas juste "ça compile") : `doctrine:schema:validate`, appels API via `curl` sur les endpoints touchés, vérification que le frontend recompile sans erreur (logs Vite/HMR).

Aucune modification du sujet Docker (Dockerfile, docker-compose.yml, scripts d'entrypoint) — conformément à la consigne initiale de l'audit. Docker est seulement **utilisé comme outil d'exécution** (voir section environnement ci-dessous), jamais modifié.

---

## Environnement de test (comment reprendre)

Le PHP local (8.3, sans `ext-sodium`) ne satisfait pas `composer.lock` (exige PHP 8.4). Le stack tourne donc via `docker-compose` (utilisé uniquement comme outil, accord explicite de l'utilisateur) :

```bash
docker compose up -d          # démarre db, backend, frontend, nginx, phpmyadmin
```

- Backend API (via nginx) : `http://localhost:8088/api/...`
- Frontend (Vite dev server) : `http://localhost:5173/`
- MySQL : `127.0.0.1:3307` (user `coloc` / `coloc`, db `colocmanager`)
- phpMyAdmin : `http://localhost:8081/`

Commandes utiles dans le container backend :
```bash
docker compose exec -T backend php bin/console cache:clear
docker compose exec -T backend php bin/console doctrine:migrations:diff --formatted
docker compose exec -T backend php bin/console doctrine:migrations:migrate --no-interaction
docker compose exec -T backend php bin/console doctrine:schema:validate
```

**Données de test actuellement en base** (créées pendant la vérification, à ignorer ou nettoyer librement — ce sont des données de dev) :
- User id 4 : `step1test@example.com` / `password123` (admin de la colocation id 2)
- User id 5 : `step4test@example.com` / `password123` (member de la colocation id 2)
- Colocation id 2 : "Test Coloc Step1"
- Quelques tasks et expenses de test associées

---

## Étapes terminées et vérifiées ✅

### #1 — Suppression liste de courses (`shopping_lists`/`shopping_items`)
- Entités `ShoppingList`, `ShoppingItem`, enum `ShoppingItemStatus`, repos associés supprimés.
- Collections retirées de `User.php` et `Colocation.php`.
- Frontend : page `/shopping`, route, entrée nav (`Layout.jsx`), carte marketing (`Homepage.jsx`), item mock (`Dashboard.jsx`) supprimés.
- Migration `Version20260715122318` (DROP TABLE shopping_items, shopping_lists).
- Vérifié : schema validate OK, register/me/create-colocation via curl OK, frontend recompile propre.

### #2 — Suppression `invitation_tokens` (code mort)
- Entité `InvitationToken` + repo supprimés (n'étaient référencés par aucun controller/service).
- Collections retirées de `User.php` et `Colocation.php`.
- Migration `Version20260715122716` (DROP TABLE invitation_tokens).
- Vérifié : schema validate OK, login/me/create-expense/create-task via curl OK.
- **Bug préexistant découvert** (non lié à cette étape) : créer une tâche sans `assignedToUserId` ni `rotationMemberUserIds` provoquait un 500 (`Undefined array key 0`). Résolu de fait par l'étape #3.

### #3 — Suppression rotation/récurrence des tâches
- Entité `TaskRotationMember` + repo supprimés. Enum `TaskRecurrence` supprimé.
- `Task.php` : colonnes `recurrence`, `rotationIndex`, collection `rotationMembers` retirées.
- `TaskService.php` : toute la logique de rotation/récurrence supprimée (`replaceRotationMembers`, `assignedUserFromRotation`, `advanceRotation`, `createNextRecurringTask`, `nextDueDate`, `assertNoRecurringConflict`). `fillTask()` et `complete()` simplifiés.
- `TaskRepository.php` : `countActiveRecurringByAssigneeAndPriority()` supprimée, join `rotationMembers` retiré de `findByColocationFiltered()`.
- `TaskSerializer.php` réécrit sans `recurrence`/`rotationIndex`/`rotationMembers`.
- `TaskStatus` enum : ajout du cas `InProgress = 'in_progress'` (le CDC/MLD prévoit pending/in_progress/done, le code n'avait que pending/done).
- DTOs `CreateTaskDto`/`UpdateTaskDto` : suppression `recurrence`/`rotationMemberUserIds`, choix status élargi à `in_progress`.
- Frontend : `TaskForm.jsx` (formulaire simplifié, plus de sélection récurrence/rotation), `TaskDetailModal.jsx`, `TasksTable.jsx`, `Tasks.jsx`, `taskUtils.js` (retrait `TASK_RECURRENCE_OPTIONS`/`getTaskRecurrence`, ajout `in_progress` aux options/labels de statut). Badge CSS `.badge--info` ajouté (`pages/shared/Pages.css`) pour le statut in_progress.
- Migration `Version20260715123358` (DROP TABLE task_rotation_members, ALTER TABLE tasks DROP recurrence, rotation_index).
- Vérifié : schema validate OK, création de tâche **sans assigné** (cas qui plantait avant) → 201 OK, création avec statut `in_progress` → OK, `PATCH .../complete` → OK, frontend recompile propre.

### #4 — Suppression `split_mode` / calcul automatique des dépenses
- Enum `SplitMode` et service `ExpenseShareCalculator` (modes equal/weighted/custom) supprimés entièrement.
- `Expense.php` : colonne `splitMode` retirée. `ExpenseShare.php` : colonne `percentage` retirée (résidu du mode weighted).
- `CreateExpenseDto` : suppression `splitMode`/`participantUserIds`, `shares[]` devient obligatoire (`Assert\Count(min: 1)`) avec **ajout d'un docblock `@var ExpenseShareInputDto[]`** (bug corrigé, voir plus bas).
- `UpdateExpenseDto` supprimé entièrement (plus de PUT, règle 8).
- `ExpenseService.php` réécrit : `create()` valide directement la répartition saisie manuellement (`assertShares()` : chaque userId doit être membre, une seule part par membre, le payeur doit avoir une ligne explicite, somme = montant total). Le payeur est marqué `isPaid=true` automatiquement à la création, les autres démarrent à `false`. Méthode `update()` et endpoint `PUT` supprimés (`ExpenseController.php`).
- `ExpenseSerializer.php` : `splitMode` et `percentage` retirés de la sérialisation.
- Frontend : `ExpenseForm.jsx` réécrit — saisie manuelle par membre (checkbox + champ montant), total affiché en temps réel avec validation visuelle (`ok`/`mismatch`), bouton submit désactivé tant que la somme ne correspond pas. `ExpenseDetailModal.jsx` : mode édition entièrement supprimé (plus de bouton "Modifier", conforme à la règle 8 — seuls create/delete existent). `expenseApi.js` : `updateExpense()` supprimée.
- Migration `Version20260715124013` (ALTER TABLE expense_shares DROP percentage, ALTER TABLE expenses DROP split_mode).

**Deux bugs préexistants découverts et corrigés pendant la vérification de cette étape (non liés à l'audit CDC/MLD lui-même) :**

1. **`CreateExpenseDto::$shares` non typé pour la désérialisation** — Symfony hydratait les éléments du tableau `shares[]` en tableaux associatifs bruts plutôt qu'en objets `ExpenseShareInputDto`, provoquant un 500 (`Attempt to read property "userId" on array`) dès qu'on envoyait des parts. **Corrigé** : ajout du docblock `@var ExpenseShareInputDto[]` sur la propriété.

2. **Extension PHP `bcmath` absente de l'image backend** (`backend/Dockerfile` installe `pdo_mysql zip intl opcache`, pas `bcmath`). Ça cassait silencieusement en 500 tout code utilisant `bcadd`/`bcsub`/`bccomp` — notamment `GET /api/colocations/{id}/balances` (soldes, fonctionnalité **HAUTE** priorité du CDC §4.3), qui n'a probablement **jamais fonctionné** dans cet environnement. **Contourné dans le code** (pas de modification du Dockerfile, sujet Docker exclu) : `ExpenseService` utilise désormais de l'arithmétique entière en centimes (`toCents()`/`centsToAmount()`) au lieu de `bcmath`, pour la validation de répartition ET pour `balances()`.
   - ⚠️ **Décision en attente** : si tu préfères la solution "propre" (ajouter `bcmath` à `docker-php-ext-install` dans `backend/Dockerfile`), il faudra le faire explicitement — je n'ai pas touché au Dockerfile de moi-même vu la consigne initiale sur Docker.

- Vérifié : schema validate OK, création dépense avec répartition manuelle valide → 201 (payeur auto `isPaid=true`), montant mismatch → 400 rejeté, payeur absent des parts → 400 rejeté, `PUT` sur une dépense → 405 (route disparue), `balances` → 200 avec des chiffres cohérents (testé avec 2 membres, soldes symétriques +8.00/-8.00), mark-paid/unpaid → OK, frontend recompile propre.

---

## Étapes restantes (non commencées)

### #5 — Fusionner `colocation_user` → `role`/`colocation_id` sur `users` (LA PLUS RISQUÉE)
- Ajouter `role ENUM('admin','member')` et `colocation_id INT NULLABLE FK` sur `users`.
- Migrer les données existantes de `colocation_user` vers ces colonnes (actuellement 2 lignes en dev, aucun user dans >1 colocation — migration de données triviale mais à faire proprement).
- Supprimer l'entité/table `colocation_user` et son repository.
- Réécrire `ColocationAccessChecker`, `ColocationService`, `ColocationSerializer`, `UserSerializer` pour utiliser `user.role`/`user.colocationId` au lieu de la table pivot.
- Ajouter `colocations.invitation_code_expires_at` (DATETIME NOT NULL) + vérification de l'expiration 24h dans `join()`.
- Impact large : quasiment tous les endpoints passent par `ColocationAccessChecker`. À faire avec beaucoup de tests curl après coup (register/login/create-coloc/join/leave/remove-member/expenses/tasks — tout le parcours).
- Attention : le modèle pivot actuel permet structurellement le multi-colocation (un user peut avoir plusieurs lignes `colocation_user`). Le nouveau modèle à `colocation_id` unique sur `users` l'empêche nativement — bon independamment de #16 (blocage explicite déjà prévu dans le code, mais deviendra inutile/remplacé par la contrainte structurelle).

### #6 — Règles métier manquantes (dette, admin, Voters)
- `tasks.created_by` (FK users, nullable, SET NULL) — actuellement absent, bloque la permission "créateur ou admin peut modifier/supprimer une tâche".
- Service centralisé de détection de dette active (`expense_shares.is_paid = FALSE`, débiteur ou créancier), appelé par `leave()`, `removeMember()` ET `UserService::delete()` (actuellement dupliqué/incohérent — voir #17/#24/#29/#36 de l'audit).
- Revoir `UserService::delete()` : bloque actuellement sur la simple existence d'un historique de dépenses, pas sur une dette active réelle — trop restrictif.
- Endpoint dédié "transférer le rôle admin" (transaction qui rétrograde l'ancien admin ET promeut le nouveau) — le `PATCH .../role` actuel permet de créer 2 admins simultanés (viole la règle 1).
- Cascade de suppression de la colocation quand l'admin seul restant la quitte (règle 9) — actuellement la coloc reste orpheline en base.
- Voters Symfony pour les permissions (rôle admin + couple créateur/assigné sur les tâches) — actuellement aucun Voter n'existe dans le repo, tout est fait via des `if` inline dans les services, et les permissions sur les tâches (créateur/admin peuvent modifier, assigné peut changer le statut) ne sont **pas implémentées du tout**.
- Point à creuser (#32) : vérifier que `markShareAsPaid`/`markShareAsUnpaid` empêchent bien un membre de marquer la part de quelqu'un d'autre.

### #7 — Corriger les contraintes `ON DELETE`
- `expenses.colocation_id` : actuellement `RESTRICT`, doit être `CASCADE`.
- `tasks.colocation_id` : actuellement pas de `onDelete` explicite (défaut RESTRICT/NO ACTION), doit être `CASCADE`.
- `tasks.created_by` : à définir en `SET NULL` une fois la colonne créée à l'étape #6.

---

## Décisions en attente côté utilisateur

1. **`bcmath`** : contournement en code appliqué (arithmétique en centimes). Dire si un ajout de l'extension au Dockerfile est souhaité en plus/à la place.
2. **Ordre de reprise** : je recommande de continuer dans l'ordre #5 → #6 → #7 vu les dépendances (les Voters de l'étape #6 ont besoin du modèle `role` sur `users` posé par #5 pour être cohérents).

## Pour reprendre

1. `docker compose up -d` si les containers ne tournent plus.
2. Relire ce fichier + `AUDIT-TODO.md` pour le détail des 53 points originaux.
3. Reprendre à l'étape #5, en suivant la même méthode (modif → migration → vérification réelle via curl + logs frontend).
