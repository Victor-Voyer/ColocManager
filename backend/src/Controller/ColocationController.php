<?php

namespace App\Controller;

use App\DTO\Colocation\CreateColocationDto;
use App\DTO\Colocation\JoinColocationDto;
use App\DTO\Colocation\UpdateColocationDto;
use App\DTO\Colocation\UpdateMemberRoleDto;
use App\Entity\Colocation;
use App\Entity\ColocationUser;
use App\Entity\User;
use App\Enum\ColocationRole;
use App\Repository\ColocationRepository;
use App\Repository\ColocationUserRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Gère les colocations et leurs membres.
 * Toutes les routes nécessitent d'être connecté (JWT).
 */
#[Route('/api/colocations')]
#[IsGranted('ROLE_USER')]
class ColocationController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly ColocationRepository $colocationRepository,
        private readonly ColocationUserRepository $colocationUserRepository,
        private readonly UserRepository $userRepository,
        private readonly ValidatorInterface $validator,
    ) {
    }

    /** POST /api/colocations — Crée une coloc (le créateur devient admin) */
    #[Route('', name: 'api_colocation_create', methods: ['POST'])]
    public function create(#[MapRequestPayload] CreateColocationDto $dto): JsonResponse
    {
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->validationErrorResponse($errors);
        }

        $user = $this->getAuthenticatedUser();

        $colocation = new Colocation();
        $colocation->setName($dto->name);
        $colocation->setInvitationCode($this->generateUniqueInvitationCode());

        $membership = new ColocationUser($user, $colocation);
        $membership->setRole(ColocationRole::Admin);

        $colocation->addMembership($membership);
        $user->addColocationMembership($membership);

        $this->entityManager->persist($colocation);
        $this->entityManager->persist($membership);
        $this->entityManager->flush();

        return $this->json(
            $this->serializeColocation($colocation, $membership),
            Response::HTTP_CREATED,
        );
    }

    /** POST /api/colocations/join — Rejoint une coloc via le code d'invitation */
    #[Route('/join', name: 'api_colocation_join', methods: ['POST'])]
    public function join(#[MapRequestPayload] JoinColocationDto $dto): JsonResponse
    {
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->validationErrorResponse($errors);
        }

        $user = $this->getAuthenticatedUser();
        $colocation = $this->colocationRepository->findOneByInvitationCode($dto->invitationCode);

        if ($colocation === null) {
            return $this->json(['error' => 'Code d\'invitation invalide.'], Response::HTTP_NOT_FOUND);
        }

        if ($this->colocationUserRepository->findOneByUserAndColocation($user, $colocation) !== null) {
            return $this->json(['error' => 'Vous faites déjà partie de cette colocation.'], Response::HTTP_CONFLICT);
        }

        $membership = new ColocationUser($user, $colocation);
        $colocation->addMembership($membership);
        $user->addColocationMembership($membership);

        $this->entityManager->persist($membership);
        $this->entityManager->flush();

        return $this->json($this->serializeColocation($colocation, $membership), Response::HTTP_CREATED);
    }

    /** GET /api/colocations/{id} — Détail d'une coloc (membres uniquement) */
    #[Route('/{id}', name: 'api_colocation_show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $colocation = $this->findColocationOr404($id);
        if ($colocation instanceof JsonResponse) {
            return $colocation;
        }

        $membership = $this->getMembershipOrForbidden($this->getAuthenticatedUser(), $colocation);
        if ($membership instanceof JsonResponse) {
            return $membership;
        }

        return $this->json($this->serializeColocation($colocation, $membership));
    }

    /** PUT /api/colocations/{id} — Modifie une coloc (admin uniquement) */
    #[Route('/{id}', name: 'api_colocation_update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, #[MapRequestPayload] UpdateColocationDto $dto): JsonResponse
    {
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->validationErrorResponse($errors);
        }

        $colocation = $this->findColocationOr404($id);
        if ($colocation instanceof JsonResponse) {
            return $colocation;
        }

        $membership = $this->getMembershipOrForbidden($this->getAuthenticatedUser(), $colocation);
        if ($membership instanceof JsonResponse) {
            return $membership;
        }

        $adminCheck = $this->requireAdmin($membership);
        if ($adminCheck instanceof JsonResponse) {
            return $adminCheck;
        }

        $colocation->setName($dto->name);
        $this->entityManager->flush();

        return $this->json($this->serializeColocation($colocation, $membership));
    }

    /** DELETE /api/colocations/{id} — Supprime une coloc (admin uniquement) */
    #[Route('/{id}', name: 'api_colocation_delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): JsonResponse
    {
        $colocation = $this->findColocationOr404($id);
        if ($colocation instanceof JsonResponse) {
            return $colocation;
        }

        $membership = $this->getMembershipOrForbidden($this->getAuthenticatedUser(), $colocation);
        if ($membership instanceof JsonResponse) {
            return $membership;
        }

        $adminCheck = $this->requireAdmin($membership);
        if ($adminCheck instanceof JsonResponse) {
            return $adminCheck;
        }

        // La BDD interdit la suppression si des dépenses existent (contrainte RESTRICT)
        $expensesCount = $this->colocationRepository->countExpenses($colocation);
        if ($expensesCount > 0) {
            return $this->json([
                'error' => 'Impossible de supprimer la colocation : des dépenses y sont enregistrées.',
                'expensesCount' => $expensesCount,
            ], Response::HTTP_CONFLICT);
        }

        $this->entityManager->remove($colocation);
        $this->entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    /** GET /api/colocations/{id}/members — Liste des membres */
    #[Route('/{id}/members', name: 'api_colocation_members', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function members(int $id): JsonResponse
    {
        $colocation = $this->findColocationOr404($id);
        if ($colocation instanceof JsonResponse) {
            return $colocation;
        }

        $membership = $this->getMembershipOrForbidden($this->getAuthenticatedUser(), $colocation);
        if ($membership instanceof JsonResponse) {
            return $membership;
        }

        $members = array_map(
            fn (ColocationUser $member): array => $this->serializeMember($member),
            $colocation->getMemberships()->toArray(),
        );

        return $this->json($members);
    }

    /** DELETE /api/colocations/{id}/members/{userId} — Exclut un membre (admin uniquement) */
    #[Route('/{id}/members/{userId}', name: 'api_colocation_remove_member', methods: ['DELETE'], requirements: ['id' => '\d+', 'userId' => '\d+'])]
    public function removeMember(int $id, int $userId): JsonResponse
    {
        $colocation = $this->findColocationOr404($id);
        if ($colocation instanceof JsonResponse) {
            return $colocation;
        }

        $membership = $this->getMembershipOrForbidden($this->getAuthenticatedUser(), $colocation);
        if ($membership instanceof JsonResponse) {
            return $membership;
        }

        $adminCheck = $this->requireAdmin($membership);
        if ($adminCheck instanceof JsonResponse) {
            return $adminCheck;
        }

        $currentUser = $this->getAuthenticatedUser();
        if ($userId === $currentUser->getId()) {
            return $this->json(['error' => 'Utilisez POST /leave pour quitter la colocation.'], Response::HTTP_BAD_REQUEST);
        }

        $targetUser = $this->userRepository->find($userId);
        if ($targetUser === null) {
            return $this->json(['error' => 'Membre introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $targetMembership = $this->colocationUserRepository->findOneByUserAndColocation($targetUser, $colocation);
        if ($targetMembership === null) {
            return $this->json(['error' => 'Cet utilisateur ne fait pas partie de la colocation.'], Response::HTTP_NOT_FOUND);
        }

        if ($this->isSoleAdmin($targetMembership, $colocation)) {
            return $this->json([
                'error' => 'Impossible d\'exclure le seul administrateur. Transférez d\'abord le rôle admin.',
            ], Response::HTTP_CONFLICT);
        }

        $this->entityManager->remove($targetMembership);
        $this->entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    /** POST /api/colocations/{id}/leave — Quitte la colocation */
    #[Route('/{id}/leave', name: 'api_colocation_leave', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function leave(int $id): JsonResponse
    {
        $colocation = $this->findColocationOr404($id);
        if ($colocation instanceof JsonResponse) {
            return $colocation;
        }

        $membership = $this->getMembershipOrForbidden($this->getAuthenticatedUser(), $colocation);
        if ($membership instanceof JsonResponse) {
            return $membership;
        }

        if ($this->isSoleAdmin($membership, $colocation)) {
            return $this->json([
                'error' => 'Impossible de quitter : vous êtes le seul administrateur. Transférez d\'abord le rôle admin.',
            ], Response::HTTP_CONFLICT);
        }

        $this->entityManager->remove($membership);
        $this->entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    /** PATCH /api/colocations/{id}/members/{userId}/role — Change le rôle d'un membre (admin uniquement) */
    #[Route('/{id}/members/{userId}/role', name: 'api_colocation_update_member_role', methods: ['PATCH'], requirements: ['id' => '\d+', 'userId' => '\d+'])]
    public function updateMemberRole(int $id, int $userId, #[MapRequestPayload] UpdateMemberRoleDto $dto): JsonResponse
    {
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->validationErrorResponse($errors);
        }

        $colocation = $this->findColocationOr404($id);
        if ($colocation instanceof JsonResponse) {
            return $colocation;
        }

        $membership = $this->getMembershipOrForbidden($this->getAuthenticatedUser(), $colocation);
        if ($membership instanceof JsonResponse) {
            return $membership;
        }

        $adminCheck = $this->requireAdmin($membership);
        if ($adminCheck instanceof JsonResponse) {
            return $adminCheck;
        }

        $targetUser = $this->userRepository->find($userId);
        if ($targetUser === null) {
            return $this->json(['error' => 'Membre introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $targetMembership = $this->colocationUserRepository->findOneByUserAndColocation($targetUser, $colocation);
        if ($targetMembership === null) {
            return $this->json(['error' => 'Cet utilisateur ne fait pas partie de la colocation.'], Response::HTTP_NOT_FOUND);
        }

        $newRole = ColocationRole::from($dto->role);

        // Empêche de rétrograder le seul admin si d'autres membres sont présents
        if ($newRole === ColocationRole::Member && $this->isSoleAdmin($targetMembership, $colocation)) {
            return $this->json([
                'error' => 'Impossible de rétrograder le seul administrateur. Promouvez d\'abord un autre membre.',
            ], Response::HTTP_CONFLICT);
        }

        $targetMembership->setRole($newRole);
        $this->entityManager->flush();

        return $this->json($this->serializeMember($targetMembership));
    }

    /** POST /api/colocations/{id}/invitation-code/regenerate — Régénère le code d'invitation (admin uniquement) */
    #[Route('/{id}/invitation-code/regenerate', name: 'api_colocation_regenerate_invitation', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function regenerateInvitationCode(int $id): JsonResponse
    {
        $colocation = $this->findColocationOr404($id);
        if ($colocation instanceof JsonResponse) {
            return $colocation;
        }

        $membership = $this->getMembershipOrForbidden($this->getAuthenticatedUser(), $colocation);
        if ($membership instanceof JsonResponse) {
            return $membership;
        }

        $adminCheck = $this->requireAdmin($membership);
        if ($adminCheck instanceof JsonResponse) {
            return $adminCheck;
        }

        $colocation->setInvitationCode($this->generateUniqueInvitationCode());
        $this->entityManager->flush();

        return $this->json([
            'invitationCode' => $colocation->getInvitationCode(),
        ]);
    }

    private function getAuthenticatedUser(): User
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            throw $this->createAccessDeniedException();
        }

        return $user;
    }

    private function findColocationOr404(int $id): Colocation|JsonResponse
    {
        $colocation = $this->colocationRepository->find($id);

        if ($colocation === null) {
            return $this->json(['error' => 'Colocation introuvable.'], Response::HTTP_NOT_FOUND);
        }

        return $colocation;
    }

    /** Vérifie que l'utilisateur est membre de la colocation */
    private function getMembershipOrForbidden(User $user, Colocation $colocation): ColocationUser|JsonResponse
    {
        $membership = $this->colocationUserRepository->findOneByUserAndColocation($user, $colocation);

        if ($membership === null) {
            return $this->json(['error' => 'Accès refusé : vous n\'êtes pas membre de cette colocation.'], Response::HTTP_FORBIDDEN);
        }

        return $membership;
    }

    /** Vérifie que le membre a le rôle admin */
    private function requireAdmin(ColocationUser $membership): ?JsonResponse
    {
        if ($membership->getRole() !== ColocationRole::Admin) {
            return $this->json(['error' => 'Action réservée aux administrateurs.'], Response::HTTP_FORBIDDEN);
        }

        return null;
    }

    /** True si ce membre est le seul admin et qu'il y a d'autres membres dans la coloc */
    private function isSoleAdmin(ColocationUser $membership, Colocation $colocation): bool
    {
        if ($membership->getRole() !== ColocationRole::Admin) {
            return false;
        }

        if ($colocation->getMemberships()->count() <= 1) {
            return false;
        }

        return $this->colocationUserRepository->countAdmins($colocation) === 1;
    }

    /** Génère un code d'invitation unique (ex: COL-A1B2C3D4) */
    private function generateUniqueInvitationCode(): string
    {
        do {
            $code = 'COL-'.strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
        } while ($this->colocationRepository->findOneByInvitationCode($code) !== null);

        return $code;
    }

    /** Formate une colocation pour la réponse JSON */
    private function serializeColocation(Colocation $colocation, ColocationUser $membership): array
    {
        $data = [
            'id' => $colocation->getId(),
            'name' => $colocation->getName(),
            'role' => $membership->getRole()->value,
            'memberCount' => $colocation->getMemberships()->count(),
            'createdAt' => $colocation->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'updatedAt' => $colocation->getUpdatedAt()->format(\DateTimeInterface::ATOM),
        ];

        // Le code d'invitation n'est visible que par les admins
        if ($membership->getRole() === ColocationRole::Admin) {
            $data['invitationCode'] = $colocation->getInvitationCode();
        }

        return $data;
    }

    /** Formate un membre pour la réponse JSON */
    private function serializeMember(ColocationUser $membership): array
    {
        $user = $membership->getUser();

        return [
            'id' => $user->getId(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'email' => $user->getEmail(),
            'avatarUrl' => $user->getAvatarUrl(),
            'role' => $membership->getRole()->value,
            'joinedAt' => $membership->getJoinedAt()->format(\DateTimeInterface::ATOM),
        ];
    }

    private function validationErrorResponse(\Symfony\Component\Validator\ConstraintViolationListInterface $errors): JsonResponse
    {
        $messages = [];
        foreach ($errors as $error) {
            $messages[$error->getPropertyPath()] = $error->getMessage();
        }

        return $this->json(['errors' => $messages], Response::HTTP_UNPROCESSABLE_ENTITY);
    }
}
