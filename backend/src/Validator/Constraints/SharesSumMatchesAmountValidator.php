<?php

namespace App\Validator\Constraints;

use App\DTO\Expense\CreateExpenseDto;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

class SharesSumMatchesAmountValidator extends ConstraintValidator
{
    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof SharesSumMatchesAmount) {
            throw new UnexpectedTypeException($constraint, SharesSumMatchesAmount::class);
        }

        if ($value === null) {
            return;
        }

        if (!$value instanceof CreateExpenseDto) {
            throw new UnexpectedValueException($value, CreateExpenseDto::class);
        }

        $explicitCents = 0;
        $hasAutoShare = false;

        foreach ($value->shares as $share) {
            if ($share->amountOwed === null) {
                $hasAutoShare = true;
                continue;
            }
            $explicitCents += $this->toCents($share->amountOwed);
        }

        $remainingCents = $this->toCents($value->amount) - $explicitCents;

        if ($hasAutoShare) {
            if ($remainingCents < 0) {
                $this->context->buildViolation($constraint->exceededMessage)
                    ->atPath('shares')
                    ->addViolation();
            }

            return;
        }

        if ($remainingCents !== 0) {
            $this->context->buildViolation($constraint->message)
                ->atPath('shares')
                ->addViolation();
        }
    }

    /** Comparaison en centimes pour éviter les problèmes d'arrondi flottant. */
    private function toCents(string $amount): int
    {
        return (int) round((float) $amount * 100);
    }
}
