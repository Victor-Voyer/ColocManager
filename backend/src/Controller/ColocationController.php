<?php

namespace App\Controller;

use App\DTO\Colocation\CreateColocationDto;
use App\DTO\Colocation\JoinColocationDto;
use App\DTO\Colocation\UpdateColocationDto;
use App\DTO\Colocation\UpdateMemberRoleDto;
use App\Service\Colocation\ColocationService;
use App\Service\Security\CurrentUserProvider;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * Gère les colocations et leurs membres.
 * Toutes les routes nécessitent d'être connecté (JWT).
 * La logique métier est déléguée à ColocationService.
 */
#[Route('/api/colocations')]
#[IsGranted('ROLE_USER')]
class ColocationController extends AbstractController
{
    public function __construct(
        private readonly CurrentUserProvider $currentUserProvider, // Récupère l'utilisateur connecté
        private readonly ColocationService $colocationService,       // Logique métier des colocations
    ) {
    }

    /** POST /api/colocations — Crée une coloc (le créateur devient admin) */
    #[Route('', name: 'api_colocation_create', methods: ['POST'])]
    public function create(#[MapRequestPayload] CreateColocationDto $dto): JsonResponse
    {
        return $this->json(
            $this->colocationService->create($this->currentUserProvider->getUser(), $dto),
            Response::HTTP_CREATED,
        );
    }

    /** POST /api/colocations/join — Rejoint une coloc via le code d'invitation */
    #[Route('/join', name: 'api_colocation_join', methods: ['POST'])]
    public function join(#[MapRequestPayload] JoinColocationDto $dto): JsonResponse
    {
        return $this->json(
            $this->colocationService->join($this->currentUserProvider->getUser(), $dto),
            Response::HTTP_CREATED,
        );
    }

    /** GET /api/colocations/{id} — Détail d'une coloc (membres uniquement) */
    #[Route('/{id}', name: 'api_colocation_show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        return $this->json(
            $this->colocationService->show($this->currentUserProvider->getUser(), $id),
        );
    }

    /** PUT /api/colocations/{id} — Modifie une coloc (admin uniquement) */
    #[Route('/{id}', name: 'api_colocation_update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, #[MapRequestPayload] UpdateColocationDto $dto): JsonResponse
    {
        return $this->json(
            $this->colocationService->update($this->currentUserProvider->getUser(), $id, $dto),
        );
    }

    /** DELETE /api/colocations/{id} — Supprime une coloc (admin uniquement) */
    #[Route('/{id}', name: 'api_colocation_delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): JsonResponse
    {
        $this->colocationService->delete($this->currentUserProvider->getUser(), $id);

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    /** GET /api/colocations/{id}/members — Liste des membres */
    #[Route('/{id}/members', name: 'api_colocation_members', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function members(int $id): JsonResponse
    {
        return $this->json(
            $this->colocationService->members($this->currentUserProvider->getUser(), $id),
        );
    }

    /** DELETE /api/colocations/{id}/members/{userId} — Exclut un membre (admin uniquement) */
    #[Route('/{id}/members/{userId}', name: 'api_colocation_remove_member', methods: ['DELETE'], requirements: ['id' => '\d+', 'userId' => '\d+'])]
    public function removeMember(int $id, int $userId): JsonResponse
    {
        $this->colocationService->removeMember($this->currentUserProvider->getUser(), $id, $userId);

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    /** POST /api/colocations/{id}/leave — Quitte la colocation */
    #[Route('/{id}/leave', name: 'api_colocation_leave', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function leave(int $id): JsonResponse
    {
        $this->colocationService->leave($this->currentUserProvider->getUser(), $id);

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    /** PATCH /api/colocations/{id}/members/{userId}/role — Change le rôle d'un membre (admin uniquement) */
    #[Route('/{id}/members/{userId}/role', name: 'api_colocation_update_member_role', methods: ['PATCH'], requirements: ['id' => '\d+', 'userId' => '\d+'])]
    public function updateMemberRole(int $id, int $userId, #[MapRequestPayload] UpdateMemberRoleDto $dto): JsonResponse
    {
        return $this->json(
            $this->colocationService->updateMemberRole($this->currentUserProvider->getUser(), $id, $userId, $dto),
        );
    }

    /** POST /api/colocations/{id}/invitation-code/regenerate — Régénère le code d'invitation (admin uniquement) */
    #[Route('/{id}/invitation-code/regenerate', name: 'api_colocation_regenerate_invitation', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function regenerateInvitationCode(int $id): JsonResponse
    {
        return $this->json(
            $this->colocationService->regenerateInvitationCode($this->currentUserProvider->getUser(), $id),
        );
    }
}
