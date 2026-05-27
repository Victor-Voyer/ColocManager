<?php

namespace App\Service\Auth;

use App\DTO\User\RegisterUserDto;
use App\Entity\User;
use App\Exception\ApiException;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class AuthService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserRepository $userRepository,
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {
    }

    /** Crée un compte utilisateur (auto-login via cookie posé par le controller) */
    public function register(RegisterUserDto $dto): User
    {
        if ($this->userRepository->findOneBy(['email' => $dto->email]) !== null) {
            throw ApiException::conflict('Cet email est déjà utilisé.');
        }

        $user = new User();
        $user->setFirstName($dto->firstName);
        $user->setLastName($dto->lastName);
        $user->setEmail($dto->email);
        $user->setPasswordHash($this->passwordHasher->hashPassword($user, $dto->password));

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $user;
    }
}
