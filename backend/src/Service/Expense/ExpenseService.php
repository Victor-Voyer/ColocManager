<?php

namespace App\Service\Expense;

use App\DTO\Expense\CreateExpenseDto;
use App\DTO\Expense\UpdateExpenseDto;
use App\Entity\Colocation;
use App\Entity\Expense;
use App\Entity\ExpenseShare;
use App\Entity\User;
use App\Enum\SplitMode;
use App\Exception\ApiException;
use App\Model\Expense\ExpenseListFilters;
use App\Repository\ExpenseRepository;
use App\Repository\ExpenseShareRepository;
use App\Repository\UserRepository;
use App\Service\Colocation\ColocationAccessChecker;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Logique métier des dépenses.
 * Orchestre l'accès coloc, le calcul des parts, la persistance et la sérialisation.
 */
final class ExpenseService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly ColocationAccessChecker $accessChecker,
        private readonly ExpenseRepository $expenseRepository,
        private readonly ExpenseShareRepository $expenseShareRepository,
        private readonly UserRepository $userRepository,
        private readonly ExpenseShareCalculator $shareCalculator,
        private readonly ExpenseSerializer $serializer,
    ) {
    }

    /** Crée une dépense et calcule les parts selon le splitMode */
    public function create(User $user, int $colocationId, CreateExpenseDto $dto): array
    {
        $context = $this->accessChecker->resolveContext($user, $colocationId);
        $payer = $this->resolvePayer($dto->paidByUserId, $user, $context->colocation);
        $splitMode = SplitMode::from($dto->splitMode);

        $expense = new Expense();
        $expense->setColocation($context->colocation);
        $this->fillExpense($expense, $dto, $payer, $splitMode);

        $this->entityManager->persist($expense);
        $this->entityManager->flush();

        return $this->serializer->serialize($expense);
    }

    /** Liste paginée avec filtres optionnels */
    public function list(User $user, int $colocationId, ExpenseListFilters $filters): array
    {
        $context = $this->accessChecker->resolveContext($user, $colocationId);
        $offset = ($filters->page - 1) * $filters->limit;

        $expenses = $this->expenseRepository->findByColocationFiltered(
            $context->colocation,
            $filters->category,
            $filters->paidBy,
            $filters->from,
            $filters->to,
            $offset,
            $filters->limit,
        );

        $total = $this->expenseRepository->countByColocationFiltered(
            $context->colocation,
            $filters->category,
            $filters->paidBy,
            $filters->from,
            $filters->to,
        );

        return [
            'items' => array_map(fn (Expense $e) => $this->serializer->serialize($e), $expenses),
            'pagination' => [
                'page' => $filters->page,
                'limit' => $filters->limit,
                'total' => $total,
                'pages' => (int) ceil($total / $filters->limit),
            ],
        ];
    }

    /** Historique complet (max 1000 dépenses) */
    public function history(User $user, int $colocationId): array
    {
        $context = $this->accessChecker->resolveContext($user, $colocationId);

        $expenses = $this->expenseRepository->findByColocationFiltered(
            $context->colocation,
            null,
            null,
            null,
            null,
            0,
            1000,
        );

        return [
            'items' => array_map(fn (Expense $e) => $this->serializer->serialize($e), $expenses),
        ];
    }

    /** Calcule les soldes : balance = total payé − total dû */
    public function balances(User $user, int $colocationId): array
    {
        $context = $this->accessChecker->resolveContext($user, $colocationId);
        $colocation = $context->colocation;

        $totalPaid = $this->expenseRepository->getTotalPaidByMember($colocation);
        $totalOwed = $this->expenseShareRepository->getTotalOwedByMember($colocation);

        $members = [];
        foreach ($colocation->getMemberships() as $membership) {
            $member = $membership->getUser();
            $userId = $member->getId();
            $paid = $totalPaid[$userId] ?? '0.00';
            $owed = $totalOwed[$userId] ?? '0.00';

            $members[] = [
                'userId' => $userId,
                'firstName' => $member->getFirstName(),
                'lastName' => $member->getLastName(),
                'totalPaid' => $paid,
                'totalOwed' => $owed,
                'balance' => bcsub($paid, $owed, 2), // positif = créditeur, négatif = débiteur
            ];
        }

        return ['members' => $members];
    }

    /** Détail d'une dépense */
    public function show(User $user, int $colocationId, int $expenseId): array
    {
        $expense = $this->resolveExpense($user, $colocationId, $expenseId);

        return $this->serializer->serialize($expense);
    }

    /** Modifie une dépense — supprime les anciennes parts et recalcule */
    public function update(User $user, int $colocationId, int $expenseId, UpdateExpenseDto $dto): array
    {
        $expense = $this->resolveExpense($user, $colocationId, $expenseId);
        $payer = $this->resolvePayer($dto->paidByUserId, $user, $expense->getColocation());
        $splitMode = SplitMode::from($dto->splitMode);

        $this->clearShares($expense);
        $this->fillExpense($expense, $dto, $payer, $splitMode);
        $this->entityManager->flush();

        return $this->serializer->serialize($expense);
    }

    /** Supprime une dépense — les expense_shares sont supprimées en CASCADE */
    public function delete(User $user, int $colocationId, int $expenseId): void
    {
        $expense = $this->resolveExpense($user, $colocationId, $expenseId);
        $this->entityManager->remove($expense);
        $this->entityManager->flush();
    }

    /** Marque une part comme remboursée (isPaid = true, paidAt = now) */
    public function markShareAsPaid(User $user, int $expenseId, int $targetUserId): array
    {
        $expense = $this->expenseRepository->find($expenseId);
        if ($expense === null) {
            throw ApiException::notFound('Dépense introuvable.');
        }

        $this->accessChecker->requireMembership($user, $expense->getColocation());

        $targetUser = $this->userRepository->find($targetUserId);
        if ($targetUser === null) {
            throw ApiException::notFound('Utilisateur introuvable.');
        }

        $share = $this->expenseShareRepository->findOneByExpenseAndUser($expense, $targetUser);
        if ($share === null) {
            throw ApiException::notFound('Part de dépense introuvable.');
        }

        $share->setIsPaid(true);
        $share->setPaidAt(new \DateTimeImmutable());
        $this->entityManager->flush();

        return $this->serializer->serializeShare($share);
    }

    /** Vérifie l'accès coloc + que la dépense appartient bien à cette coloc */
    private function resolveExpense(User $user, int $colocationId, int $expenseId): Expense
    {
        $this->accessChecker->resolveContext($user, $colocationId);

        $expense = $this->expenseRepository->find($expenseId);
        if ($expense === null || $expense->getColocation()->getId() !== $colocationId) {
            throw ApiException::notFound('Dépense introuvable.');
        }

        return $expense;
    }

    /** Résout le payeur — par défaut l'utilisateur connecté, doit être membre de la coloc */
    private function resolvePayer(?int $paidByUserId, User $currentUser, Colocation $colocation): User
    {
        $payer = $paidByUserId !== null ? $this->userRepository->find($paidByUserId) : $currentUser;

        if ($payer === null) {
            throw ApiException::notFound('Payeur introuvable.');
        }

        $this->accessChecker->requireMembership($payer, $colocation);

        return $payer;
    }

    /** Remplit une dépense et crée ses parts via ExpenseShareCalculator */
    private function fillExpense(
        Expense $expense,
        CreateExpenseDto|UpdateExpenseDto $dto,
        User $payer,
        SplitMode $splitMode,
    ): void {
        $amount = number_format((float) $dto->amount, 2, '.', '');
        $shareData = $this->shareCalculator->compute($amount, $splitMode, $expense->getColocation(), $dto, $payer);

        $expense->setPaidBy($payer);
        $expense->setAmount($amount);
        $expense->setDescription($dto->description);
        $expense->setCategory($dto->category);
        $expense->setSplitMode($splitMode);
        $expense->setExpenseDate($this->parseDate($dto->expenseDate));

        foreach ($shareData as $userId => $data) {
            $member = $this->userRepository->find($userId);
            if ($member === null) {
                continue;
            }

            $share = new ExpenseShare();
            $share->setUser($member);
            $share->setAmountOwed($data['amountOwed']);
            $share->setPercentage($splitMode === SplitMode::Weighted ? $data['percentage'] : null);
            $expense->addShare($share);
        }
    }

    /** Supprime toutes les parts existantes avant recalcul (update) */
    private function clearShares(Expense $expense): void
    {
        foreach ($expense->getShares()->toArray() as $share) {
            $expense->removeShare($share);
            $this->entityManager->remove($share);
        }
    }

    private function parseDate(?string $date): \DateTimeImmutable
    {
        if ($date === null || $date === '') {
            return new \DateTimeImmutable('today');
        }

        $parsed = \DateTimeImmutable::createFromFormat('Y-m-d', $date);

        return $parsed === false ? new \DateTimeImmutable('today') : $parsed;
    }
}
