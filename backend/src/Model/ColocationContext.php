<?php

namespace App\Model;

use App\Entity\Colocation;
use App\Entity\ColocationUser;

/**
 * Objet valeur regroupant une colocation et l'appartenance de l'utilisateur.
 * Retourné par ColocationAccessChecker::resolveContext().
 */
final readonly class ColocationContext
{
    public function __construct(
        public Colocation $colocation,
        public ColocationUser $membership,
    ) {
    }
}
