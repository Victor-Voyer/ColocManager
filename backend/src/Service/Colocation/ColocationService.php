<?php

namespace App\Service\Colocation;

use App\DTO\Colocation\CreateColocationDto;
use App\DTO\Colocation\JoinColocationDto;
use App\DTO\Colocation\UpdateColocationDto;
use App\DTO\Colocation\UpdateMemberRoleDto;
use App\Entity\Colocation;
use App\Entity\ColocationUser;
use App\Entity\User;
use App\Enum\ColocationRole;
use App\Exception\ApiException;
use App\Repository\ColocationRepository;
use App\Repository\ColocationUserRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;

final class ColocationService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly ColocationAccessChecker $accessChecker,
        private readonly ColocationRepository $colocationRepository,
        private readonly ColocationUserRepository $colocationUserRepository,
        private readonly UserRepository $userRepository,
        private readonly ColocationSerializer $serializer,
    ) {
    }

    public function create(User $user, CreateColocationDto $dto): array
    {
        $colocation = new Colocation();
        $colocation->setName($dto->name);
        $colocation->setInvitationCode($this->generateUniqueInvitationCode());

        $membership = new ColocationUser($user, $colocation);
        $membership->setRole(ColocationRole::Admin);

        $colocation->addMembership($membership);
        $user->addColocationMembership($membership);

        $this->entityManager->persist($colocation);
        $this->entityManager->persist($membership);
        $this->entityManager->flush();

        return $this->serializer->serialize($colocation, $membership);
    }

    public function join(User $user, JoinColocationDto $dto): array
    {
        $colocation = $this->colocationRepository->findOneByInvitationCode($dto->invitationCode);

        if ($colocation === null) {
            throw ApiException::notFound('Code d\'invitation invalide.');
        }

        if ($this->colocationUserRepository->findOneByUserAndColocation($user, $colocation) !== null) {
            throw ApiException::conflict('Vous faites déjà partie de cette colocation.');
        }

        $membership = new ColocationUser($user, $colocation);
        $colocation->addMembership($membership);
        $user->addColocationMembership($membership);

        $this->entityManager->persist($membership);
        $this->entityManager->flush();

        return $this->serializer->serialize($colocation, $membership);
    }

    public function show(User $user, int $id): array
    {
        $context = $this->accessChecker->resolveContext($user, $id);

        return $this->serializer->serialize($context->colocation, $context->membership);
    }

    public function update(User $user, int $id, UpdateColocationDto $dto): array
    {
        $context = $this->accessChecker->resolveContext($user, $id);
        $this->requireAdmin($context->membership);

        $context->colocation->setName($dto->name);
        $this->entityManager->flush();

        return $this->serializer->serialize($context->colocation, $context->membership);
    }

    public function delete(User $user, int $id): void
    {
        $context = $this->accessChecker->resolveContext($user, $id);
        $this->requireAdmin($context->membership);

        $expensesCount = $this->colocationRepository->countExpenses($context->colocation);
        if ($expensesCount > 0) {
            throw ApiException::conflict(
                'Impossible de supprimer la colocation : des dépenses y sont enregistrées.',
                ['expensesCount' => $expensesCount],
            );
        }

        $this->entityManager->remove($context->colocation);
        $this->entityManager->flush();
    }

    public function members(User $user, int $id): array
    {
        $context = $this->accessChecker->resolveContext($user, $id);

        return array_map(
            fn (ColocationUser $member): array => $this->serializer->serializeMember($member),
            $context->colocation->getMemberships()->toArray(),
        );
    }

    public function removeMember(User $user, int $id, int $userId): void
    {
        $context = $this->accessChecker->resolveContext($user, $id);
        $this->requireAdmin($context->membership);

        if ($userId === $user->getId()) {
            throw new ApiException('Utilisez POST /leave pour quitter la colocation.');
        }

        $targetMembership = $this->resolveTargetMembership($context->colocation, $userId);

        if ($this->isSoleAdmin($targetMembership, $context->colocation)) {
            throw ApiException::conflict('Impossible d\'exclure le seul administrateur. Transférez d\'abord le rôle admin.');
        }

        $this->entityManager->remove($targetMembership);
        $this->entityManager->flush();
    }

    public function leave(User $user, int $id): void
    {
        $context = $this->accessChecker->resolveContext($user, $id);

        if ($this->isSoleAdmin($context->membership, $context->colocation)) {
            throw ApiException::conflict('Impossible de quitter : vous êtes le seul administrateur. Transférez d\'abord le rôle admin.');
        }

        $this->entityManager->remove($context->membership);
        $this->entityManager->flush();
    }

    public function updateMemberRole(User $user, int $id, int $userId, UpdateMemberRoleDto $dto): array
    {
        $context = $this->accessChecker->resolveContext($user, $id);
        $this->requireAdmin($context->membership);

        $targetMembership = $this->resolveTargetMembership($context->colocation, $userId);
        $newRole = ColocationRole::from($dto->role);

        if ($newRole === ColocationRole::Member && $this->isSoleAdmin($targetMembership, $context->colocation)) {
            throw ApiException::conflict('Impossible de rétrograder le seul administrateur. Promouvez d\'abord un autre membre.');
        }

        $targetMembership->setRole($newRole);
        $this->entityManager->flush();

        return $this->serializer->serializeMember($targetMembership);
    }

    public function regenerateInvitationCode(User $user, int $id): array
    {
        $context = $this->accessChecker->resolveContext($user, $id);
        $this->requireAdmin($context->membership);

        $context->colocation->setInvitationCode($this->generateUniqueInvitationCode());
        $this->entityManager->flush();

        return [
            'invitationCode' => $context->colocation->getInvitationCode(),
        ];
    }

    private function requireAdmin(ColocationUser $membership): void
    {
        if ($membership->getRole() !== ColocationRole::Admin) {
            throw ApiException::forbidden('Action réservée aux administrateurs.');
        }
    }

    private function resolveTargetMembership(Colocation $colocation, int $userId): ColocationUser
    {
        $targetUser = $this->userRepository->find($userId);
        if ($targetUser === null) {
            throw ApiException::notFound('Membre introuvable.');
        }

        $targetMembership = $this->colocationUserRepository->findOneByUserAndColocation($targetUser, $colocation);
        if ($targetMembership === null) {
            throw ApiException::notFound('Cet utilisateur ne fait pas partie de la colocation.');
        }

        return $targetMembership;
    }

    private function isSoleAdmin(ColocationUser $membership, Colocation $colocation): bool
    {
        if ($membership->getRole() !== ColocationRole::Admin) {
            return false;
        }

        if ($colocation->getMemberships()->count() <= 1) {
            return false;
        }

        return $this->colocationUserRepository->countAdmins($colocation) === 1;
    }

    private function generateUniqueInvitationCode(): string
    {
        do {
            $code = 'COL-'.strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
        } while ($this->colocationRepository->findOneByInvitationCode($code) !== null);

        return $code;
    }
}
