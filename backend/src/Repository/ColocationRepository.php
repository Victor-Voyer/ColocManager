<?php

namespace App\Repository;

use App\Entity\Colocation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Colocation>
 */
class ColocationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Colocation::class);
    }

    public function findOneByInvitationCode(string $invitationCode): ?Colocation
    {
        return $this->findOneBy(['invitationCode' => $invitationCode]);
    }

    public function countExpenses(Colocation $colocation): int
    {
        return (int) $this->createQueryBuilder('c')
            ->select('COUNT(e.id)')
            ->join('c.expenses', 'e')
            ->where('c = :colocation')
            ->setParameter('colocation', $colocation)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
