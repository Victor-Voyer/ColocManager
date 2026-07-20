<?php

namespace App\Security\Voter;

use App\Entity\Colocation;
use App\Entity\User;
use App\Enum\ColocationRole;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class ColocationVoter extends Voter
{
    public const ADMIN = 'COLOCATION_ADMIN';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $attribute === self::ADMIN && $subject instanceof Colocation;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        /** @var Colocation $colocation */
        $colocation = $subject;

        $isMember = $user->getColocation()?->getId() === $colocation->getId();
        $isAdmin = $user->getRole() === ColocationRole::Admin;

        return $isMember && $isAdmin;
    }
}
