<?php

namespace App\Service\Colocation;

use App\Entity\Colocation;
use App\Entity\ColocationUser;
use App\Enum\ColocationRole;

final class ColocationSerializer
{
    public function serialize(Colocation $colocation, ColocationUser $membership): array
    {
        $data = [
            'id' => $colocation->getId(),
            'name' => $colocation->getName(),
            'role' => $membership->getRole()->value,
            'memberCount' => $colocation->getMemberships()->count(),
            'createdAt' => $colocation->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'updatedAt' => $colocation->getUpdatedAt()->format(\DateTimeInterface::ATOM),
        ];

        if ($membership->getRole() === ColocationRole::Admin) {
            $data['invitationCode'] = $colocation->getInvitationCode();
        }

        return $data;
    }

    public function serializeMember(ColocationUser $membership): array
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
}
