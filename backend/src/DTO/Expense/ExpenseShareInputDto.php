<?php

namespace App\DTO\Expense;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Représente une part de dépense pour les modes weighted et custom.
 * Utilisé dans le tableau shares[] de CreateExpenseDto / UpdateExpenseDto.
 */
class ExpenseShareInputDto
{
    #[Assert\NotBlank]
    #[Assert\Positive]
    public int $userId = 0;

    /** Utilisé si splitMode = weighted (somme des % = 100) */
    #[Assert\Positive]
    public ?string $percentage = null;

    /** Utilisé si splitMode = custom (somme des montants = montant total) */
    #[Assert\Positive]
    public ?string $amountOwed = null;
}
