<?php

namespace App\Security\Voter;

use App\Entity\Task;
use App\Entity\User;
use App\Enum\ColocationRole;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class TaskVoter extends Voter
{
    public const MANAGE = 'TASK_MANAGE';
    public const CHANGE_STATUS = 'TASK_CHANGE_STATUS';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [self::MANAGE, self::CHANGE_STATUS], true)
            && $subject instanceof Task;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        /** @var Task $task */
        $task = $subject;

        if ($user->getColocation()?->getId() !== $task->getColocation()->getId()) {
            return false;
        }

        $isCreator = $task->getCreatedBy()?->getId() === $user->getId();
        $isAssigned = $task->getAssignedTo()?->getId() === $user->getId();
        $isAdmin = $user->getRole() === ColocationRole::Admin;

        if ($attribute === self::MANAGE) {
            return $isCreator || $isAdmin;
        }

        return $isCreator || $isAssigned || $isAdmin;
    }
}
