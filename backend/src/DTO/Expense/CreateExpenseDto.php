<?php

namespace App\DTO\Expense;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO pour créer une dépense.
 * Représente le JSON envoyé sur POST /api/colocations/{id}/expenses.
 *
 * La répartition est saisie manuellement par le créateur : une ligne par
 * membre concerné (payeur inclus), avec un montant explicite. La somme des
 * montants doit être strictement égale au montant total (règle 5).
 */
class CreateExpenseDto
{
    #[Assert\NotBlank]
    #[Assert\Positive]
    public string $amount = '0.00';

    #[Assert\NotBlank]
    #[Assert\Length(max: 500)]
    public string $description = '';

    #[Assert\Length(max: 100)]
    public ?string $category = null;

    /** Format Y-m-d — par défaut aujourd'hui si omis */
    public ?string $expenseDate = null;

    /** ID du payeur — par défaut l'utilisateur connecté */
    #[Assert\Positive]
    public ?int $paidByUserId = null;

    /**
     * Parts saisies manuellement — une ligne par membre concerné, payeur inclus.
     *
     * @var ExpenseShareInputDto[]
     */
    #[Assert\Count(min: 1)]
    #[Assert\Valid]
    public array $shares = [];
}
