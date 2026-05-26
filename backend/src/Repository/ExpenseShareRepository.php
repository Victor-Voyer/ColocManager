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

    /** Trouve la part d'un membre pour une dépense donnée */
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
}
