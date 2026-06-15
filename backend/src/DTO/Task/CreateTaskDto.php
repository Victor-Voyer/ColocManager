<?php

namespace App\DTO\Task;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO pour creer une tache.
 * Reprensente le JSON envoye sur POST /api/colocations/{id}/tasks.
 */
class CreateTaskDto
{
    #[Assert\NotBlank]
    #[Assert\Length(max: 255)]
    public string $title = '';

    #[Assert\Length(max: 2000)]
    public ?string $description = null;

    #[Assert\Choice(choices: ['pending', 'done'])]
    public string $status = 'pending';

    #[Assert\Choice(choices: ['low', 'medium', 'high'])]
    public string $priority = 'medium';

    #[Assert\Choice(choices: ['none', 'daily', 'weekly', 'monthly'])]
    public string $recurrence = 'none';

    /** Format Y-m-d */
    public ?string $dueDate = null;

    /** ID du membre assigne, nullable si la tache est geree par rotation */
    #[Assert\Positive]
    public ?int $assignedToUserId = null;

    /** Ordre des membres pour les taches recurrentes */
    #[Assert\All([new Assert\Positive()])]
    public array $rotationMemberUserIds = [];
}
