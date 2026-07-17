<?php

namespace App\DTO\Expense;

use App\Validator\Constraints\SharesSumMatchesAmount;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO pour créer une dépense.
 * Représente le JSON envoyé sur POST /api/colocations/{id}/expenses.
 *
 * Une ligne par membre concerné par la répartition. Le payeur n'a pas
 * besoin d'y figurer : il peut avoir avancé la totalité pour le compte
 * d'un autre membre. Par défaut, le montant total est réparti également
 * entre les membres dont `amountOwed` est omis ; le créateur peut
 * renseigner un montant précis pour un membre afin de sortir du calcul
 * automatique. La somme des montants doit rester égale au montant total
 * (règle 5).
 */
#[SharesSumMatchesAmount]
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
     * Une ligne par membre concerné par la répartition (le payeur n'est pas
     * obligatoire s'il ne doit rien lui-même).
     *
     * @var ExpenseShareInputDto[]
     */
    #[Assert\Count(min: 1)]
    #[Assert\Valid]
    public array $shares = [];
}
