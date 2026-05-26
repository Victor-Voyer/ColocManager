<?php

namespace App\DTO\Colocation;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO pour rejoindre une colocation via son code d'invitation.
 * JSON attendu : { "invitationCode": "BF-2026-XYZ" }
 */
class JoinColocationDto
{
    #[Assert\NotBlank]
    #[Assert\Length(max: 64)]
    public string $invitationCode = '';
}
