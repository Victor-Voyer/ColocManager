<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO (Data Transfer Object) pour la suppression de compte.
 * Représente le JSON envoyé par le frontend sur DELETE /api/me.
 * Exemple : { "password": "monMotDePasse" }
 */
class DeleteUserAccountDto
{
    /** Mot de passe actuel — obligatoire pour confirmer la suppression */
    #[Assert\NotBlank]
    public string $password = '';
}
