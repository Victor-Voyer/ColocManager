<?php

namespace App\Service\Expense;

use App\Entity\Expense;
use App\Entity\ExpenseShare;
use App\Service\User\UserSummarySerializer;

final class ExpenseSerializer
{
    public function __construct(
        private readonly UserSummarySerializer $userSummarySerializer,
    ) {
    }

    public function serialize(Expense $expense): array
    {
        return [
            'id' => $expense->getId(),
            'amount' => $expense->getAmount(),
            'description' => $expense->getDescription(),
            'category' => $expense->getCategory(),
            'expenseDate' => $expense->getExpenseDate()->format('Y-m-d'),
            'paidBy' => $this->userSummarySerializer->toSummary($expense->getPaidBy()),
            'createdBy' => $this->userSummarySerializer->toSummary($expense->getCreatedBy()),
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
