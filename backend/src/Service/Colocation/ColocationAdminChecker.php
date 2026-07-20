<?php

namespace App\Service\Colocation;

use App\Entity\Colocation;
use App\Entity\User;
use App\Enum\ColocationRole;

final class ColocationAdminChecker
{
    public function isSoleAdmin(User $user, Colocation $colocation): bool
    {
        if ($user->getRole() !== ColocationRole::Admin) {
            return false;
        }

        $members = $colocation->getMembers();
        if ($members->count() <= 1) {
            return false;
        }

        $adminCount = 0;
        foreach ($members as $member) {
            if ($member->getRole() === ColocationRole::Admin) {
                ++$adminCount;
            }
        }

        return $adminCount === 1;
    }

    public function isSoleAdminOfColocationWithOtherMembers(User $user): bool
    {
        if ($user->getRole() !== ColocationRole::Admin || $user->getColocation() === null) {
            return false;
        }

        return $this->isSoleAdmin($user, $user->getColocation());
    }
}
