<?php

namespace App\DTO\Task;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Champs communs pour la création et la modification d'une tâche.
 */
class TaskInputDto
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

    /** Format Y-m-d */
    public ?string $dueDate = null;

    #[Assert\Positive]
    public ?int $assignedToUserId = null;
}
