<?php

namespace App\Service\Task;

use App\Entity\Task;

/** Transforme l'entite Task en tableau JSON */
final class TaskSerializer
{
    public function serialize(Task $task): array
    {
        $assignedTo = $task->getAssignedTo();

        return [
            'id' => $task->getId(),
            'title' => $task->getTitle(),
            'description' => $task->getDescription(),
            'status' => $task->getStatus()->value,
            'priority' => $task->getPriority()->value,
            'dueDate' => $task->getDueDate()?->format('Y-m-d'),
            'completedAt' => $task->getCompletedAt()?->format(\DateTimeInterface::ATOM),
            'assignedTo' => $assignedTo === null ? null : [
                'id' => $assignedTo->getId(),
                'firstName' => $assignedTo->getFirstName(),
                'lastName' => $assignedTo->getLastName(),
            ],
            'createdAt' => $task->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'updatedAt' => $task->getUpdatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }
}
