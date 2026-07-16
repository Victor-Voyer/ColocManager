<?php

namespace App\Service\Colocation;

use App\Entity\Colocation;
use App\Entity\User;
use App\Enum\ColocationRole;
use App\Exception\ApiException;
use App\Model\ColocationContext;
use App\Repository\ColocationRepository;

final class ColocationAccessChecker
{
    public function __construct(
        private readonly ColocationRepository $colocationRepository,
    ) {
    }

    public function resolveContext(User $user, int $colocationId): ColocationContext
    {
        $colocation = $this->colocationRepository->find($colocationId);
        if ($colocation === null) {
            throw ApiException::notFound('Colocation introuvable.');
        }

        $role = $this->requireMembership($user, $colocation);

        return new ColocationContext($colocation, $role);
    }

    public function requireMembership(User $user, Colocation $colocation): ColocationRole
    {
        if ($user->getColocation() === null || $user->getColocation()->getId() !== $colocation->getId()) {
            throw ApiException::forbidden('Accès refusé : vous n\'êtes pas membre de cette colocation.');
        }

        return $user->getRole();
    }
}
