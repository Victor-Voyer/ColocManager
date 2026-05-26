<?php

namespace App\DTO\Colocation;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO pour changer le rôle d'un membre (admin ou member).
 * JSON attendu : { "role": "admin" }
 */
class UpdateMemberRoleDto
{
    #[Assert\NotBlank]
    #[Assert\Choice(choices: ['admin', 'member'])]
    public string $role = '';
}
