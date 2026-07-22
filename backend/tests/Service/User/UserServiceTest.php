<?php

namespace App\Tests\Service\User;

use App\DTO\User\UpdateUserProfileDto;
use App\Entity\User;
use App\Exception\ApiException;
use App\Repository\ExpenseShareRepository;
use App\Repository\UserRepository;
use App\Service\Colocation\ColocationAdminChecker;
use App\Service\User\UserSerializer;
use App\Service\User\UserService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\ConstraintViolationList;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Teste UserService::update en isolation (nominal / limite / erreur).
 *
 * ValidatorInterface est simulé par un stub : on ne teste pas ici les contraintes du
 * DTO (Assert\Length, etc.), seulement la logique métier de UserService.
 */
#[AllowMockObjectsWithoutExpectations]
final class UserServiceTest extends TestCase
{
    private EntityManagerInterface&MockObject $entityManager;
    private UserRepository&MockObject $userRepository;
    private UserPasswordHasherInterface&MockObject $passwordHasher;
    private UserService $userService;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->userRepository = $this->createMock(UserRepository::class);
        $this->passwordHasher = $this->createMock(UserPasswordHasherInterface::class);

        $validator = $this->createStub(ValidatorInterface::class);
        $validator->method('validate')->willReturn(new ConstraintViolationList());

        $this->userService = new UserService(
            $this->entityManager,
            $this->userRepository,
            $this->createStub(ExpenseShareRepository::class),
            $this->passwordHasher,
            new UserSerializer(),
            new ColocationAdminChecker(),
            $validator,
        );
    }

    private function makeUser(int $id): User
    {
        $user = new User();
        $this->setId($user, $id);
        $user->setEmail('current@example.com');
        // Doctrine appelle normalement ce callback au persist() ; on le simule ici
        // puisque l'entité est construite directement en mémoire pour le test.
        $user->onPrePersistTimestamps();

        return $user;
    }

    private function setId(object $entity, int $id): void
    {
        $property = new \ReflectionProperty($entity, 'id');
        $property->setAccessible(true);
        $property->setValue($entity, $id);
    }

    /** Cas nominal : mise à jour du prénom/nom, sans changement de mot de passe ni d'email. */
    public function testUpdateNominalChangesFirstNameAndLastName(): void
    {
        $user = $this->makeUser(1);

        $dto = new UpdateUserProfileDto();
        $dto->firstName = 'Marie';
        $dto->lastName = 'Curie';

        $this->passwordHasher->expects($this->never())->method('hashPassword');
        $this->entityManager->expects($this->once())->method('flush');

        $result = $this->userService->update($user, $dto);

        $this->assertSame('Marie', $user->getFirstName());
        $this->assertSame('Curie', $user->getLastName());
        $this->assertSame('Marie', $result['firstName']);
    }

    /**
     * Cas limite : l'email trouvé en base pour la nouvelle adresse appartient à
     * l'utilisateur lui-même (même ID) -> ce n'est pas un conflit, la mise à jour passe.
     */
    public function testUpdateLimiteAllowsEmailChangeWhenExistingMatchIsSameUser(): void
    {
        $user = $this->makeUser(1);

        $dto = new UpdateUserProfileDto();
        $dto->email = 'new@example.com';

        $this->userRepository->expects($this->once())
            ->method('findOneBy')
            ->with(['email' => 'new@example.com'])
            ->willReturn($user);

        $this->entityManager->expects($this->once())->method('flush');

        $result = $this->userService->update($user, $dto);

        $this->assertSame('new@example.com', $user->getEmail());
        $this->assertSame('new@example.com', $result['email']);
    }

    /** Cas d'erreur : mot de passe actuel incorrect lors d'un changement de mot de passe. */
    public function testUpdateErreurWhenCurrentPasswordIsWrong(): void
    {
        $user = $this->makeUser(1);

        $dto = new UpdateUserProfileDto();
        $dto->newPassword = 'nouveauMotDePasse123';
        $dto->currentPassword = 'mauvaisMotDePasse';

        $this->passwordHasher->expects($this->once())
            ->method('isPasswordValid')
            ->with($user, 'mauvaisMotDePasse')
            ->willReturn(false);

        $this->entityManager->expects($this->never())->method('flush');

        $this->expectException(ApiException::class);
        $this->expectExceptionMessage('Mot de passe actuel incorrect.');

        $this->userService->update($user, $dto);
    }
}
