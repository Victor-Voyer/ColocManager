<?php

namespace App\DTO\Expense;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO pour modifier une dépense.
 * Représente le JSON envoyé sur PUT /api/colocations/{id}/expenses/{expenseId}.
 * Même structure que CreateExpenseDto — les parts sont recalculées à chaque modification.
 */
class UpdateExpenseDto
{
    #[Assert\NotBlank]
    #[Assert\Positive]
    public string $amount = '0.00';

    #[Assert\NotBlank]
    #[Assert\Length(max: 500)]
    public string $description = '';

    #[Assert\Length(max: 100)]
    public ?string $category = null;

    #[Assert\NotBlank]
    #[Assert\Choice(choices: ['equal', 'weighted', 'custom'])]
    public string $splitMode = 'equal';

    /** Format Y-m-d */
    public ?string $expenseDate = null;

    #[Assert\Positive]
    public ?int $paidByUserId = null;

    #[Assert\All([new Assert\Positive()])]
    public array $participantUserIds = [];

    #[Assert\Valid]
    public array $shares = [];
}
