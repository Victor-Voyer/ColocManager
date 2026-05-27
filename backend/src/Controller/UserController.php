<?php

namespace App\Controller;

use App\DTO\User\DeleteUserAccountDto;
use App\DTO\User\UpdateUserProfileDto;
use App\Service\Security\CurrentUserProvider;
use App\Service\User\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * Gère le profil de l'utilisateur connecté.
 * Toutes les routes nécessitent d'être connecté (cookie JWT httpOnly).
 * La logique métier est déléguée à UserService.
 */
#[Route('/api')]
#[IsGranted('ROLE_USER')]
class UserController extends AbstractController
{
    public function __construct(
        private readonly CurrentUserProvider $currentUserProvider, // Récupère l'utilisateur connecté
        private readonly UserService $userService,                   // Logique métier du profil utilisateur
    ) {
    }

    /** GET /api/me — Profil de l'utilisateur connecté (avec ses colocations) */
    #[Route('/me', name: 'api_user_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        return $this->json(
            $this->userService->getProfile($this->currentUserProvider->getUser()),
        );
    }

    /** PUT /api/me — Modifie le profil (nom, email, avatar, mot de passe) */
    #[Route('/me', name: 'api_user_update', methods: ['PUT'])]
    public function update(#[MapRequestPayload] UpdateUserProfileDto $dto): JsonResponse
    {
        return $this->json(
            $this->userService->update($this->currentUserProvider->getUser(), $dto),
        );
    }

    /** DELETE /api/me — Supprime le compte (mot de passe obligatoire pour confirmer) */
    #[Route('/me', name: 'api_user_delete', methods: ['DELETE'])]
    public function delete(#[MapRequestPayload] DeleteUserAccountDto $dto): JsonResponse
    {
        $this->userService->delete($this->currentUserProvider->getUser(), $dto);

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
