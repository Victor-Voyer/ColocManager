# TODO — Mise en conformité ColocManager vs CDC v2 + MLD

> Généré à partir de l'audit du 2026-07-15 comparant le code actuel au `CahierDesCharges_ColocManager_V2.md` et au `MLD.md`.
> Sujet Docker explicitement exclu de cette liste.
> Chaque point est numéroté (#1 à #53, alignés sur le rapport d'audit) pour être validé et traité individuellement. Cocher une fois fait.

Légende :
- 🔴 **MANQUANT** — prévu par le CDC/MLD mais absent du code
- 🗑️ **À SUPPRIMER** — hors périmètre ou reliquat de l'ancienne version
- 🟡 **À ADAPTER** — présent mais incohérent avec le comportement attendu
- ✅ **CONFORME** — déjà bon, listé pour mémoire (pas d'action)

---

## 1. Modèle de données

- [ ] **#1** 🔴 Ajouter `role` (`ENUM('admin','member')`) et `colocation_id` (FK nullable) sur `users`. *(`backend/src/Entity/User.php`)*
- [ ] **#2** 🗑️ Supprimer l'entité/table pivot `colocation_user` une fois `role`/`colocation_id` portés sur `users`. *(`backend/src/Entity/ColocationUser.php`, `ColocationUserRepository.php`)*
- [x] **#3** 🗑️ Supprimer l'entité/table `invitation_tokens` (remplacée par `invitation_code` + `invitation_code_expires_at`). *(`backend/src/Entity/InvitationToken.php`, `InvitationTokenRepository.php`)* — ✅ fait 2026-07-15, migration `Version20260715122716`.
- [x] **#4** 🗑️ Supprimer les entités/tables `shopping_lists` et `shopping_items` + `ShoppingItemStatus`. *(`backend/src/Entity/ShoppingList.php`, `ShoppingItem.php`, `Enum/ShoppingItemStatus.php`)* — ✅ fait 2026-07-15, migration `Version20260715122318`.
- [x] **#5** 🗑️ Supprimer l'entité/table `task_rotation_members`. *(`backend/src/Entity/TaskRotationMember.php`, `TaskRotationMemberRepository.php`)* — ✅ fait 2026-07-15, migration `Version20260715123358`.
- [x] **#6** ✅ Table `messages` déjà supprimée — rien à faire.
- [ ] **#7** 🗑️ Supprimer la colonne `expenses.split_mode` + l'enum `SplitMode`. *(`backend/src/Entity/Expense.php:39-40`, `Enum/SplitMode.php`)*
- [x] **#8** 🗑️ Supprimer les colonnes `tasks.recurrence` et `tasks.rotation_index` + l'enum `TaskRecurrence`. *(`backend/src/Entity/Task.php:44-48`, `Enum/TaskRecurrence.php`)* — ✅ fait 2026-07-15.
- [ ] **#9** 🔴 Ajouter la colonne `tasks.created_by` (FK `users.id`, nullable, `SET NULL`). *(`backend/src/Entity/Task.php`)*
- [ ] **#10** 🔴 Ajouter la colonne `colocations.invitation_code_expires_at` (DATETIME, NOT NULL). *(`backend/src/Entity/Colocation.php`)*
- [x] **#11** 🟡 Retirer `expense_shares.percentage` (résidu du mode `weighted`). *(`backend/src/Entity/ExpenseShare.php:30-31`)* — ✅ fait 2026-07-15.
- [x] **#12** ✅ `expense_shares` (`amount_owed`, `is_paid`, `paid_at`, contrainte unique `(expense_id, user_id)`) conforme — rien à faire.
- [x] **#13** ✅ Structure de base `users`/`colocations`/`expenses`/`tasks` conforme — rien à faire.
- [x] **#14** 🟡 Ajouter `in_progress` à l'enum `TaskStatus` (actuellement seulement `pending`/`done`). *(`backend/src/Enum/TaskStatus.php`, `DTO/Task/CreateTaskDto.php`, `UpdateTaskDto.php`)* — ✅ fait 2026-07-15.

## 2. Périmètre fonctionnel

- [x] **#15** ✅ Authentification (inscription/connexion/déconnexion JWT cookie) conforme — rien à faire.
- [ ] **#16** 🟡 Bloquer explicitement l'appartenance à une deuxième colocation différente (actuellement seule la ré-adhésion à la même coloc est bloquée). *(`ColocationService::join()`)*
- [ ] **#17** 🟡 Revoir `UserService::delete()` pour ne bloquer que sur dette active (`is_paid = FALSE`), pas sur la simple existence d'un historique de dépenses/parts. *(`backend/src/Service/User/UserService.php:78-108`)*
- [x] **#18** 🗑️ Supprimer `ExpenseShareCalculator` et les modes `equal`/`weighted`/`custom` ; ne garder qu'une saisie manuelle membre par membre avec validation "somme = montant total". *(`backend/src/Service/Expense/ExpenseShareCalculator.php`, `ExpenseService.php`)* — ✅ fait 2026-07-15.
- [x] **#19** 🗑️ Supprimer toute la logique de rotation/récurrence des tâches (`replaceRotationMembers`, `assignedUserFromRotation`, `advanceRotation`, `createNextRecurringTask`). *(`backend/src/Service/Task/TaskService.php:122-260`)* — ✅ fait 2026-07-15 ; a aussi corrigé au passage le bug préexistant "Undefined array key 0" à la création d'une tâche sans assigné.
- [x] **#20** 🗑️ Retirer la page/route liste de courses du front (`/shopping`) et son entrée de navigation. *(`frontend/src/pages/ShoppingList/`, `App.jsx:68-72`, `Layout.jsx`)* — ✅ fait 2026-07-15.
- [x] **#21** 🟡 Supprimer l'endpoint `PUT /api/colocations/{colocationId}/expenses/{expenseId}` (règle 8 : dépense non modifiable, seulement POST/DELETE). *(`backend/src/Controller/ExpenseController.php:88-97`, `ExpenseService::update()`)* — ✅ fait 2026-07-15 (front : suppression du mode édition dans `ExpenseDetailModal`).
- [ ] **#22** 🔴 Créer un endpoint dédié "transférer le rôle admin" qui rétrograde l'ancien admin ET promeut le nouveau en une transaction (au lieu du `PATCH .../role` générique actuel qui peut créer deux admins). *(`ColocationController::updateMemberRole`, `ColocationService::updateMemberRole()`)*
- [ ] **#23** 🔴 Implémenter la suppression cascade de la colocation quand l'admin seul restant la quitte (règle 9). *(`ColocationService::leave()`)*
- [ ] **#24** 🔴 Créer un service centralisé de détection de dette active, appelé à la fois par `leave()`, `removeMember()` et `UserService::delete()` (règles 3 et 10). *(`ColocationService.php`, point de conception #4/#5 du MLD)*
- [x] **#25** ✅ Marquer/annuler une part comme remboursée conforme — rien à faire.
- [x] **#26** ✅ Créer/lister/filtrer les tâches conforme — rien à faire.

## 3. Règles métier transverses

- [ ] **#27** 🟡 Garantir un seul admin à la promotion (doublon de #22).
- [ ] **#28** 🔴 Étendre la protection "admin sans successeur" au flux "quitter le foyer", pas seulement à la suppression de compte (doublon de #23).
- [ ] **#29** 🔴 Implémenter le blocage sur dette active pour quitter/supprimer compte, basé sur `is_paid` (doublon de #17/#24).
- [x] **#30** 🗑️ Supprimer tout calcul automatique de répartition (doublon de #18). — ✅ fait 2026-07-15.
- [x] **#31** ✅ Validation "somme des parts = montant total" — conservée après suppression de `split_mode`, mais réécrite en arithmétique entière (centimes) au lieu de `bccomp`/`bcadd` : l'extension `bcmath` n'est pas installée dans l'image backend (voir note ci-dessous).
- [ ] **#32** ❓ À creuser : vérifier que `markShareAsPaid`/`markShareAsUnpaid` empêchent bien un membre de marquer la part de quelqu'un d'autre (`resolveShare` ne semble vérifier que l'appartenance à la coloc, pas l'identité du titulaire). *(`ExpenseService.php`)*
- [ ] **#33** 🔴 Vérifier l'expiration du code d'invitation (24h) dans `join()` une fois `invitation_code_expires_at` ajoutée (doublon de #10).
- [x] **#34** 🟡 Supprimer le `PUT` sur les dépenses (doublon de #21). — ✅ fait 2026-07-15.
- [ ] **#35** 🔴 Cascade de suppression de colocation si admin seul quitte (doublon de #23).
- [ ] **#36** 🔴 Bloquer l'exclusion d'un membre avec dette active par l'admin (doublon de #24).
- [ ] **#37** 🟡 Une fois `created_by` ajouté (#9), restreindre titre/description/assignation/suppression de tâche au créateur ou à l'admin, tout en laissant l'assigné changer le statut (règle 11).
- [ ] **#38** 🔴 Créer des Voters Symfony pour les permissions (rôle admin, couple créateur/assigné sur les tâches) — actuellement aucun `Voter` n'existe dans le repo, tout est fait via des `if` inline dans les services. *(`backend/src/Security/`, absence de dossier `Voter/`)*

## 4. Hors périmètre à retirer

- [x] **#39** 🗑️ Liste de courses collaborative (doublon de #4/#20). — ✅ fait 2026-07-15.
- [x] **#40** ✅ Messagerie déjà absente — rien à faire.
- [x] **#41** 🗑️ Rotation automatique des tâches (doublon de #5/#19). — ✅ fait 2026-07-15.
- [ ] **#42** 🟡 Garantir le mono-colocation (doublon de #16).
- [x] **#43** 🗑️ Répartition automatique équitable/pondérée (doublon de #18). — ✅ fait 2026-07-15.
- [x] **#44** ✅ Invitation par email déjà inactive côté controller — à supprimer avec #3.
- [ ] **#45** 🔴 Empêcher structurellement plusieurs admins simultanés (doublon de #22).

## 5. Contraintes `ON DELETE`

- [ ] **#46** 🟡 Changer `expenses.colocation_id` de `RESTRICT` à `CASCADE`. *(`backend/src/Entity/Expense.php:23`)*
- [ ] **#47** 🔴 Ajouter `onDelete: 'CASCADE'` sur `tasks.colocation_id`. *(`backend/src/Entity/Task.php:24-26`)*
- [x] **#48** ✅ `expenses.paid_by` en `RESTRICT` déjà conforme.
- [x] **#49** ✅ `expense_shares.expense_id` en `CASCADE` déjà conforme.
- [x] **#50** ✅ `expense_shares.user_id` en `RESTRICT` déjà conforme.
- [x] **#51** ✅ `tasks.assigned_to` en `SET NULL` déjà conforme.
- [ ] **#52** 🔴 Ajouter `onDelete: 'SET NULL'` sur `tasks.created_by` une fois la colonne créée (doublon de #9).
- [ ] **#53** ⏳ N/A tant que #1/#2 ne sont pas résolus — `users.colocation_id` sera à passer en `SET NULL` une fois créé.

---

## Bugs préexistants repérés pendant la vérification (non liés à l'audit)

- **Créer une tâche sans `assignedToUserId` ET sans `rotationMemberUserIds`** provoquait un 500 (`Undefined array key 0` dans `TaskService::assignedUserFromRotation()`). Repéré le 2026-07-15 pendant la vérification de l'étape 2. Résolu de fait par l'étape 3 (suppression complète de la logique de rotation) — aucune action séparée nécessaire. ✅ résolu.

- **Extension PHP `bcmath` absente de l'image backend** (`backend/Dockerfile` : `docker-php-ext-install pdo_mysql zip intl opcache`, pas de `bcmath`). Ça cassait silencieusement en 500 tout code utilisant `bcadd`/`bcsub`/`bcmul`/`bccomp` — notamment `GET /api/colocations/{id}/balances` (soldes, fonctionnalité HAUTE du CDC 4.3), qui n'a probablement jamais fonctionné dans cet environnement. Repéré le 2026-07-15 en testant la nouvelle validation de répartition manuelle (étape 4). **Contournement appliqué dans le code** (hors sujet Docker, donc pas de modification du Dockerfile) : `ExpenseService` utilise désormais de l'arithmétique entière en centimes (`toCents()`/`centsToAmount()`) au lieu de `bcmath`, pour la validation de répartition et pour `balances()`. Si tu préfères la solution "propre" (ajouter `bcmath` à `docker-php-ext-install`), dis-le et je fais le changement séparément — je n'ai pas touché au Dockerfile de moi-même vu la consigne initiale.

## Notes de suivi

- Beaucoup de points sont des doublons inter-sections du même problème racine (ex. #17/#24/#29/#36 = détection de dette centralisée ; #18/#30/#43 = suppression du calcul auto ; #22/#27/#45 = un seul admin). Les traiter une fois peut cocher plusieurs cases.
- Aucune action n'a été entreprise sur ces points — ce fichier sert de plan de travail à valider point par point.
