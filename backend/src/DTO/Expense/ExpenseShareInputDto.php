<?php

namespace App\DTO\Expense;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Représente la part d'un membre dans une dépense.
 * Utilisé dans le tableau shares[] de CreateExpenseDto.
 *
 * `amountOwed` est optionnel : laissé à `null`, le montant est calculé
 * automatiquement (répartition égale du reste à répartir) ; renseigné, il
 * remplace ce calcul par un montant précis pour ce membre.
 */
class ExpenseShareInputDto
{
    #[Assert\NotBlank]
    #[Assert\Positive]
    public int $userId = 0;

    #[Assert\Positive]
    public ?string $amountOwed = null;
}
