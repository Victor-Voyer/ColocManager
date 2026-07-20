<?php

namespace App\Service\Task;

use App\Entity\Task;
use App\Service\User\UserSummarySerializer;

final class TaskSerializer
{
    public function __construct(
        private readonly UserSummarySerializer $userSummarySerializer,
    ) {
    }

    public function serialize(Task $task): array
    {
        return [
            'id' => $task->getId(),
            'title' => $task->getTitle(),
            'description' => $task->getDescription(),
            'status' => $task->getStatus()->value,
            'priority' => $task->getPriority()->value,
            'dueDate' => $task->getDueDate()?->format('Y-m-d'),
            'completedAt' => $task->getCompletedAt()?->format(\DateTimeInterface::ATOM),
            'assignedTo' => $this->userSummarySerializer->toSummary($task->getAssignedTo()),
            'createdBy' => $this->userSummarySerializer->toSummary($task->getCreatedBy()),
            'createdAt' => $task->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'updatedAt' => $task->getUpdatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }
}
