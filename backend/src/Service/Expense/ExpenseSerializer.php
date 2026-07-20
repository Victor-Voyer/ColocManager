<?php

namespace App\Service\Expense;

use App\Entity\Expense;
use App\Entity\ExpenseShare;

final class ExpenseSerializer
{
    public function serialize(Expense $expense): array
    {
        $paidBy = $expense->getPaidBy();
        $createdBy = $expense->getCreatedBy();

        return [
            'id' => $expense->getId(),
            'amount' => $expense->getAmount(),
            'description' => $expense->getDescription(),
            'category' => $expense->getCategory(),
            'expenseDate' => $expense->getExpenseDate()->format('Y-m-d'),
            'paidBy' => $paidBy === null ? null : [
                'id' => $paidBy->getId(),
                'firstName' => $paidBy->getFirstName(),
                'lastName' => $paidBy->getLastName(),
            ],
            'createdBy' => $createdBy === null ? null : [
                'id' => $createdBy->getId(),
                'firstName' => $createdBy->getFirstName(),
                'lastName' => $createdBy->getLastName(),
            ],
            'shares' => array_map(
                fn (ExpenseShare $share): array => $this->serializeShare($share),
                $expense->getShares()->toArray(),
            ),
            'createdAt' => $expense->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'updatedAt' => $expense->getUpdatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }

    public function serializeShare(ExpenseShare $share): array
    {
        $user = $share->getUser();

        return [
            'id' => $share->getId(),
            'userId' => $user?->getId(),
            'firstName' => $user?->getFirstName(),
            'lastName' => $user?->getLastName(),
            'amountOwed' => $share->getAmountOwed(),
            'isPaid' => $share->isPaid(),
            'paidAt' => $share->getPaidAt()?->format(\DateTimeInterface::ATOM),
        ];
    }
}
