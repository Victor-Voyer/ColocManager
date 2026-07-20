<?php

namespace App\Model\Expense;

use App\Service\Common\DateParser;
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

        $from = DateParser::parseOptionalYmd($request->query->get('from'), 'from');
        $to = DateParser::parseOptionalYmd($request->query->get('to'), 'to');

        return new self(
            $page,
            $limit,
            is_string($category) && $category !== '' ? $category : null,
            $paidBy,
            $from,
            $to,
        );
    }
}
