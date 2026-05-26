<?php

namespace App\Service\Expense;

use App\DTO\Expense\CreateExpenseDto;
use App\DTO\Expense\UpdateExpenseDto;
use App\Entity\Colocation;
use App\Entity\ColocationUser;
use App\Entity\User;
use App\Enum\SplitMode;
use App\Exception\ApiException;

/**
 * Calcule les parts de dépense selon le mode de répartition.
 * Chaque membre reçoit un montant amountOwed (+ percentage si weighted).
 */
final class ExpenseShareCalculator
{
    public function compute(
        string $amount,
        SplitMode $splitMode,
        Colocation $colocation,
        CreateExpenseDto|UpdateExpenseDto $dto,
        User $payer,
    ): array {
        $formattedAmount = number_format((float) $amount, 2, '.', '');

        return match ($splitMode) {
            SplitMode::Equal => $this->computeEqual($formattedAmount, $colocation, $dto, $payer),
            SplitMode::Weighted => $this->computeWeighted($formattedAmount, $colocation, $dto),
            SplitMode::Custom => $this->computeCustom($formattedAmount, $colocation, $dto),
        };
    }

    /** Répartition équitable — le centime restant va au payeur */
    private function computeEqual(
        string $amount,
        Colocation $colocation,
        CreateExpenseDto|UpdateExpenseDto $dto,
        User $payer,
    ): array {
        $participantIds = $dto->participantUserIds !== []
            ? $dto->participantUserIds
            : $this->getMemberIds($colocation);

        if ($participantIds === []) {
            throw new ApiException('Aucun membre participant.');
        }

        $this->assertMembers($participantIds, $colocation);

        $totalCents = (int) round((float) $amount * 100);
        $baseCents = intdiv($totalCents, count($participantIds));
        $remainder = $totalCents - ($baseCents * count($participantIds));

        // Centime restant attribué au payeur (ou au 1er participant si payeur absent)
        $recipientId = in_array($payer->getId(), $participantIds, true)
            ? $payer->getId()
            : $participantIds[0];

        $shares = [];
        foreach ($participantIds as $userId) {
            $cents = $baseCents + ($userId === $recipientId ? $remainder : 0);
            $shares[$userId] = ['amountOwed' => number_format($cents / 100, 2, '.', ''), 'percentage' => null];
        }

        return $shares;
    }

    /** Répartition pondérée — pourcentages libres, somme = 100 % */
    private function computeWeighted(
        string $amount,
        Colocation $colocation,
        CreateExpenseDto|UpdateExpenseDto $dto,
    ): array {
        if ($dto->shares === []) {
            throw new ApiException('Les parts weighted sont obligatoires.');
        }

        $this->assertMembers(array_map(fn ($s) => $s->userId, $dto->shares), $colocation);

        $totalPercentage = '0';
        foreach ($dto->shares as $shareInput) {
            if ($shareInput->percentage === null) {
                throw new ApiException('Chaque part weighted doit avoir un pourcentage.');
            }
            $totalPercentage = bcadd($totalPercentage, $shareInput->percentage, 2);
        }

        if (bccomp($totalPercentage, '100', 2) !== 0) {
            throw new ApiException('La somme des pourcentages doit être égale à 100.');
        }

        $shares = [];
        $allocated = '0.00';
        $lastUserId = $dto->shares[array_key_last($dto->shares)]->userId;

        foreach ($dto->shares as $shareInput) {
            // Dernier membre reçoit le reste pour éviter les erreurs d'arrondi
            if ($shareInput->userId === $lastUserId) {
                $amountOwed = bcsub($amount, $allocated, 2);
            } else {
                $amountOwed = bcdiv(bcmul($amount, $shareInput->percentage, 4), '100', 2);
                $allocated = bcadd($allocated, $amountOwed, 2);
            }

            $shares[$shareInput->userId] = [
                'amountOwed' => $amountOwed,
                'percentage' => number_format((float) $shareInput->percentage, 2, '.', ''),
            ];
        }

        return $shares;
    }

    /** Répartition personnalisée — montants fixes par membre */
    private function computeCustom(
        string $amount,
        Colocation $colocation,
        CreateExpenseDto|UpdateExpenseDto $dto,
    ): array {
        if ($dto->shares === []) {
            throw new ApiException('Les parts custom sont obligatoires.');
        }

        $this->assertMembers(array_map(fn ($s) => $s->userId, $dto->shares), $colocation);

        $total = '0.00';
        $shares = [];
        foreach ($dto->shares as $shareInput) {
            if ($shareInput->amountOwed === null) {
                throw new ApiException('Chaque part custom doit avoir un montant.');
            }
            $shareAmount = number_format((float) $shareInput->amountOwed, 2, '.', '');
            $total = bcadd($total, $shareAmount, 2);
            $shares[$shareInput->userId] = ['amountOwed' => $shareAmount, 'percentage' => null];
        }

        if (bccomp($total, $amount, 2) !== 0) {
            throw new ApiException('La somme des parts doit être égale au montant total.');
        }

        return $shares;
    }

    /** Vérifie que tous les userIds sont bien membres de la coloc (table colocation_user) */
    private function assertMembers(array $userIds, Colocation $colocation): void
    {
        $memberIds = $this->getMemberIds($colocation);

        foreach ($userIds as $userId) {
            if (!in_array($userId, $memberIds, true)) {
                throw new ApiException(sprintf('L\'utilisateur %d n\'est pas membre de la colocation.', $userId));
            }
        }
    }

    private function getMemberIds(Colocation $colocation): array
    {
        return array_map(
            fn (ColocationUser $membership): int => $membership->getUser()->getId(),
            $colocation->getMemberships()->toArray(),
        );
    }
}
