<?php

namespace App\Security\Voter;

use App\Entity\Expense;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class ExpenseShareVoter extends Voter
{
    public const MANAGE_REPAYMENT = 'EXPENSE_SHARE_MANAGE_REPAYMENT';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $attribute === self::MANAGE_REPAYMENT && $subject instanceof Expense;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        /** @var Expense $expense */
        $expense = $subject;

        if ($user->getColocation()?->getId() !== $expense->getColocation()->getId()) {
            return false;
        }

        return $expense->getCreatedBy()?->getId() === $user->getId();
    }
}
