<?php

namespace App\Controller;

use App\DTO\Expense\CreateExpenseDto;
use App\Model\Expense\ExpenseListFilters;
use App\Service\Expense\ExpenseService;
use App\Service\Security\CurrentUserProvider;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * Gère les dépenses et les soldes d'une colocation.
 * Toutes les routes nécessitent d'être connecté (JWT).
 * La logique métier est déléguée à ExpenseService.
 */
#[Route('/api')]
#[IsGranted('ROLE_USER')]
class ExpenseController extends AbstractController
{
    public function __construct(
        private readonly CurrentUserProvider $currentUserProvider, // Récupère l'utilisateur connecté
        private readonly ExpenseService $expenseService,             // Logique métier des dépenses
    ) {
    }

    /** POST /api/colocations/{colocationId}/expenses — Crée une dépense avec répartition saisie manuellement */
    #[Route('/colocations/{colocationId}/expenses', name: 'api_expense_create', methods: ['POST'], requirements: ['colocationId' => '\d+'])]
    public function create(int $colocationId, #[MapRequestPayload] CreateExpenseDto $dto): JsonResponse
    {
        return $this->json(
            $this->expenseService->create($this->currentUserProvider->getUser(), $colocationId, $dto),
            Response::HTTP_CREATED,
        );
    }

    /** GET /api/colocations/{colocationId}/expenses — Liste paginée (filtres : category, paidBy, from, to, page, limit) */
    #[Route('/colocations/{colocationId}/expenses', name: 'api_expense_list', methods: ['GET'], requirements: ['colocationId' => '\d+'])]
    public function list(int $colocationId, Request $request): JsonResponse
    {
        return $this->json(
            $this->expenseService->list(
                $this->currentUserProvider->getUser(),
                $colocationId,
                ExpenseListFilters::fromRequest($request),
            ),
        );
    }

    /** GET /api/colocations/{colocationId}/expenses/history — Historique complet des dépenses */
    #[Route('/colocations/{colocationId}/expenses/history', name: 'api_expense_history', methods: ['GET'], requirements: ['colocationId' => '\d+'])]
    public function history(int $colocationId): JsonResponse
    {
        return $this->json(
            $this->expenseService->history($this->currentUserProvider->getUser(), $colocationId),
        );
    }
    // Récupération des stats pour affichage au front.
    #[Route('/colocations/{colocationId}/expenses/statistics', name: 'api_expense_statistics', methods: ['GET'], requirements: ['colocationId' => '\d+'],)]
    public function statistics(int $colocationId): JsonResponse
    {
        return $this->json(
            $this->expenseService->statistics(
                $this->currentUserProvider->getUser(),
                $colocationId,
            ),
        );
    }

    /** GET /api/colocations/{colocationId}/balances — Soldes par membre (total payé, total dû, balance) */
    #[Route('/colocations/{colocationId}/balances', name: 'api_expense_balances', methods: ['GET'], requirements: ['colocationId' => '\d+'])]
    public function balances(int $colocationId): JsonResponse
    {
        return $this->json(
            $this->expenseService->balances($this->currentUserProvider->getUser(), $colocationId),
        );
    }

    /** GET /api/colocations/{colocationId}/expenses/{expenseId} — Détail d'une dépense */
    #[Route('/colocations/{colocationId}/expenses/{expenseId}', name: 'api_expense_show', methods: ['GET'], requirements: ['colocationId' => '\d+', 'expenseId' => '\d+'])]
    public function show(int $colocationId, int $expenseId): JsonResponse
    {
        return $this->json(
            $this->expenseService->show($this->currentUserProvider->getUser(), $colocationId, $expenseId),
        );
    }

    /** DELETE /api/colocations/{colocationId}/expenses/{expenseId} — Supprime une dépense et ses parts (CASCADE) */
    #[Route('/colocations/{colocationId}/expenses/{expenseId}', name: 'api_expense_delete', methods: ['DELETE'], requirements: ['colocationId' => '\d+', 'expenseId' => '\d+'])]
    public function delete(int $colocationId, int $expenseId): JsonResponse
    {
        $this->expenseService->delete($this->currentUserProvider->getUser(), $colocationId, $expenseId);

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    /** PATCH /api/expenses/{expenseId}/shares/{userId}/pay — Marque une part comme remboursée */
    #[Route('/expenses/{expenseId}/shares/{userId}/pay', name: 'api_expense_share_pay', methods: ['PATCH'], requirements: ['expenseId' => '\d+', 'userId' => '\d+'])]
    public function markShareAsPaid(int $expenseId, int $userId): JsonResponse
    {
        return $this->json(
            $this->expenseService->markShareAsPaid($this->currentUserProvider->getUser(), $expenseId, $userId),
        );
    }

    /** PATCH /api/expenses/{expenseId}/shares/{userId}/unpay — Annule le remboursement d'une part */
    #[Route('/expenses/{expenseId}/shares/{userId}/unpay', name: 'api_expense_share_unpay', methods: ['PATCH'], requirements: ['expenseId' => '\d+', 'userId' => '\d+'])]
    public function markShareAsUnpaid(int $expenseId, int $userId): JsonResponse
    {
        return $this->json(
            $this->expenseService->markShareAsUnpaid($this->currentUserProvider->getUser(), $expenseId, $userId),
        );
    }
}
