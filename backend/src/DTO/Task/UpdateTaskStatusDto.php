<?php

namespace App\DTO\Task;

use Symfony\Component\Validator\Constraints as Assert;

class UpdateTaskStatusDto
{
    #[Assert\NotBlank]
    #[Assert\Choice(choices: ['pending', 'in_progress', 'done'])]
    public string $status = '';
}
