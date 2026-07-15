<?php

namespace App\Service\Expense;

use App\Entity\Expense;
use App\Entity\ExpenseShare;

/** Transforme les entités Expense et ExpenseShare en tableaux JSON */
final class ExpenseSerializer
{
    /** Transforme une dépense complète (avec parts et payeur) en JSON */
    public function serialize(Expense $expense): array
    {
        $paidBy = $expense->getPaidBy();

        return [
            'id' => $expense->getId(),
            'amount' => $expense->getAmount(),
            'description' => $expense->getDescription(),
            'category' => $expense->getCategory(),
            'expenseDate' => $expense->getExpenseDate()->format('Y-m-d'),
            'paidBy' => [
                'id' => $paidBy->getId(),
                'firstName' => $paidBy->getFirstName(),
                'lastName' => $paidBy->getLastName(),
            ],
            'shares' => array_map(
                fn (ExpenseShare $share): array => $this->serializeShare($share),
                $expense->getShares()->toArray(),
            ),
            'createdAt' => $expense->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'updatedAt' => $expense->getUpdatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }

    /** Transforme une part de dépense en JSON */
    public function serializeShare(ExpenseShare $share): array
    {
        $user = $share->getUser();

        return [
            'id' => $share->getId(),
            'userId' => $user->getId(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'amountOwed' => $share->getAmountOwed(),
            'isPaid' => $share->isPaid(),
            'paidAt' => $share->getPaidAt()?->format(\DateTimeInterface::ATOM),
        ];
    }
}
