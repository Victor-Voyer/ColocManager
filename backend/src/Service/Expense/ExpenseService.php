<?php

namespace App\Service\Expense;

use App\DTO\Expense\CreateExpenseDto;
use App\DTO\Expense\ExpenseShareInputDto;
use App\Entity\Colocation;
use App\Entity\ColocationUser;
use App\Entity\Expense;
use App\Entity\ExpenseShare;
use App\Entity\User;
use App\Exception\ApiException;
use App\Model\Expense\ExpenseListFilters;
use App\Repository\ExpenseRepository;
use App\Repository\ExpenseShareRepository;
use App\Repository\UserRepository;
use App\Service\Colocation\ColocationAccessChecker;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Logique métier des dépenses.
 * Orchestre l'accès coloc, la validation de la répartition manuelle, la persistance et la sérialisation.
 */
final class ExpenseService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly ColocationAccessChecker $accessChecker,
        private readonly ExpenseRepository $expenseRepository,
        private readonly ExpenseShareRepository $expenseShareRepository,
        private readonly UserRepository $userRepository,
        private readonly ExpenseSerializer $serializer,
    ) {
    }

    /** Crée une dépense avec sa répartition saisie manuellement par le créateur */
    public function create(User $user, int $colocationId, CreateExpenseDto $dto): array
    {
        $context = $this->accessChecker->resolveContext($user, $colocationId);
        $payer = $this->resolvePayer($dto->paidByUserId, $user, $context->colocation);
        $amount = number_format((float) $dto->amount, 2, '.', '');

        $this->assertShares($dto->shares, $amount, $payer, $context->colocation);

        $expense = new Expense();
        $expense->setColocation($context->colocation);
        $expense->setPaidBy($payer);
        $expense->setAmount($amount);
        $expense->setDescription($dto->description);
        $expense->setCategory($dto->category);
        $expense->setExpenseDate($this->parseDate($dto->expenseDate));

        foreach ($dto->shares as $shareInput) {
            $member = $this->userRepository->find($shareInput->userId);
            $isPayer = $member->getId() === $payer->getId();

            $share = new ExpenseShare();
            $share->setUser($member);
            $share->setAmountOwed(number_format((float) $shareInput->amountOwed, 2, '.', ''));
            $share->setIsPaid($isPayer);
            $share->setPaidAt($isPayer ? new \DateTimeImmutable() : null);
            $expense->addShare($share);
        }

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
                'balance' => $this->centsToAmount($this->toCents($paid) - $this->toCents($owed)), // positif = créditeur, négatif = débiteur
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
        $share = $this->resolveShare($user, $expenseId, $targetUserId);

        $share->setIsPaid(true);
        $share->setPaidAt(new \DateTimeImmutable());
        $this->entityManager->flush();

        return $this->serializer->serializeShare($share);
    }

    /** Annule le remboursement d'une part (isPaid = false, paidAt = null) */
    public function markShareAsUnpaid(User $user, int $expenseId, int $targetUserId): array
    {
        $share = $this->resolveShare($user, $expenseId, $targetUserId);

        if (!$share->isPaid()) {
            throw new ApiException('Cette part n\'est pas marquée comme remboursée.');
        }

        $share->setIsPaid(false);
        $share->setPaidAt(null);
        $this->entityManager->flush();

        return $this->serializer->serializeShare($share);
    }

    private function resolveShare(User $user, int $expenseId, int $targetUserId): ExpenseShare
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

        return $share;
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

    /**
     * Valide la répartition saisie manuellement (règle 4 et 5) :
     * - chaque userId doit être membre de la colocation,
     * - un seul montant par membre,
     * - le payeur doit avoir une ligne explicite,
     * - la somme des montants doit être strictement égale au montant total.
     *
     * @param list<ExpenseShareInputDto> $shares
     */
    private function assertShares(array $shares, string $amount, User $payer, Colocation $colocation): void
    {
        $memberIds = array_map(
            fn (ColocationUser $membership): int => $membership->getUser()->getId(),
            $colocation->getMemberships()->toArray(),
        );

        $seenUserIds = [];
        $totalCents = 0;

        foreach ($shares as $shareInput) {
            if (!in_array($shareInput->userId, $memberIds, true)) {
                throw new ApiException(sprintf('L\'utilisateur %d n\'est pas membre de la colocation.', $shareInput->userId));
            }

            if (isset($seenUserIds[$shareInput->userId])) {
                throw new ApiException('Un membre ne peut avoir qu\'une seule part.');
            }
            $seenUserIds[$shareInput->userId] = true;

            $totalCents += $this->toCents($shareInput->amountOwed);
        }

        if (!isset($seenUserIds[$payer->getId()])) {
            throw new ApiException('Le payeur doit avoir une part explicite dans la répartition.');
        }

        if ($totalCents !== $this->toCents($amount)) {
            throw new ApiException('La somme des parts doit être égale au montant total.');
        }
    }

    /** Convertit un montant décimal ("12.34") en centimes entiers, pour éviter les erreurs d'arrondi en float (pas d'ext bcmath disponible) */
    private function toCents(string $amount): int
    {
        return (int) round((float) $amount * 100);
    }

    private function centsToAmount(int $cents): string
    {
        return number_format($cents / 100, 2, '.', '');
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
