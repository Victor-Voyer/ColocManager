<?php

namespace App\Service\User;

use App\DTO\User\DeleteUserAccountDto;
use App\DTO\User\UpdateUserProfileDto;
use App\Entity\User;
use App\Exception\ApiException;
use App\Repository\ExpenseShareRepository;
use App\Repository\UserRepository;
use App\Service\Colocation\ColocationAdminChecker;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

final class UserService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserRepository $userRepository,
        private readonly ExpenseShareRepository $expenseShareRepository,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly UserSerializer $serializer,
        private readonly ColocationAdminChecker $adminChecker,
        private readonly ValidatorInterface $validator,
    ) {
    }

    public function getProfile(User $user): array
    {
        return $this->serializer->serialize($user);
    }

    public function update(User $user, UpdateUserProfileDto $dto): array
    {
        if ($dto->newPassword !== null) {
            $passwordErrors = $this->validator->validate($dto, null, ['password_change']);
            if (count($passwordErrors) > 0) {
                throw ApiException::validation($passwordErrors);
            }

            if ($dto->currentPassword === null || !$this->passwordHasher->isPasswordValid($user, $dto->currentPassword)) {
                throw new ApiException('Mot de passe actuel incorrect.');
            }
        }

        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            throw ApiException::validation($errors);
        }

        if ($dto->firstName !== null) {
            $user->setFirstName($dto->firstName);
        }

        if ($dto->lastName !== null) {
            $user->setLastName($dto->lastName);
        }

        if ($dto->email !== null && $dto->email !== $user->getEmail()) {
            $existingUser = $this->userRepository->findOneBy(['email' => $dto->email]);
            if ($existingUser !== null && $existingUser->getId() !== $user->getId()) {
                throw ApiException::conflict('Cet email est déjà utilisé.');
            }

            $user->setEmail($dto->email);
        }

        if ($dto->avatarUrl !== null) {
            $user->setAvatarUrl($dto->avatarUrl === '' ? null : $dto->avatarUrl);
        }

        if ($dto->newPassword !== null) {
            $user->setPasswordHash($this->passwordHasher->hashPassword($user, $dto->newPassword));
        }

        $this->entityManager->flush();

        return $this->serializer->serialize($user);
    }

    public function delete(User $user, DeleteUserAccountDto $dto): void
    {
        if (!$this->passwordHasher->isPasswordValid($user, $dto->password)) {
            throw new ApiException('Mot de passe incorrect.');
        }

        if ($this->expenseShareRepository->hasActiveDebt($user)) {
            throw ApiException::conflict(
                'Impossible de supprimer le compte : vous avez des dettes actives non réglées (montants dus ou à percevoir).',
            );
        }

        if ($this->adminChecker->isSoleAdminOfColocationWithOtherMembers($user)) {
            throw ApiException::conflict(
                'Impossible de supprimer le compte : vous êtes le seul administrateur d\'une colocation avec d\'autres membres. Transférez le rôle admin avant de supprimer votre compte.',
            );
        }

        $this->entityManager->remove($user);
        $this->entityManager->flush();
    }
}
