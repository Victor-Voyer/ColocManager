# PROMPT — Audit ColocManager vs CDC v2 + MLD

## Contexte

Tu travailles sur le repo ColocManager (Symfony API REST + React, MySQL/Doctrine).
Le cahier des charges a été revu en session de cadrage avec mon collègue. Deux fichiers de référence sont à la racine du repo (ou dans `docs/`) :

- `CahierDesCharges_ColocManager_V2.md`
- `MLD.md`

Ces deux fichiers reflètent ce qu'on veut **maintenant**. Le code actuel du repo peut contenir des fonctionnalités, des tables ou des champs qui datent d'une version antérieure du projet, avant qu'on réduise le périmètre.

## Exclusion explicite

**Ne touche pas au sujet Docker.** Ignore complètement tout ce qui concerne Docker dans le code (Dockerfile, docker-compose, scripts liés) : ne le signale pas, ne le commente pas, ne propose pas de le supprimer ni de l'ajouter, même si le CDC mentionne "sans Docker" ou "installation locale". C'est un sujet réglé en dehors de cet audit.

## Ta mission

**Audit uniquement. Aucune modification de code à cette étape.**

Compare le code actuel du repo à ce que décrivent le CDC et le MLD, section par section, et produis un rapport structuré des écarts. Ne fais aucun changement tant que je n'ai pas validé chaque point un par un.

## Méthode

Parcours le code (entités Doctrine, migrations, controllers, Voters, services, et côté front les composants/appels API) et confronte-le à :

1. **Modèle de données** (MLD.md, tables `users`, `colocations`, `expenses`, `expense_shares`, `tasks`) : compare champ par champ. Cherche en particulier des restes de l'ancienne version — tables ou colonnes que le MLD dit explicitement supprimées (`colocation_user`, `invitation_tokens`, `shopping_items`, `task_rotation_members`, `messages`, `split_mode`, `recurrence`, `rotation_index`).
2. **Périmètre fonctionnel** (CDC section 4, sous-sections 4.1 à 4.4) : pour chaque fonctionnalité listée, vérifie si elle existe dans le code, si elle est incomplète, ou si elle diverge du comportement décrit.
3. **Règles métier transverses** (CDC section 5 / MLD "Règles métier validées", les 11 règles) : vérifie que chaque règle est bien appliquée côté back (validation, Voter, service), pas juste supposée par le front.
4. **Hors périmètre** (CDC section 9) : signale toute fonctionnalité présente dans le code qui correspond à un point explicitement écarté (liste de courses, messagerie, rotation automatique des tâches, multi-colocation, répartition automatique, invitation par email, multi-admin).
5. **Contraintes ON DELETE** (MLD, tableau des FK) : vérifie que les comportements en base (CASCADE / RESTRICT / SET NULL) correspondent à ce qui est recommandé.

## Format du rapport attendu

Pour chaque écart trouvé, classe-le dans une de ces catégories et donne la référence de fichier/ligne :

- **MANQUANT** — prévu par le CDC/MLD mais absent du code
- **À SUPPRIMER** — présent dans le code mais hors périmètre ou explicitement abandonné (ancienne version)
- **À ADAPTER** — présent mais incohérent avec le comportement attendu (logique différente, contrainte manquante, permission mal posée)
- **CONFORME** — pour les points clés, précise rapidement ce qui est déjà bon (pas besoin d'être exhaustif ici, juste histoire d'avoir une vue d'ensemble)

Numérote chaque point du rapport (ex: #1, #2...) pour que je puisse valider individuellement. N'entreprends aucune action sur un point tant que je n'ai pas répondu "go" ou équivalent pour ce numéro précis.

## Ce que je veux à la fin de ta première passe

Uniquement le rapport, rien d'autre. Pas de code modifié, pas de fichier créé, pas de migration générée. On traite les points un par un après.
