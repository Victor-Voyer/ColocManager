<?php

namespace App\Repository;

use App\Entity\User;
use App\Enum\ColocationRole;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<User>
 */
class UserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    public function isSoleAdminOfColocationWithOtherMembers(User $user): bool
    {
        if ($user->getRole() !== ColocationRole::Admin || $user->getColocation() === null) {
            return false;
        }

        $colocation = $user->getColocation();
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
}
