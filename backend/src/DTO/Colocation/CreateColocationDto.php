<?php

namespace App\DTO\Colocation;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO pour la création d'une colocation.
 * JSON attendu : { "name": "THE BIG FLATROOM" }
 */
class CreateColocationDto
{
    #[Assert\NotBlank]
    #[Assert\Length(min: 1, max: 255)]
    public string $name = '';
}
