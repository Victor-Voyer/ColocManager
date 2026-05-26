<?php

namespace App\Model\Expense;

use App\Exception\ApiException;
use Symfony\Component\HttpFoundation\Request;

/**
 * Paramètres de filtrage pour GET /api/colocations/{id}/expenses.
 * Construit à partir des query params : page, limit, category, paidBy, from, to.
 */
final readonly class ExpenseListFilters
{
    public function __construct(
        public int $page,
        public int $limit,
        public ?string $category,
        public ?int $paidBy,
        public ?\DateTimeImmutable $from,
        public ?\DateTimeImmutable $to,
    ) {
    }

    /** Parse les query params de la requête HTTP */
    public static function fromRequest(Request $request): self
    {
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = min(100, max(1, (int) $request->query->get('limit', 20)));

        $category = $request->query->get('category');
        $paidBy = $request->query->has('paidBy') ? (int) $request->query->get('paidBy') : null;

        $from = self::parseDate($request->query->get('from'), 'from');
        $to = self::parseDate($request->query->get('to'), 'to');

        return new self(
            $page,
            $limit,
            is_string($category) && $category !== '' ? $category : null,
            $paidBy,
            $from,
            $to,
        );
    }

    /** Retourne null si le paramètre est absent, lève ApiException si le format est invalide */
    private static function parseDate(mixed $value, string $paramName): ?\DateTimeImmutable
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_array($value) || !is_string($value)) {
            throw new ApiException(sprintf('Format de date invalide pour "%s" (attendu : Y-m-d).', $paramName));
        }

        $parsed = \DateTimeImmutable::createFromFormat('Y-m-d', $value);
        if ($parsed === false) {
            throw new ApiException(sprintf('Format de date invalide pour "%s" (attendu : Y-m-d).', $paramName));
        }

        return $parsed;
    }
}
