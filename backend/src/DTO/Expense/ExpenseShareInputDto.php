<?php

namespace App\DTO\Expense;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Représente une part de dépense saisie manuellement par le créateur.
 * Utilisé dans le tableau shares[] de CreateExpenseDto.
 */
class ExpenseShareInputDto
{
    #[Assert\NotBlank]
    #[Assert\Positive]
    public int $userId = 0;

    #[Assert\NotBlank]
    #[Assert\Positive]
    public string $amountOwed = '0.00';
}
