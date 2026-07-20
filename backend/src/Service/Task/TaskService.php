<?php

namespace App\Service\Task;

use App\DTO\Task\CreateTaskDto;
use App\DTO\Task\UpdateTaskStatusDto;
use App\DTO\Task\UpdateTaskDto;
use App\Entity\Colocation;
use App\Entity\Task;
use App\Entity\User;
use App\Enum\TaskPriority;
use App\Enum\TaskStatus;
use App\Exception\ApiException;
use App\Repository\TaskRepository;
use App\Repository\UserRepository;
use App\Security\Voter\TaskVoter;
use App\Service\Colocation\ColocationAccessChecker;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

final class TaskService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly ColocationAccessChecker $accessChecker,
        private readonly TaskRepository $taskRepository,
        private readonly UserRepository $userRepository,
        private readonly TaskSerializer $serializer,
        private readonly AuthorizationCheckerInterface $authorizationChecker,
    ) {
    }

    public function create(User $user, int $colocationId, CreateTaskDto $dto): array
    {
        $context = $this->accessChecker->resolveContext($user, $colocationId);

        $task = new Task();
        $task->setColocation($context->colocation);
        $task->setCreatedBy($user);
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
        $context = $this->accessChecker->resolveContext($user, $colocationId);

        return $this->serializer->serialize($this->findTaskInColocation($colocationId, $taskId));
    }

    public function update(User $user, int $colocationId, int $taskId, UpdateTaskDto $dto): array
    {
        $this->accessChecker->resolveContext($user, $colocationId);
        $task = $this->findTaskInColocation($colocationId, $taskId);

        if (!$this->authorizationChecker->isGranted(TaskVoter::MANAGE, $task)) {
            throw ApiException::forbidden(
                'Seul le créateur de la tâche ou un administrateur peut effectuer cette action.',
            );
        }

        $this->fillTask($task, $dto, $task->getColocation());
        $this->entityManager->flush();

        return $this->serializer->serialize($task);
    }

    public function delete(User $user, int $colocationId, int $taskId): void
    {
        $this->accessChecker->resolveContext($user, $colocationId);
        $task = $this->findTaskInColocation($colocationId, $taskId);

        if (!$this->authorizationChecker->isGranted(TaskVoter::MANAGE, $task)) {
            throw ApiException::forbidden(
                'Seul le créateur de la tâche ou un administrateur peut effectuer cette action.',
            );
        }

        $this->entityManager->remove($task);
        $this->entityManager->flush();
    }

    public function updateStatus(User $user, int $colocationId, int $taskId, UpdateTaskStatusDto $dto): array
    {
        $this->accessChecker->resolveContext($user, $colocationId);
        $task = $this->findTaskInColocation($colocationId, $taskId);

        if (!$this->authorizationChecker->isGranted(TaskVoter::CHANGE_STATUS, $task)) {
            throw ApiException::forbidden(
                'Seul le créateur, un administrateur ou le membre assigné peut changer le statut.',
            );
        }

        $status = TaskStatus::from($dto->status);

        $task->setStatus($status);
        $task->setCompletedAt(
            $status === TaskStatus::Done ? ($task->getCompletedAt() ?? new \DateTimeImmutable()) : null,
        );

        $this->entityManager->flush();

        return $this->serializer->serialize($task);
    }

    private function findTaskInColocation(int $colocationId, int $taskId): Task
    {
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
        $assignedTo = $dto->assignedToUserId === null ? null : $this->resolveMember($dto->assignedToUserId, $colocation);

        $task->setTitle($dto->title);
        $task->setDescription($dto->description);
        $task->setStatus($status);
        $task->setPriority($priority);
        $task->setDueDate($this->parseDate($dto->dueDate));
        $task->setCompletedAt($status === TaskStatus::Done ? ($task->getCompletedAt() ?? new \DateTimeImmutable()) : null);
        $task->setAssignedTo($assignedTo);
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
