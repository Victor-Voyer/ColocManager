<?php

namespace App\Service\User;

use App\Entity\ColocationUser;
use App\Entity\User;

final class UserSerializer
{
    public function serialize(User $user): array
    {
        return [
            'id' => $user->getId(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'email' => $user->getEmail(),
            'avatarUrl' => $user->getAvatarUrl(),
            'createdAt' => $user->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'updatedAt' => $user->getUpdatedAt()->format(\DateTimeInterface::ATOM),
            'colocations' => array_map(
                fn (ColocationUser $membership): array => $this->serializeColocationMembership($membership),
                $user->getColocationMemberships()->toArray(),
            ),
        ];
    }

    public function serializeColocationMembership(ColocationUser $membership): array
    {
        $colocation = $membership->getColocation();

        return [
            'id' => $colocation->getId(),
            'name' => $colocation->getName(),
            'role' => $membership->getRole()->value,
            'joinedAt' => $membership->getJoinedAt()->format(\DateTimeInterface::ATOM),
        ];
    }
}
