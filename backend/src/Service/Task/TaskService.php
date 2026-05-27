<?php

namespace App\Service\Task;

use App\DTO\Task\CreateTaskDto;
use App\DTO\Task\UpdateTaskDto;
use App\Entity\Colocation;
use App\Entity\Task;
use App\Entity\TaskRotationMember;
use App\Entity\User;
use App\Enum\TaskPriority;
use App\Enum\TaskRecurrence;
use App\Enum\TaskStatus;
use App\Exception\ApiException;
use App\Repository\TaskRepository;
use App\Repository\UserRepository;
use App\Service\Colocation\ColocationAccessChecker;
use Doctrine\ORM\EntityManagerInterface;

/** Logique metier des taches menageres. */
final class TaskService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly ColocationAccessChecker $accessChecker,
        private readonly TaskRepository $taskRepository,
        private readonly UserRepository $userRepository,
        private readonly TaskSerializer $serializer,
    ) {
    }

    public function create(User $user, int $colocationId, CreateTaskDto $dto): array
    {
        $context = $this->accessChecker->resolveContext($user, $colocationId);

        $task = new Task();
        $task->setColocation($context->colocation);
        $this->fillTask($task, $dto, $context->colocation);

        $this->entityManager->persist($task);
        $this->entityManager->flush();

        return $this->serializer->serialize($task);
    }

    public function list(User $user, int $colocationId, ?string $status, ?int $assignedToUserId): array
    {
        $context = $this->accessChecker->resolveContext($user, $colocationId);
        $taskStatus = $this->parseNullableStatus($status);
        $assignedTo = $assignedToUserId === null ? null : $this->resolveMember($assignedToUserId, $context->colocation);

        $tasks = $this->taskRepository->findByColocationFiltered($context->colocation, $taskStatus, $assignedTo, false);

        return [
            'items' => array_map(fn (Task $task): array => $this->serializer->serialize($task), $tasks),
        ];
    }

    public function history(User $user, int $colocationId): array
    {
        $context = $this->accessChecker->resolveContext($user, $colocationId);
        $tasks = $this->taskRepository->findByColocationFiltered($context->colocation, TaskStatus::Done, null, true);

        return [
            'items' => array_map(fn (Task $task): array => $this->serializer->serialize($task), $tasks),
        ];
    }

    public function show(User $user, int $colocationId, int $taskId): array
    {
        return $this->serializer->serialize($this->resolveTask($user, $colocationId, $taskId));
    }

    public function update(User $user, int $colocationId, int $taskId, UpdateTaskDto $dto): array
    {
        $task = $this->resolveTask($user, $colocationId, $taskId);
        $this->fillTask($task, $dto, $task->getColocation());
        $this->entityManager->flush();

        return $this->serializer->serialize($task);
    }

    public function delete(User $user, int $colocationId, int $taskId): void
    {
        $task = $this->resolveTask($user, $colocationId, $taskId);
        $this->entityManager->remove($task);
        $this->entityManager->flush();
    }

    public function complete(User $user, int $taskId): array
    {
        $task = $this->taskRepository->find($taskId);
        if ($task === null) {
            throw ApiException::notFound('Tache introuvable.');
        }

        $this->accessChecker->requireMembership($user, $task->getColocation());
        $task->setCompletedAt(new \DateTimeImmutable());

        if ($task->getRecurrence() === TaskRecurrence::None) {
            $task->setStatus(TaskStatus::Done);
        } else {
            $this->advanceRotation($task);
            $task->setStatus(TaskStatus::Pending);
            $task->setDueDate($this->nextDueDate($task));
        }

        $this->entityManager->flush();

        return $this->serializer->serialize($task);
    }

    private function resolveTask(User $user, int $colocationId, int $taskId): Task
    {
        $this->accessChecker->resolveContext($user, $colocationId);

        $task = $this->taskRepository->find($taskId);
        if ($task === null || $task->getColocation()->getId() !== $colocationId) {
            throw ApiException::notFound('Tache introuvable.');
        }

        return $task;
    }

    private function fillTask(Task $task, CreateTaskDto|UpdateTaskDto $dto, Colocation $colocation): void
    {
        $status = TaskStatus::from($dto->status);
        $priority = TaskPriority::from($dto->priority);
        $recurrence = TaskRecurrence::from($dto->recurrence);
        $assignedTo = $dto->assignedToUserId === null ? null : $this->resolveMember($dto->assignedToUserId, $colocation);

        if ($assignedTo !== null && $recurrence !== TaskRecurrence::None) {
            $this->assertNoRecurringConflict($task, $colocation, $assignedTo, $priority);
        }

        $task->setTitle($dto->title);
        $task->setDescription($dto->description);
        $task->setStatus($status);
        $task->setPriority($priority);
        $task->setRecurrence($recurrence);
        $task->setDueDate($this->parseDate($dto->dueDate));
        $task->setCompletedAt($status === TaskStatus::Done ? ($task->getCompletedAt() ?? new \DateTimeImmutable()) : null);

        $this->replaceRotationMembers($task, $dto->rotationMemberUserIds, $colocation);
        $task->setAssignedTo($assignedTo ?? $this->assignedUserFromRotation($task));
    }

    private function resolveMember(int $userId, Colocation $colocation): User
    {
        $member = $this->userRepository->find($userId);
        if ($member === null) {
            throw ApiException::notFound('Utilisateur introuvable.');
        }

        $this->accessChecker->requireMembership($member, $colocation);

        return $member;
    }

    private function assertNoRecurringConflict(Task $task, Colocation $colocation, User $assignedTo, TaskPriority $priority): void
    {
        $taskId = $task->getId();
        $conflictCount = $this->taskRepository->countActiveRecurringByAssigneeAndPriority(
            $colocation,
            $assignedTo,
            $priority,
            $taskId,
        );

        if ($conflictCount > 0) {
            throw ApiException::conflict('Ce membre a deja une tache recurrente active de meme priorite.');
        }
    }

    /** @param list<int> $userIds */
    private function replaceRotationMembers(Task $task, array $userIds, Colocation $colocation): void
    {
        foreach ($task->getRotationMembers()->toArray() as $rotationMember) {
            $task->removeRotationMember($rotationMember);
            $this->entityManager->remove($rotationMember);
        }

        $uniqueUserIds = array_values(array_unique($userIds));
        foreach ($uniqueUserIds as $position => $userId) {
            $rotationMember = new TaskRotationMember();
            $rotationMember->setUser($this->resolveMember((int) $userId, $colocation));
            $rotationMember->setPosition($position);
            $task->addRotationMember($rotationMember);
        }

        if ($task->getRotationIndex() >= count($uniqueUserIds)) {
            $task->setRotationIndex(0);
        }
    }

    private function assignedUserFromRotation(Task $task): ?User
    {
        $members = $task->getRotationMembers()->toArray();
        usort($members, fn (TaskRotationMember $a, TaskRotationMember $b): int => $a->getPosition() <=> $b->getPosition());

        return $members[$task->getRotationIndex()]?->getUser() ?? null;
    }

    private function advanceRotation(Task $task): void
    {
        $members = $task->getRotationMembers()->toArray();
        if (count($members) === 0) {
            return;
        }

        $task->setRotationIndex(($task->getRotationIndex() + 1) % count($members));
        $task->setAssignedTo($this->assignedUserFromRotation($task));
    }

    private function nextDueDate(Task $task): ?\DateTimeImmutable
    {
        $current = $task->getDueDate() ?? new \DateTimeImmutable('today');

        return match ($task->getRecurrence()) {
            TaskRecurrence::Daily => $current->modify('+1 day'),
            TaskRecurrence::Weekly => $current->modify('+1 week'),
            TaskRecurrence::Monthly => $current->modify('+1 month'),
            TaskRecurrence::None => $task->getDueDate(),
        };
    }

    private function parseDate(?string $date): ?\DateTimeImmutable
    {
        if ($date === null || $date === '') {
            return null;
        }

        $parsed = \DateTimeImmutable::createFromFormat('Y-m-d', $date);
        if ($parsed === false) {
            throw new ApiException('Date invalide, format attendu : Y-m-d.');
        }

        return $parsed;
    }

    private function parseNullableStatus(?string $status): ?TaskStatus
    {
        if ($status === null || $status === '') {
            return null;
        }

        return TaskStatus::tryFrom($status) ?? throw new ApiException('Statut de tache invalide.');
    }
}
