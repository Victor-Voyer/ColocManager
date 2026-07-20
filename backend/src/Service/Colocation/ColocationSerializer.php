<?php

namespace App\Service\Colocation;

use App\Entity\Colocation;
use App\Entity\User;
use App\Enum\ColocationRole;

final class ColocationSerializer
{
    public function serialize(Colocation $colocation, ColocationRole $role): array
    {
        $data = [
            'id' => $colocation->getId(),
            'name' => $colocation->getName(),
            'role' => $role->value,
            'memberCount' => $colocation->getMembers()->count(),
            'createdAt' => $colocation->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'updatedAt' => $colocation->getUpdatedAt()->format(\DateTimeInterface::ATOM),
        ];

        if ($role === ColocationRole::Admin) {
            $data['invitationCode'] = $colocation->getInvitationCode();
            $data['invitationCodeExpiresAt'] = $colocation->getInvitationCodeExpiresAt()?->format(\DateTimeInterface::ATOM);
        }

        return $data;
    }

    public function serializeInvitationCode(Colocation $colocation): array
    {
        return [
            'invitationCode' => $colocation->getInvitationCode(),
            'invitationCodeExpiresAt' => $colocation->getInvitationCodeExpiresAt()?->format(\DateTimeInterface::ATOM),
        ];
    }

    public function serializeMember(User $member): array
    {
        return [
            'id' => $member->getId(),
            'firstName' => $member->getFirstName(),
            'lastName' => $member->getLastName(),
            'email' => $member->getEmail(),
            'role' => $member->getRole()?->value,
        ];
    }
}
