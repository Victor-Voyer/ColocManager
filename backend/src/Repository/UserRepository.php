<?php

namespace App\Repository;

use App\Entity\User;
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

    public function countExpensesPaid(User $user): int
    {
        return (int) $this->createQueryBuilder('u')
            ->select('COUNT(e.id)')
            ->join('u.expensesPaid', 'e')
            ->where('u = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function countExpenseShares(User $user): int
    {
        return (int) $this->createQueryBuilder('u')
            ->select('COUNT(es.id)')
            ->join('u.expenseShares', 'es')
            ->where('u = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function isSoleAdminOfColocationWithOtherMembers(User $user): bool
    {
        foreach ($user->getColocationMemberships() as $membership) {
            if ($membership->getRole() !== \App\Enum\ColocationRole::Admin) {
                continue;
            }

            $colocation = $membership->getColocation();
            $members = $colocation->getMemberships();

            if ($members->count() <= 1) {
                continue;
            }

            $adminCount = 0;
            foreach ($members as $member) {
                if ($member->getRole() === \App\Enum\ColocationRole::Admin) {
                    ++$adminCount;
                }
            }

            if ($adminCount === 1) {
                return true;
            }
        }

        return false;
    }
}
