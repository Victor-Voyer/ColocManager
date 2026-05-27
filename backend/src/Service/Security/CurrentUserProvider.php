<?php

namespace App\Service\Security;

use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/** Récupère l'utilisateur connecté via le JWT en cookie httpOnly (Symfony Security) */
final class CurrentUserProvider
{
    public function __construct(
        private readonly Security $security,
    ) {
    }

    /** Retourne l'entité User — lève AccessDeniedException si non connecté */
    public function getUser(): User
    {
        $user = $this->security->getUser();

        if (!$user instanceof User) {
            throw new AccessDeniedException();
        }

        return $user;
    }
}
