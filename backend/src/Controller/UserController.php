<?php

namespace App\Controller;

use App\DTO\User\DeleteUserAccountDto;
use App\DTO\User\UpdateUserProfileDto;
use App\Entity\ColocationUser;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api')]
#[IsGranted('ROLE_USER')]
class UserController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserRepository $userRepository,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly ValidatorInterface $validator,
    ) {
    }

    #[Route('/me', name: 'api_user_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        return $this->json($this->serializeUser($this->getAuthenticatedUser()));
    }

    #[Route('/me', name: 'api_user_update', methods: ['PUT'])]
    public function update(
        #[MapRequestPayload] UpdateUserProfileDto $dto, // Symfony transforme le JSON du body en objet PHP
    ): JsonResponse {
        $user = $this->getAuthenticatedUser();

        // Changement de mot de passe : on vérifie d'abord l'ancien
        if ($dto->newPassword !== null) {
            $passwordErrors = $this->validator->validate($dto, null, ['password_change']);
            if (count($passwordErrors) > 0) {
                return $this->validationErrorResponse($passwordErrors);
            }

            if ($dto->currentPassword === null || !$this->passwordHasher->isPasswordValid($user, $dto->currentPassword)) {
                return $this->json(['error' => 'Mot de passe actuel incorrect.'], Response::HTTP_BAD_REQUEST);
            }
        }

        // Validation générale des champs (email valide, longueur du nom, etc.)
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->validationErrorResponse($errors);
        }

        // On ne modifie que les champs envoyés dans la requête (null = pas de changement)
        if ($dto->firstName !== null) {
            $user->setFirstName($dto->firstName);
        }

        if ($dto->lastName !== null) {
            $user->setLastName($dto->lastName);
        }

        // Vérification que l'email n'est pas déjà pris par un autre compte
        if ($dto->email !== null && $dto->email !== $user->getEmail()) {
            $existingUser = $this->userRepository->findOneBy(['email' => $dto->email]);
            if ($existingUser !== null && $existingUser->getId() !== $user->getId()) {
                return $this->json(['error' => 'Cet email est déjà utilisé.'], Response::HTTP_CONFLICT);
            }

            $user->setEmail($dto->email);
        }

        if ($dto->avatarUrl !== null) {
            $user->setAvatarUrl($dto->avatarUrl === '' ? null : $dto->avatarUrl);
        }

        if ($dto->newPassword !== null) {
            $user->setPasswordHash($this->passwordHasher->hashPassword($user, $dto->newPassword));
        }

        $this->entityManager->flush();

        return $this->json($this->serializeUser($user));
    }

    /** DELETE /api/me — Supprime le compte (mot de passe obligatoire pour confirmer) */
    #[Route('/me', name: 'api_user_delete', methods: ['DELETE'])]
    public function delete(#[MapRequestPayload] DeleteUserAccountDto $dto): JsonResponse
    {
        $user = $this->getAuthenticatedUser();

        if (!$this->passwordHasher->isPasswordValid($user, $dto->password)) {
            return $this->json(['error' => 'Mot de passe incorrect.'], Response::HTTP_BAD_REQUEST);
        }

        // La BDD interdit la suppression si l'utilisateur a un historique financier (contraintes RESTRICT)
        $expensesPaidCount = $this->userRepository->countExpensesPaid($user);
        if ($expensesPaidCount > 0) {
            return $this->json([
                'error' => 'Impossible de supprimer le compte : vous avez enregistré des dépenses en tant que payeur.',
                'expensesPaidCount' => $expensesPaidCount,
            ], Response::HTTP_CONFLICT);
        }

        $expenseSharesCount = $this->userRepository->countExpenseShares($user);
        if ($expenseSharesCount > 0) {
            return $this->json([
                'error' => 'Impossible de supprimer le compte : vous avez des parts de dépenses enregistrées.',
                'expenseSharesCount' => $expenseSharesCount,
            ], Response::HTTP_CONFLICT);
        }

        // Empêche de supprimer le compte si on est le seul admin d'une coloc avec d'autres membres
        if ($this->userRepository->isSoleAdminOfColocationWithOtherMembers($user)) {
            return $this->json([
                'error' => 'Impossible de supprimer le compte : vous êtes le seul administrateur d\'une colocation avec d\'autres membres. Transférez le rôle admin avant de supprimer votre compte.',
            ], Response::HTTP_CONFLICT);
        }

        $this->entityManager->remove($user);
        $this->entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    private function getAuthenticatedUser(): User
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            throw $this->createAccessDeniedException();
        }

        return $user;
    }

    /** Transforme l'entité User en tableau JSON (sans le mot de passe) */
    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->getId(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'email' => $user->getEmail(),
            'avatarUrl' => $user->getAvatarUrl(),
            'createdAt' => $user->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'updatedAt' => $user->getUpdatedAt()->format(\DateTimeInterface::ATOM),
            // Inclut les colocations de l'utilisateur via la table pivot colocation_user
            'colocations' => array_map(
                fn (ColocationUser $membership): array => $this->serializeColocationMembership($membership),
                $user->getColocationMemberships()->toArray(),
            ),
        ];
    }

    /** Formate une appartenance à une colocation pour la réponse JSON */
    private function serializeColocationMembership(ColocationUser $membership): array
    {
        $colocation = $membership->getColocation();

        return [
            'id' => $colocation->getId(),
            'name' => $colocation->getName(),
            'role' => $membership->getRole()->value,
            'joinedAt' => $membership->getJoinedAt()->format(\DateTimeInterface::ATOM),
        ];
    }

    /** Retourne une réponse 422 (Unprocessable Entity) avec la liste des erreurs de validation par champ */
    private function validationErrorResponse(\Symfony\Component\Validator\ConstraintViolationListInterface $errors): JsonResponse
    {
        $messages = [];
        foreach ($errors as $error) {
            $messages[$error->getPropertyPath()] = $error->getMessage();
        }

        return $this->json(['errors' => $messages], Response::HTTP_UNPROCESSABLE_ENTITY);
    }
}
