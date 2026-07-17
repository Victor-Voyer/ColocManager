<?php

namespace App\Service\Expense;

use App\DTO\Expense\CreateExpenseDto;
use App\DTO\Expense\ExpenseShareInputDto;
use App\Entity\Colocation;
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

    public function create(User $user, int $colocationId, CreateExpenseDto $dto): array
    {
        $context = $this->accessChecker->resolveContext($user, $colocationId);
        $payer = $this->resolvePayer($dto->paidByUserId, $user, $context->colocation);
        $amount = number_format((float) $dto->amount, 2, '.', '');

        $this->assertShares($dto->shares, $payer, $context->colocation);
        $amountsByUserId = $this->resolveShareAmounts($dto->shares, $amount);

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
            $share->setAmountOwed($amountsByUserId[$shareInput->userId]);
            $share->setIsPaid($isPayer);
            $share->setPaidAt($isPayer ? new \DateTimeImmutable() : null);
            $expense->addShare($share);
        }

        $this->entityManager->persist($expense);
        $this->entityManager->flush();

        return $this->serializer->serialize($expense);
    }

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

    public function balances(User $user, int $colocationId): array
    {
        $context = $this->accessChecker->resolveContext($user, $colocationId);
        $colocation = $context->colocation;

        $totalPaid = $this->expenseRepository->getTotalPaidByMember($colocation);
        $totalOwed = $this->expenseShareRepository->getTotalOwedByMember($colocation);

        $members = [];
        foreach ($colocation->getMembers() as $member) {
            $userId = $member->getId();
            $paid = $totalPaid[$userId] ?? '0.00';
            $owed = $totalOwed[$userId] ?? '0.00';

            $members[] = [
                'userId' => $userId,
                'firstName' => $member->getFirstName(),
                'lastName' => $member->getLastName(),
                'totalPaid' => $paid,
                'totalOwed' => $owed,
                'balance' => $this->centsToAmount($this->toCents($paid) - $this->toCents($owed)),
            ];
        }

        return ['members' => $members];
    }

    public function show(User $user, int $colocationId, int $expenseId): array
    {
        $expense = $this->resolveExpense($user, $colocationId, $expenseId);

        return $this->serializer->serialize($expense);
    }

    public function delete(User $user, int $colocationId, int $expenseId): void
    {
        $expense = $this->resolveExpense($user, $colocationId, $expenseId);
        $this->entityManager->remove($expense);
        $this->entityManager->flush();
    }

    public function markShareAsPaid(User $user, int $expenseId, int $targetUserId): array
    {
        $share = $this->resolveShare($user, $expenseId, $targetUserId);

        $share->setIsPaid(true);
        $share->setPaidAt(new \DateTimeImmutable());
        $this->entityManager->flush();

        return $this->serializer->serializeShare($share);
    }

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

    private function resolveExpense(User $user, int $colocationId, int $expenseId): Expense
    {
        $this->accessChecker->resolveContext($user, $colocationId);

        $expense = $this->expenseRepository->find($expenseId);
        if ($expense === null || $expense->getColocation()->getId() !== $colocationId) {
            throw ApiException::notFound('Dépense introuvable.');
        }

        return $expense;
    }

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
     * @param list<ExpenseShareInputDto> $shares
     */
    private function assertShares(array $shares, User $payer, Colocation $colocation): void
    {
        $memberIds = array_map(
            fn (User $member): int => $member->getId(),
            $colocation->getMembers()->toArray(),
        );

        $seenUserIds = [];

        foreach ($shares as $shareInput) {
            if (!in_array($shareInput->userId, $memberIds, true)) {
                throw new ApiException(sprintf('L\'utilisateur %d n\'est pas membre de la colocation.', $shareInput->userId));
            }

            if (isset($seenUserIds[$shareInput->userId])) {
                throw new ApiException('Un membre ne peut avoir qu\'une seule part.');
            }
            $seenUserIds[$shareInput->userId] = true;
        }

        if (!isset($seenUserIds[$payer->getId()])) {
            throw new ApiException('Le payeur doit avoir une part explicite dans la répartition.');
        }
    }

    /**
     * Calcule le montant dû par membre : les parts explicites sont reprises
     * telles quelles, le reste du montant total est réparti également entre
     * les parts automatiques (amountOwed = null), au centime près.
     *
     * @param list<ExpenseShareInputDto> $shares
     *
     * @return array<int, string> montant (format décimal) indexé par userId
     */
    private function resolveShareAmounts(array $shares, string $amount): array
    {
        $explicitCents = 0;
        $autoUserIds = [];
        $amounts = [];

        foreach ($shares as $shareInput) {
            if ($shareInput->amountOwed === null) {
                $autoUserIds[] = $shareInput->userId;
                continue;
            }
            $cents = $this->toCents($shareInput->amountOwed);
            $explicitCents += $cents;
            $amounts[$shareInput->userId] = $this->centsToAmount($cents);
        }

        $autoCount = count($autoUserIds);
        if ($autoCount > 0) {
            $remainingCents = $this->toCents($amount) - $explicitCents;
            $baseCents = intdiv($remainingCents, $autoCount);
            $extraCents = $remainingCents % $autoCount;

            foreach ($autoUserIds as $index => $userId) {
                $amounts[$userId] = $this->centsToAmount($baseCents + ($index < $extraCents ? 1 : 0));
            }
        }

        return $amounts;
    }

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
