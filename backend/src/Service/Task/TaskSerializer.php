<?php

namespace App\Service\Task;

use App\Entity\Task;
use App\Entity\TaskRotationMember;

/** Transforme les entites Task et TaskRotationMember en tableaux JSON */
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
            'recurrence' => $task->getRecurrence()->value,
            'rotationIndex' => $task->getRotationIndex(),
            'dueDate' => $task->getDueDate()?->format('Y-m-d'),
            'completedAt' => $task->getCompletedAt()?->format(\DateTimeInterface::ATOM),
            'assignedTo' => $assignedTo === null ? null : [
                'id' => $assignedTo->getId(),
                'firstName' => $assignedTo->getFirstName(),
                'lastName' => $assignedTo->getLastName(),
            ],
            'rotationMembers' => array_map(
                fn (TaskRotationMember $member): array => $this->serializeRotationMember($member),
                $this->sortedRotationMembers($task),
            ),
            'createdAt' => $task->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'updatedAt' => $task->getUpdatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }

    public function serializeRotationMember(TaskRotationMember $rotationMember): array
    {
        $user = $rotationMember->getUser();

        return [
            'userId' => $user->getId(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'position' => $rotationMember->getPosition(),
        ];
    }

    /** @return list<TaskRotationMember> */
    private function sortedRotationMembers(Task $task): array
    {
        $members = $task->getRotationMembers()->toArray();
        usort($members, fn (TaskRotationMember $a, TaskRotationMember $b): int => $a->getPosition() <=> $b->getPosition());

        return $members;
    }
}
