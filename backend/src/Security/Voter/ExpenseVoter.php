<?php

namespace App\Security\Voter;

use App\Entity\Expense;
use App\Entity\User;
use App\Enum\ColocationRole;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

/**
 * Autorise la suppression d'une dépense au payeur (celui qui l'a avancée)
 * ou à l'administrateur de la colocation. Un simple membre ne peut pas
 * supprimer la dépense de quelqu'un d'autre.
 */
final class ExpenseVoter extends Voter
{
    public const DELETE = 'EXPENSE_DELETE';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $attribute === self::DELETE && $subject instanceof Expense;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        /** @var Expense $expense */
        $expense = $subject;

        $isPayer = $expense->getPaidBy() !== null && $expense->getPaidBy()->getId() === $user->getId();
        $isAdmin = $user->getRole() === ColocationRole::Admin;

        return $isPayer || $isAdmin;
    }
}
