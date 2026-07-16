<?php

namespace App\Service\Colocation;

use App\DTO\Colocation\CreateColocationDto;
use App\DTO\Colocation\JoinColocationDto;
use App\DTO\Colocation\UpdateColocationDto;
use App\DTO\Colocation\UpdateMemberRoleDto;
use App\Entity\Colocation;
use App\Entity\User;
use App\Enum\ColocationRole;
use App\Exception\ApiException;
use App\Repository\ColocationRepository;
use App\Repository\ExpenseShareRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;

final class ColocationService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly ColocationAccessChecker $accessChecker,
        private readonly ColocationRepository $colocationRepository,
        private readonly ExpenseShareRepository $expenseShareRepository,
        private readonly UserRepository $userRepository,
        private readonly ColocationSerializer $serializer,
    ) {
    }

    public function create(User $user, CreateColocationDto $dto): array
    {
        if ($user->getColocation() !== null) {
            throw ApiException::conflict('Vous faites déjà partie d\'une colocation.');
        }

        $colocation = new Colocation();
        $colocation->setName($dto->name);
        $colocation->setInvitationCode($this->generateUniqueInvitationCode());
        $colocation->setInvitationCodeExpiresAt(new \DateTimeImmutable('+24 hours'));

        $user->setColocation($colocation);
        $user->setRole(ColocationRole::Admin);

        $this->entityManager->persist($colocation);
        $this->entityManager->flush();
        $this->entityManager->refresh($colocation);

        return $this->serializer->serialize($colocation, ColocationRole::Admin);
    }

    public function join(User $user, JoinColocationDto $dto): array
    {
        if ($user->getColocation() !== null) {
            throw ApiException::conflict('Vous faites déjà partie d\'une colocation.');
        }

        $colocation = $this->colocationRepository->findOneByInvitationCode($dto->invitationCode);
        if ($colocation === null) {
            throw ApiException::notFound('Code d\'invitation invalide.');
        }

        $expiresAt = $colocation->getInvitationCodeExpiresAt();
        if ($expiresAt !== null && $expiresAt < new \DateTimeImmutable()) {
            throw ApiException::conflict('Le code d\'invitation a expiré.');
        }

        $user->setColocation($colocation);
        $user->setRole(ColocationRole::Member);

        $this->entityManager->flush();
        $this->entityManager->refresh($colocation);

        return $this->serializer->serialize($colocation, ColocationRole::Member);
    }

    public function show(User $user, int $id): array
    {
        $context = $this->accessChecker->resolveContext($user, $id);

        return $this->serializer->serialize($context->colocation, $context->role);
    }

    public function update(User $user, int $id, UpdateColocationDto $dto): array
    {
        $context = $this->accessChecker->resolveContext($user, $id);
        $this->requireAdmin($context->role);

        $context->colocation->setName($dto->name);
        $this->entityManager->flush();

        return $this->serializer->serialize($context->colocation, $context->role);
    }

    public function delete(User $user, int $id): void
    {
        $context = $this->accessChecker->resolveContext($user, $id);
        $this->requireAdmin($context->role);

        $expensesCount = $this->colocationRepository->countExpenses($context->colocation);
        if ($expensesCount > 0) {
            throw ApiException::conflict(
                'Impossible de supprimer la colocation : des dépenses y sont enregistrées.',
                ['expensesCount' => $expensesCount],
            );
        }

        // Nettoyer role sur tous les membres avant suppression (ON DELETE SET NULL gère colocation_id)
        foreach ($context->colocation->getMembers() as $member) {
            $member->setRole(null);
        }

        $this->entityManager->remove($context->colocation);
        $this->entityManager->flush();
    }

    public function members(User $user, int $id): array
    {
        $context = $this->accessChecker->resolveContext($user, $id);

        return array_map(
            fn (User $member): array => $this->serializer->serializeMember($member),
            $context->colocation->getMembers()->toArray(),
        );
    }

    public function removeMember(User $user, int $id, int $userId): void
    {
        $context = $this->accessChecker->resolveContext($user, $id);
        $this->requireAdmin($context->role);

        if ($userId === $user->getId()) {
            throw new ApiException('Utilisez POST /leave pour quitter la colocation.');
        }

        $targetUser = $this->resolveColocationMember($context->colocation, $userId);

        if ($this->isSoleAdmin($targetUser, $context->colocation)) {
            throw ApiException::conflict('Impossible d\'exclure le seul administrateur. Transférez d\'abord le rôle admin.');
        }

        if ($this->expenseShareRepository->hasActiveDebt($targetUser)) {
            throw ApiException::conflict('Impossible d\'exclure ce membre : il a des dettes actives non réglées.');
        }

        $this->detachUserFromColocation($targetUser);
        $this->entityManager->flush();
    }

    public function leave(User $user, int $id): void
    {
        $context = $this->accessChecker->resolveContext($user, $id);
        $colocation = $context->colocation;

        if ($this->isSoleAdmin($user, $colocation)) {
            throw ApiException::conflict('Impossible de quitter : vous êtes le seul administrateur. Transférez d\'abord le rôle admin.');
        }

        if ($this->expenseShareRepository->hasActiveDebt($user)) {
            throw ApiException::conflict('Impossible de quitter la colocation : vous avez des dettes actives non réglées.');
        }

        // Évaluer le count AVANT de modifier l'entité (évite le problème de collection Doctrine stale)
        $remainingMembers = $colocation->getMembers()->count();

        $this->detachUserFromColocation($user);

        // Supprime la colocation si plus aucun membre ne reste après ce départ
        if ($remainingMembers <= 1) {
            $this->entityManager->remove($colocation);
        }

        $this->entityManager->flush();
    }

    public function updateMemberRole(User $user, int $id, int $userId, UpdateMemberRoleDto $dto): array
    {
        $context = $this->accessChecker->resolveContext($user, $id);
        $this->requireAdmin($context->role);

        $targetUser = $this->resolveColocationMember($context->colocation, $userId);
        $newRole = ColocationRole::from($dto->role);

        if ($newRole === ColocationRole::Member && $this->isSoleAdmin($targetUser, $context->colocation)) {
            throw ApiException::conflict('Impossible de rétrograder le seul administrateur. Promouvez d\'abord un autre membre.');
        }

        // Transfert admin : rétrograder tous les admins actuels avant de promouvoir la cible
        if ($newRole === ColocationRole::Admin) {
            foreach ($context->colocation->getMembers() as $member) {
                if ($member->getRole() === ColocationRole::Admin) {
                    $member->setRole(ColocationRole::Member);
                }
            }
        }

        $targetUser->setRole($newRole);
        $this->entityManager->flush();

        return $this->serializer->serializeMember($targetUser);
    }

    public function regenerateInvitationCode(User $user, int $id): array
    {
        $context = $this->accessChecker->resolveContext($user, $id);
        $this->requireAdmin($context->role);

        $context->colocation->setInvitationCode($this->generateUniqueInvitationCode());
        $context->colocation->setInvitationCodeExpiresAt(new \DateTimeImmutable('+24 hours'));
        $this->entityManager->flush();

        return [
            'invitationCode' => $context->colocation->getInvitationCode(),
            'invitationCodeExpiresAt' => $context->colocation->getInvitationCodeExpiresAt()->format(\DateTimeInterface::ATOM),
        ];
    }

    /** Retire un utilisateur de sa colocation en mettant à jour les deux côtés de la relation */
    private function detachUserFromColocation(User $user): void
    {
        $colocation = $user->getColocation();
        if ($colocation !== null) {
            $colocation->getMembers()->removeElement($user);
        }
        $user->setColocation(null);
        $user->setRole(null);
    }

    private function requireAdmin(ColocationRole $role): void
    {
        if ($role !== ColocationRole::Admin) {
            throw ApiException::forbidden('Action réservée aux administrateurs.');
        }
    }

    private function resolveColocationMember(Colocation $colocation, int $userId): User
    {
        $targetUser = $this->userRepository->find($userId);
        if ($targetUser === null || $targetUser->getColocation()?->getId() !== $colocation->getId()) {
            throw ApiException::notFound('Cet utilisateur ne fait pas partie de la colocation.');
        }

        return $targetUser;
    }

    private function isSoleAdmin(User $user, Colocation $colocation): bool
    {
        if ($user->getRole() !== ColocationRole::Admin) {
            return false;
        }

        $members = $colocation->getMembers();
        if ($members->count() <= 1) {
            return false;
        }

        $adminCount = 0;
        foreach ($members as $member) {
            if ($member->getRole() === ColocationRole::Admin) {
                ++$adminCount;
            }
        }

        return $adminCount === 1;
    }

    private function generateUniqueInvitationCode(): string
    {
        do {
            $code = 'COL-'.strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
        } while ($this->colocationRepository->findOneByInvitationCode($code) !== null);

        return $code;
    }
}
