<?php

namespace App\Repository;

use App\Entity\Colocation;
use App\Entity\ColocationUser;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ColocationUser>
 */
class ColocationUserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ColocationUser::class);
    }

    public function findOneByUserAndColocation(User $user, Colocation $colocation): ?ColocationUser
    {
        return $this->findOneBy([
            'user' => $user,
            'colocation' => $colocation,
        ]);
    }

    public function findOneByUserAndColocationId(User $user, int $colocationId): ?ColocationUser
    {
        return $this->createQueryBuilder('cu')
            ->join('cu.colocation', 'c')
            ->where('cu.user = :user')
            ->andWhere('c.id = :colocationId')
            ->setParameter('user', $user)
            ->setParameter('colocationId', $colocationId)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function countAdmins(Colocation $colocation): int
    {
        return (int) $this->createQueryBuilder('cu')
            ->select('COUNT(cu.user)')
            ->where('cu.colocation = :colocation')
            ->andWhere('cu.role = :role')
            ->setParameter('colocation', $colocation)
            ->setParameter('role', \App\Enum\ColocationRole::Admin)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
