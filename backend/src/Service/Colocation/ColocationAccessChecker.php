<?php

namespace App\Service\Colocation;

use App\Entity\Colocation;
use App\Entity\User;
use App\Exception\ApiException;
use App\Model\ColocationContext;
use App\Repository\ColocationRepository;
use App\Repository\ColocationUserRepository;

/**
 * Vérifie qu'un utilisateur a accès à une colocation.
 * Réutilisable par ExpenseService, TaskService, etc.
 */
final class ColocationAccessChecker
{
    public function __construct(
        private readonly ColocationRepository $colocationRepository,
        private readonly ColocationUserRepository $colocationUserRepository,
    ) {
    }

    /** Retourne la coloc + l'appartenance de l'utilisateur, ou lève une exception */
    public function resolveContext(User $user, int $colocationId): ColocationContext
    {
        $colocation = $this->colocationRepository->find($colocationId);
        if ($colocation === null) {
            throw ApiException::notFound('Colocation introuvable.');
        }

        return new ColocationContext(
            $colocation,
            $this->requireMembership($user, $colocation),
        );
    }

    /** Vérifie que l'utilisateur est membre via la table pivot colocation_user */
    public function requireMembership(User $user, Colocation $colocation): \App\Entity\ColocationUser
    {
        $membership = $this->colocationUserRepository->findOneByUserAndColocation($user, $colocation);
        if ($membership === null) {
            throw ApiException::forbidden('Accès refusé : vous n\'êtes pas membre de cette colocation.');
        }

        return $membership;
    }
}
