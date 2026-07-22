<?php

namespace App\Tests\Service\Task;

use App\Entity\Colocation;
use App\Entity\Task;
use App\Entity\User;
use App\Enum\ColocationRole;
use App\Enum\TaskStatus;
use App\DTO\Task\UpdateTaskStatusDto;
use App\Exception\ApiException;
use App\Repository\ColocationRepository;
use App\Repository\TaskRepository;
use App\Repository\UserRepository;
use App\Security\Voter\TaskVoter;
use App\Service\Colocation\ColocationAccessChecker;
use App\Service\Task\TaskSerializer;
use App\Service\Task\TaskService;
use App\Service\User\UserSummarySerializer;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

/**
 * Teste TaskService::updateStatus en isolation (nominal / limite / erreur).
 *
 * ColocationAccessChecker et TaskSerializer sont des classes "final" (non mockables) :
 * on les instancie réellement, branchées sur des repositories mockés.
 */
#[AllowMockObjectsWithoutExpectations]
final class TaskServiceTest extends TestCase
{
    private EntityManagerInterface&MockObject $entityManager;
    private ColocationRepository&MockObject $colocationRepository;
    private TaskRepository&MockObject $taskRepository;
    private AuthorizationCheckerInterface&MockObject $authorizationChecker;
    private TaskService $taskService;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->colocationRepository = $this->createMock(ColocationRepository::class);
        $this->taskRepository = $this->createMock(TaskRepository::class);
        $this->authorizationChecker = $this->createMock(AuthorizationCheckerInterface::class);

        $this->taskService = new TaskService(
            $this->entityManager,
            new ColocationAccessChecker($this->colocationRepository),
            $this->taskRepository,
            $this->createStub(UserRepository::class),
            new TaskSerializer(new UserSummarySerializer()),
            $this->authorizationChecker,
        );
    }

    private function makeColocation(int $id): Colocation
    {
        $colocation = new Colocation();
        $this->setId($colocation, $id);

        return $colocation;
    }

    private function makeUser(int $id, Colocation $colocation): User
    {
        $user = new User();
        $this->setId($user, $id);
        $user->setColocation($colocation);
        $user->setRole(ColocationRole::Member);

        return $user;
    }

    private function makeTask(int $id, Colocation $colocation): Task
    {
        $task = new Task();
        $this->setId($task, $id);
        $task->setColocation($colocation);
        $task->setTitle('Faire la vaisselle');
        // Doctrine appelle normalement ce callback au persist() ; on le simule ici
        // puisque l'EntityManager est mocké et ne déclenche pas les lifecycle events.
        $task->onPrePersistTimestamps();

        return $task;
    }

    private function setId(object $entity, int $id): void
    {
        $property = new \ReflectionProperty($entity, 'id');
        $property->setAccessible(true);
        $property->setValue($entity, $id);
    }

    /** Cas nominal : transition autorisée vers "done" -> completedAt est renseigné. */
    public function testUpdateStatusNominalMarksTaskAsDone(): void
    {
        $colocation = $this->makeColocation(10);
        $user = $this->makeUser(1, $colocation);
        $task = $this->makeTask(5, $colocation);
        $task->setStatus(TaskStatus::InProgress);

        $dto = new UpdateTaskStatusDto();
        $dto->status = 'done';

        $this->colocationRepository->expects($this->atLeastOnce())->method('find')->with(10)->willReturn($colocation);
        $this->taskRepository->expects($this->atLeastOnce())->method('find')->with(5)->willReturn($task);
        $this->authorizationChecker->expects($this->once())
            ->method('isGranted')
            ->with(TaskVoter::CHANGE_STATUS, $task)
            ->willReturn(true);

        $this->entityManager->expects($this->once())->method('flush');

        $this->taskService->updateStatus($user, 10, 5, $dto);

        $this->assertSame(TaskStatus::Done, $task->getStatus());
        $this->assertNotNull($task->getCompletedAt());
    }

    /**
     * Cas limite : une tâche déjà "done" reçoit à nouveau le statut "done".
     * Le completedAt existant ne doit pas être écrasé (garde `?? new DateTimeImmutable()`).
     */
    public function testUpdateStatusLimiteKeepsOriginalCompletedAtWhenAlreadyDone(): void
    {
        $colocation = $this->makeColocation(10);
        $user = $this->makeUser(1, $colocation);
        $task = $this->makeTask(5, $colocation);
        $task->setStatus(TaskStatus::Done);
        $originalCompletedAt = new \DateTimeImmutable('2026-01-01T10:00:00+00:00');
        $task->setCompletedAt($originalCompletedAt);

        $dto = new UpdateTaskStatusDto();
        $dto->status = 'done';

        $this->colocationRepository->expects($this->atLeastOnce())->method('find')->with(10)->willReturn($colocation);
        $this->taskRepository->expects($this->atLeastOnce())->method('find')->with(5)->willReturn($task);
        $this->authorizationChecker->method('isGranted')->willReturn(true);

        $this->entityManager->expects($this->once())->method('flush');

        $this->taskService->updateStatus($user, 10, 5, $dto);

        $this->assertSame($originalCompletedAt, $task->getCompletedAt());
    }

    /** Cas d'erreur : l'utilisateur n'est ni créateur, ni assigné, ni admin -> 403. */
    public function testUpdateStatusErreurWhenUserIsNotAuthorized(): void
    {
        $colocation = $this->makeColocation(10);
        $user = $this->makeUser(1, $colocation);
        $task = $this->makeTask(5, $colocation);

        $dto = new UpdateTaskStatusDto();
        $dto->status = 'done';

        $this->colocationRepository->expects($this->atLeastOnce())->method('find')->with(10)->willReturn($colocation);
        $this->taskRepository->expects($this->atLeastOnce())->method('find')->with(5)->willReturn($task);
        $this->authorizationChecker->method('isGranted')->willReturn(false);
        $this->entityManager->expects($this->never())->method('flush');

        $this->expectException(ApiException::class);
        $this->expectExceptionMessage('Seul le créateur, un administrateur ou le membre assigné peut changer le statut.');

        $this->taskService->updateStatus($user, 10, 5, $dto);
    }
}
