<?php

namespace App\Repository;

use App\Entity\Colocation;
use App\Entity\Expense;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Expense>
 */
class ExpenseRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Expense::class);
    }

    /** Liste filtrée et paginée pour une colocation */
    public function findByColocationFiltered(
        Colocation $colocation,
        ?string $category,
        ?int $paidByUserId,
        ?\DateTimeImmutable $from,
        ?\DateTimeImmutable $to,
        int $offset,
        int $limit,
    ): array {
        return $this->buildFilteredQuery($colocation, $category, $paidByUserId, $from, $to)
            ->orderBy('e.expenseDate', 'DESC')
            ->addOrderBy('e.createdAt', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /** Compte le total pour la pagination */
    public function countByColocationFiltered(
        Colocation $colocation,
        ?string $category,
        ?int $paidByUserId,
        ?\DateTimeImmutable $from,
        ?\DateTimeImmutable $to,
    ): int {
        return (int) $this->buildFilteredQuery($colocation, $category, $paidByUserId, $from, $to)
            ->select('COUNT(e.id)')
            ->getQuery()
            ->getSingleScalarResult();
    }

    /** Total payé par membre — utilisé pour le calcul des soldes */
    public function getTotalPaidByMember(Colocation $colocation): array
    {
        $rows = $this->createQueryBuilder('e')
            ->select('IDENTITY(e.paidBy) AS userId', 'SUM(e.amount) AS totalPaid')
            ->where('e.colocation = :colocation')
            ->setParameter('colocation', $colocation)
            ->groupBy('e.paidBy')
            ->getQuery()
            ->getArrayResult();

        $result = [];
        foreach ($rows as $row) {
            $result[(int) $row['userId']] = number_format((float) $row['totalPaid'], 2, '.', '');
        }

        return $result;
    }

    private function buildFilteredQuery(
        Colocation $colocation,
        ?string $category,
        ?int $paidByUserId,
        ?\DateTimeImmutable $from,
        ?\DateTimeImmutable $to,
    ): \Doctrine\ORM\QueryBuilder {
        $qb = $this->createQueryBuilder('e')
            ->leftJoin('e.shares', 's')->addSelect('s')
            ->leftJoin('e.paidBy', 'pb')->addSelect('pb')
            ->leftJoin('e.createdBy', 'cb')->addSelect('cb')
            ->leftJoin('s.user', 'su')->addSelect('su')
            ->where('e.colocation = :colocation')
            ->setParameter('colocation', $colocation);

        if ($category !== null) {
            $qb->andWhere('e.category = :category')->setParameter('category', $category);
        }

        if ($paidByUserId !== null) {
            $qb->andWhere('IDENTITY(e.paidBy) = :paidByUserId')->setParameter('paidByUserId', $paidByUserId);
        }

        if ($from !== null) {
            $qb->andWhere('e.expenseDate >= :from')->setParameter('from', $from);
        }

        if ($to !== null) {
            $qb->andWhere('e.expenseDate <= :to')->setParameter('to', $to);
        }

        return $qb;
    }
}
