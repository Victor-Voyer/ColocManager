<?php

namespace App\DTO\Task;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO pour modifier une tache.
 * Meme structure que CreateTaskDto, utilisee sur PUT /api/colocations/{id}/tasks/{taskId}.
 */
class UpdateTaskDto
{
    #[Assert\NotBlank]
    #[Assert\Length(max: 255)]
    public string $title = '';

    #[Assert\Length(max: 2000)]
    public ?string $description = null;

    #[Assert\Choice(choices: ['pending', 'in_progress', 'done'])]
    public string $status = 'pending';

    #[Assert\Choice(choices: ['low', 'medium', 'high'])]
    public string $priority = 'medium';

    #[Assert\Choice(choices: ['none', 'daily', 'weekly', 'monthly'])]
    public string $recurrence = 'none';

    /** Format Y-m-d */
    public ?string $dueDate = null;

    #[Assert\Positive]
    public ?int $assignedToUserId = null;

    #[Assert\All([new Assert\Positive()])]
    public array $rotationMemberUserIds = [];
}
