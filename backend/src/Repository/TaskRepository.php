<?php

namespace App\Repository;

use App\Entity\Colocation;
use App\Entity\Task;
use App\Entity\User;
use App\Enum\TaskPriority;
use App\Enum\TaskRecurrence;
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
            ->leftJoin('t.rotationMembers', 'rotationMembers')
            ->addSelect('rotationMembers')
            ->leftJoin('rotationMembers.user', 'rotationUser')
            ->addSelect('rotationUser')
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

    public function countActiveRecurringByAssigneeAndPriority(
        Colocation $colocation,
        User $assignedTo,
        TaskPriority $priority,
        ?int $excludeTaskId = null,
    ): int {
        $qb = $this->createQueryBuilder('t')
            ->select('COUNT(t.id)')
            ->where('t.colocation = :colocation')
            ->andWhere('t.assignedTo = :assignedTo')
            ->andWhere('t.priority = :priority')
            ->andWhere('t.recurrence != :none')
            ->andWhere('t.status != :done')
            ->setParameter('colocation', $colocation)
            ->setParameter('assignedTo', $assignedTo)
            ->setParameter('priority', $priority)
            ->setParameter('none', TaskRecurrence::None)
            ->setParameter('done', TaskStatus::Done);

        if ($excludeTaskId !== null) {
            $qb->andWhere('t.id != :excludeTaskId')
                ->setParameter('excludeTaskId', $excludeTaskId);
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }
}
