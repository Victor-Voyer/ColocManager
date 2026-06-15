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
        $task->setStatus(TaskStatus::Done);

        if ($task->getRecurrence() !== TaskRecurrence::None) {
            $this->entityManager->persist($this->createNextRecurringTask($task));
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
        $uniqueUserIds = array_values(array_unique($userIds));
        $users = array_map(
            fn (int $userId): User => $this->resolveMember($userId, $colocation),
            array_map('intval', $uniqueUserIds),
        );

        foreach ($task->getRotationMembers()->toArray() as $rotationMember) {
            $task->removeRotationMember($rotationMember);
            $this->entityManager->remove($rotationMember);
        }

        if ($task->getId() !== null) {
            $this->entityManager->flush();
        }

        foreach ($users as $position => $user) {
            $rotationMember = new TaskRotationMember();
            $rotationMember->setUser($user);
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

    private function createNextRecurringTask(Task $completedTask): Task
    {
        $nextTask = new Task();
        $nextTask->setColocation($completedTask->getColocation());
        $nextTask->setTitle($completedTask->getTitle());
        $nextTask->setDescription($completedTask->getDescription());
        $nextTask->setStatus(TaskStatus::Pending);
        $nextTask->setPriority($completedTask->getPriority());
        $nextTask->setRecurrence($completedTask->getRecurrence());
        $nextTask->setDueDate($this->nextDueDate($completedTask));

        foreach ($completedTask->getRotationMembers()->toArray() as $rotationMember) {
            $nextRotationMember = new TaskRotationMember();
            $nextRotationMember->setUser($rotationMember->getUser());
            $nextRotationMember->setPosition($rotationMember->getPosition());
            $nextTask->addRotationMember($nextRotationMember);
        }

        $memberCount = count($nextTask->getRotationMembers());
        if ($memberCount > 0) {
            $nextTask->setRotationIndex(($completedTask->getRotationIndex() + 1) % $memberCount);
            $nextTask->setAssignedTo($this->assignedUserFromRotation($nextTask));
        } else {
            $nextTask->setAssignedTo($completedTask->getAssignedTo());
        }

        return $nextTask;
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
