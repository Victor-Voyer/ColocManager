<?php

namespace App\Tests\Service\Colocation;

use App\DTO\Colocation\CreateColocationDto;
use App\Entity\Colocation;
use App\Entity\User;
use App\Enum\ColocationRole;
use App\Exception\ApiException;
use App\Repository\ColocationRepository;
use App\Repository\ExpenseShareRepository;
use App\Repository\UserRepository;
use App\Service\Colocation\ColocationAccessChecker;
use App\Service\Colocation\ColocationAdminChecker;
use App\Service\Colocation\ColocationSerializer;
use App\Service\Colocation\ColocationService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

/**
 * Teste ColocationService::create en isolation (nominal / limite / erreur).
 *
 * ColocationAccessChecker et ColocationSerializer sont des classes "final" (non mockables) :
 * on les instancie réellement (ColocationAdminChecker n'a aucune dépendance, on l'instancie aussi).
 */
#[AllowMockObjectsWithoutExpectations]
final class ColocationServiceTest extends TestCase
{
    private EntityManagerInterface&MockObject $entityManager;
    private ColocationRepository&MockObject $colocationRepository;
    private ColocationService $colocationService;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->colocationRepository = $this->createMock(ColocationRepository::class);

        $this->colocationService = new ColocationService(
            $this->entityManager,
            new ColocationAccessChecker($this->colocationRepository),
            $this->colocationRepository,
            $this->createStub(ExpenseShareRepository::class),
            $this->createStub(UserRepository::class),
            new ColocationSerializer(),
            new ColocationAdminChecker(),
            $this->createStub(AuthorizationCheckerInterface::class),
        );
    }

    private function makeUser(int $id): User
    {
        $user = new User();
        $this->setId($user, $id);

        return $user;
    }

    private function makeColocation(int $id): Colocation
    {
        $colocation = new Colocation();
        $this->setId($colocation, $id);

        return $colocation;
    }

    private function setId(object $entity, int $id): void
    {
        $property = new \ReflectionProperty($entity, 'id');
        $property->setAccessible(true);
        $property->setValue($entity, $id);
    }

    /** Cas nominal : un utilisateur sans colocation en crée une et en devient admin. */
    public function testCreateNominalMakesUserAdminOfNewColocation(): void
    {
        $user = $this->makeUser(1);

        $dto = new CreateColocationDto();
        $dto->name = 'Ma super coloc';

        $this->colocationRepository->expects($this->once())
            ->method('findOneByInvitationCode')
            ->willReturn(null);

        $this->entityManager->expects($this->once())->method('persist')
            ->with($this->callback(function (Colocation $colocation): bool {
                // Simule le lifecycle callback PrePersist déclenché normalement par Doctrine.
                $colocation->onPrePersistTimestamps();

                return true;
            }));
        $this->entityManager->expects($this->once())->method('flush');
        $this->entityManager->expects($this->once())->method('refresh');

        $result = $this->colocationService->create($user, $dto);

        $this->assertSame('Ma super coloc', $result['name']);
        $this->assertSame('admin', $result['role']);
        $this->assertSame(ColocationRole::Admin, $user->getRole());
    }

    /**
     * Cas limite : le code d'invitation généré collisionne une première fois avec un code
     * existant. La boucle do/while de generateUniqueInvitationCode() doit relancer un tirage.
     */
    public function testCreateLimiteRetriesInvitationCodeOnCollision(): void
    {
        $user = $this->makeUser(1);

        $dto = new CreateColocationDto();
        $dto->name = 'Coloc avec collision';

        $collidingColocation = $this->makeColocation(99);

        $this->colocationRepository->expects($this->exactly(2))
            ->method('findOneByInvitationCode')
            ->willReturnOnConsecutiveCalls($collidingColocation, null);

        $this->entityManager->expects($this->once())->method('persist')
            ->with($this->callback(function (Colocation $colocation): bool {
                $colocation->onPrePersistTimestamps();

                return true;
            }));
        $this->entityManager->method('flush');
        $this->entityManager->method('refresh');

        $this->colocationService->create($user, $dto);
    }

    /** Cas d'erreur : un utilisateur déjà membre d'une colocation ne peut pas en créer une autre. */
    public function testCreateErreurWhenUserAlreadyBelongsToAColocation(): void
    {
        $user = $this->makeUser(1);
        $user->setColocation($this->makeColocation(5));

        $dto = new CreateColocationDto();
        $dto->name = 'Autre coloc';

        $this->entityManager->expects($this->never())->method('persist');

        $this->expectException(ApiException::class);
        $this->expectExceptionMessage('Vous faites déjà partie d\'une colocation.');

        $this->colocationService->create($user, $dto);
    }
}
