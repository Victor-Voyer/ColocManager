<?php

namespace App\DTO\Colocation;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO pour la modification d'une colocation.
 * JSON attendu : { "name": "Nouveau nom" }
 */
class UpdateColocationDto
{
    #[Assert\NotBlank]
    #[Assert\Length(min: 1, max: 255)]
    public string $name = '';
}
