<?php

namespace App\Service\User;

use App\Entity\User;

final class UserSummarySerializer
{
    public function toSummary(?User $user): ?array
    {
        if ($user === null) {
            return null;
        }

        return [
            'id' => $user->getId(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
        ];
    }
}
