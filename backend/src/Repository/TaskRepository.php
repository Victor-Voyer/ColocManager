<?php

namespace App\Repository;

use App\Entity\Colocation;
use App\Entity\Task;
use App\Entity\User;
use App\Enum\TaskStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Task>
 */
class TaskRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Task::class);
    }

    /**
     * @return list<Task>
     */
    public function findByColocationFiltered(
        Colocation $colocation,
        ?TaskStatus $status = null,
        ?User $assignedTo = null,
        bool $history = false,
    ): array {
        $qb = $this->createQueryBuilder('t')
            ->leftJoin('t.assignedTo', 'assignedTo')
            ->addSelect('assignedTo')
            ->where('t.colocation = :colocation')
            ->setParameter('colocation', $colocation);

        if ($status !== null) {
            $qb->andWhere('t.status = :status')
                ->setParameter('status', $status);
        } elseif (!$history) {
            $qb->andWhere('t.status != :done')
                ->setParameter('done', TaskStatus::Done);
        }

        if ($assignedTo !== null) {
            $qb->andWhere('t.assignedTo = :assignedTo')
                ->setParameter('assignedTo', $assignedTo);
        }

        if ($history) {
            $qb->orderBy('t.completedAt', 'DESC')
                ->addOrderBy('t.updatedAt', 'DESC')
                ->setMaxResults(10);
        } else {
            $qb->orderBy('t.dueDate', 'ASC')
                ->addOrderBy('t.priority', 'DESC')
                ->addOrderBy('t.createdAt', 'DESC');
        }

        return $qb->getQuery()->getResult();
    }
}
