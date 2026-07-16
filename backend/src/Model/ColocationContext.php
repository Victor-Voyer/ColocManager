<?php

namespace App\Model;

use App\Entity\Colocation;
use App\Enum\ColocationRole;

final readonly class ColocationContext
{
    public function __construct(
        public Colocation $colocation,
        public ColocationRole $role,
    ) {
    }
}
