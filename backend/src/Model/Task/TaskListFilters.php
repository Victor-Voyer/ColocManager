<?php

namespace App\Model\Task;

use App\Exception\ApiException;
use App\Enum\TaskStatus;
use Symfony\Component\HttpFoundation\Request;

final readonly class TaskListFilters
{
    public function __construct(
        public ?TaskStatus $status,
        public ?int $assignedToUserId,
    ) {
    }

    public static function fromRequest(Request $request): self
    {
        $statusRaw = $request->query->get('status');
        $status = null;

        if (is_string($statusRaw) && $statusRaw !== '') {
            $status = TaskStatus::tryFrom($statusRaw)
                ?? throw new ApiException('Statut de tâche invalide.');
        }

        $assignedTo = $request->query->getInt('assignedTo') > 0
            ? $request->query->getInt('assignedTo')
            : null;

        return new self($status, $assignedTo);
    }
}
