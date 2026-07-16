# TODO – ColocManager : ce qu'il reste à faire

> État constaté le 2026-07-16, en comparant le code actuel au [Cahier des charges V2](./CahierDesCharges_ColocManager_V2.md).
> Répartition basée sur le découpage de la section 8 (chacun porte une fonctionnalité de bout en bout, back + front).

---

## Constat général

Le backend est globalement bien avancé et couvre la plupart des règles métier de la section 5. Les deux gros manques :

1. **Le frontend est très en retard sur le backend** — plusieurs endpoints existent côté API mais n'ont aucune UI (foyer, profil, suppression de compte).
2. **Aucun Voter Symfony n'existe** dans le projet (`grep "extends Voter"` ne renvoie rien) — toutes les permissions sont vérifiées via des `if` à la main dans les services, alors que le cahier des charges (section 6) prévoit explicitement des Voters.

---

## Dev A — Authentification, Profil, Dépenses

- [ ] **Profil (frontend)** : la page Settings affiche des données en dur ("Alex Rivera" / "alex@example.com"). Remplacer par un vrai formulaire connecté à `GET/PUT /api/me`.
- [ ] **Suppression de compte (frontend)** : aucune UI n'existe pour `DELETE /api/me`. Ajouter le bouton, la confirmation, et l'affichage des erreurs métier (dette active / admin sans successeur désigné).
- [ ] **Dépenses — validation somme des parts** : actuellement la vérification "somme des parts = montant total" est une vérification PHP manuelle (`ExpenseService::assertShares`), pas une contrainte du composant Validator comme demandé section 6. À transformer en Constraint/Validator Symfony réutilisable.
- [ ] **Voter Dépenses** : créer `ExpenseVoter` (autorisation — distinct du JWT qui gère l'authentification) pour décider qui peut supprimer une dépense (créateur/payeur ou admin). Aujourd'hui `ExpenseService::delete()` ne vérifie que l'appartenance à la colocation (`resolveExpense` → `requireMembership`), donc n'importe quel membre peut supprimer la dépense de n'importe qui. À brancher via `denyAccessUnlessGranted()` dans le service ou `#[IsGranted]` sur le contrôleur.

## Dev B — Foyer, Tâches, Remboursements

- [ ] **Foyer (frontend) — à construire quasi entièrement** : le backend gère déjà créer/rejoindre/régénérer le code/lister les membres/transférer l'admin/quitter/retirer un membre, mais `colocationApi.js` n'expose que `getMembers()`. Il faut :
  - [ ] Page "créer un foyer"
  - [ ] Page "rejoindre un foyer" via code d'invitation
  - [ ] Affichage + régénération du code d'invitation (admin)
  - [ ] Liste des membres avec leur rôle
  - [ ] Transfert du rôle admin
  - [ ] Quitter le foyer (avec gestion des erreurs : dette active / admin sans successeur)
  - [ ] Retirer un membre (admin)
- [ ] **Remboursements — bug de permission** : `markShareAsPaid` / `markShareAsUnpaid` sont actuellement appelables par n'importe quel membre du foyer sur n'importe quelle part, alors que la section 4.3 précise que chaque membre ne signale que sa propre part. Restreindre l'action au propriétaire de la part.
- [ ] **Tâches — règle "l'assigné peut toujours changer le statut"** : non implémentée telle quelle. `update()` (qui inclut le statut) est réservé créateur/admin, et l'endpoint `complete()` est ouvert à tout membre du foyer (pas seulement l'assigné) et ne gère que le passage à "Terminé". Il faut un vrai chemin "changement de statut" ouvert au créateur, à l'admin, ET à l'assigné (règle 11 section 5).
- [ ] **Voters Foyer / Tâches** : créer `ColocationVoter` (rôle admin — ex: `updateMemberRole`, `removeMember` dans `ColocationService.php:247`) et `TaskVoter` (créateur ou admin — remplace la méthode privée `requireCreatorOrAdmin` de `TaskService.php:115`, dupliquée ailleurs sous une autre forme). Objectif : centraliser cette logique d'autorisation dans une seule classe par domaine au lieu de la retaper dans chaque service.

## Commun (à faire ensemble / sprint d'intégration)

- [ ] HTTPS en production (aucune config explicite trouvée actuellement).
- [ ] Tests croisés une fois les deux périmètres frontend terminés (sprint 4).
