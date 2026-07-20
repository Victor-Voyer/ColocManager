<?php

namespace App\Service\User;

use App\Entity\User;

final class UserSerializer
{
    public function serialize(User $user): array
    {
        $colocation = $user->getColocation();

        return [
            'id' => $user->getId(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'email' => $user->getEmail(),
            'createdAt' => $user->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'updatedAt' => $user->getUpdatedAt()->format(\DateTimeInterface::ATOM),
            'colocation' => $colocation === null ? null : [
                'id' => $colocation->getId(),
                'name' => $colocation->getName(),
                'role' => $user->getRole()?->value,
            ],
        ];
    }
}
