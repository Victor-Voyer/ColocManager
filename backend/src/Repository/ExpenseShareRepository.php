<?php

namespace App\Repository;

use App\Entity\Colocation;
use App\Entity\Expense;
use App\Entity\ExpenseShare;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ExpenseShare>
 */
class ExpenseShareRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ExpenseShare::class);
    }

    public function findOneByExpenseAndUser(Expense $expense, User $user): ?ExpenseShare
    {
        return $this->findOneBy([
            'expense' => $expense,
            'user' => $user,
        ]);
    }

    /** Total dû par membre — utilisé pour le calcul des soldes */
    public function getTotalOwedByMember(Colocation $colocation): array
    {
        $rows = $this->createQueryBuilder('es')
            ->select('IDENTITY(es.user) AS userId', 'SUM(es.amountOwed) AS totalOwed')
            ->join('es.expense', 'e')
            ->where('e.colocation = :colocation')
            ->setParameter('colocation', $colocation)
            ->groupBy('es.user')
            ->getQuery()
            ->getArrayResult();

        $result = [];
        foreach ($rows as $row) {
            $result[(int) $row['userId']] = number_format((float) $row['totalOwed'], 2, '.', '');
        }

        return $result;
    }

    /**
     * Retourne true si l'utilisateur a une dette active :
     * - débiteur : il doit de l'argent (sa part n'est pas payée)
     * - créancier : il a payé et d'autres membres lui doivent encore de l'argent
     */
    public function hasActiveDebt(User $user): bool
    {
        $asDebtor = (int) $this->createQueryBuilder('es')
            ->select('COUNT(es.id)')
            ->where('es.user = :user')
            ->andWhere('es.isPaid = false')
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult();

        if ($asDebtor > 0) {
            return true;
        }

        $asCreditor = (int) $this->createQueryBuilder('es')
            ->select('COUNT(es.id)')
            ->join('es.expense', 'e')
            ->where('e.paidBy = :user')
            ->andWhere('es.user != :user')
            ->andWhere('es.isPaid = false')
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult();

        return $asCreditor > 0;
    }
}
