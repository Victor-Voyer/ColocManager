<?php

namespace App\Tests\Service\Expense;

use App\DTO\Expense\CreateExpenseDto;
use App\DTO\Expense\ExpenseShareInputDto;
use App\Entity\Colocation;
use App\Entity\Expense;
use App\Entity\User;
use App\Enum\ColocationRole;
use App\Exception\ApiException;
use App\Repository\ColocationRepository;
use App\Repository\ExpenseRepository;
use App\Repository\ExpenseShareRepository;
use App\Repository\UserRepository;
use App\Service\Colocation\ColocationAccessChecker;
use App\Service\Expense\ExpenseSerializer;
use App\Service\Expense\ExpenseService;
use App\Service\User\UserSummarySerializer;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

/**
 * Teste ExpenseService::create en isolation (nominal / limite / erreur).
 *
 * ColocationAccessChecker et ExpenseSerializer sont des classes "final" (non mockables) :
 * on les instancie réellement, branchées sur des repositories mockés.
 */
#[AllowMockObjectsWithoutExpectations]
final class ExpenseServiceTest extends TestCase
{
    private EntityManagerInterface&MockObject $entityManager;
    private ColocationRepository&MockObject $colocationRepository;
    private UserRepository&MockObject $userRepository;
    private ExpenseService $expenseService;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->colocationRepository = $this->createMock(ColocationRepository::class);
        $this->userRepository = $this->createMock(UserRepository::class);

        $this->expenseService = new ExpenseService(
            $this->entityManager,
            new ColocationAccessChecker($this->colocationRepository),
            $this->createStub(ExpenseRepository::class),
            $this->createStub(ExpenseShareRepository::class),
            $this->userRepository,
            new ExpenseSerializer(new UserSummarySerializer()),
            $this->createStub(AuthorizationCheckerInterface::class),
        );
    }

    private function makeColocation(int $id): Colocation
    {
        $colocation = new Colocation();
        $this->setId($colocation, $id);

        return $colocation;
    }

    /** Crée un membre et l'ajoute à la fois côté User et côté collection Colocation::members. */
    private function makeMember(int $id, Colocation $colocation): User
    {
        $user = new User();
        $this->setId($user, $id);
        $user->setColocation($colocation);
        $user->setRole(ColocationRole::Member);
        $colocation->getMembers()->add($user);

        return $user;
    }

    private function makeShareInput(int $userId, ?string $amountOwed): ExpenseShareInputDto
    {
        $share = new ExpenseShareInputDto();
        $share->userId = $userId;
        $share->amountOwed = $amountOwed;

        return $share;
    }

    private function setId(object $entity, int $id): void
    {
        $property = new \ReflectionProperty($entity, 'id');
        $property->setAccessible(true);
        $property->setValue($entity, $id);
    }

    /** Cas nominal : le payeur avance pour un seul membre, qui doit la totalité. */
    public function testCreateNominalSplitsFullAmountToSingleMember(): void
    {
        $colocation = $this->makeColocation(10);
        $payer = $this->makeMember(1, $colocation);
        $member2 = $this->makeMember(2, $colocation);

        $dto = new CreateExpenseDto();
        $dto->amount = '20.00';
        $dto->description = 'Courses';
        $dto->shares = [$this->makeShareInput(2, null)];

        $this->colocationRepository->expects($this->atLeastOnce())->method('find')->with(10)->willReturn($colocation);
        $this->userRepository->expects($this->once())->method('find')->with(2)->willReturn($member2);

        $this->entityManager->expects($this->once())->method('persist')
            ->with($this->callback(function (Expense $expense): bool {
                // Simule le lifecycle callback PrePersist déclenché normalement par Doctrine.
                $expense->onPrePersistTimestamps();

                return true;
            }));
        $this->entityManager->expects($this->once())->method('flush');

        $result = $this->expenseService->create($payer, 10, $dto);

        $this->assertSame('20.00', $result['shares'][0]['amountOwed']);
        $this->assertFalse($result['shares'][0]['isPaid']);
    }

    /**
     * Cas limite : répartition automatique de 10.00€ entre 3 membres (1000 centimes / 3).
     * Le reste de la division (1 centime) doit revenir au premier membre de la liste.
     */
    public function testCreateLimiteDistributesRoundingRemainderToFirstShare(): void
    {
        $colocation = $this->makeColocation(10);
        $payer = $this->makeMember(1, $colocation);
        $member2 = $this->makeMember(2, $colocation);
        $member3 = $this->makeMember(3, $colocation);
        $member4 = $this->makeMember(4, $colocation);

        $dto = new CreateExpenseDto();
        $dto->amount = '10.00';
        $dto->description = 'Courses à trois';
        $dto->shares = [
            $this->makeShareInput(2, null),
            $this->makeShareInput(3, null),
            $this->makeShareInput(4, null),
        ];

        $this->colocationRepository->expects($this->atLeastOnce())->method('find')->with(10)->willReturn($colocation);
        $this->userRepository->method('find')->willReturnMap([
            [2, $member2],
            [3, $member3],
            [4, $member4],
        ]);

        $this->entityManager->expects($this->once())->method('persist')
            ->with($this->callback(function (Expense $expense): bool {
                $expense->onPrePersistTimestamps();

                return true;
            }));
        $this->entityManager->method('flush');

        $result = $this->expenseService->create($payer, 10, $dto);

        $this->assertSame('3.34', $result['shares'][0]['amountOwed']);
        $this->assertSame('3.33', $result['shares'][1]['amountOwed']);
        $this->assertSame('3.33', $result['shares'][2]['amountOwed']);
    }

    /** Cas d'erreur : une part référence un utilisateur qui n'est pas membre de la colocation. */
    public function testCreateErreurWhenShareUserIsNotAMember(): void
    {
        $colocation = $this->makeColocation(10);
        $payer = $this->makeMember(1, $colocation);

        $dto = new CreateExpenseDto();
        $dto->amount = '20.00';
        $dto->description = 'Courses';
        $dto->shares = [$this->makeShareInput(999, null)];

        $this->colocationRepository->expects($this->atLeastOnce())->method('find')->with(10)->willReturn($colocation);
        $this->entityManager->expects($this->never())->method('persist');

        $this->expectException(ApiException::class);
        $this->expectExceptionMessage('L\'utilisateur 999 n\'est pas membre de la colocation.');

        $this->expenseService->create($payer, 10, $dto);
    }
}
