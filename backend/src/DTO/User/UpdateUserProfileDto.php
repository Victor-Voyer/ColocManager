<?php

namespace App\DTO\User;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO pour la mise à jour du profil utilisateur.
 * Représente le JSON envoyé par le frontend sur PUT /api/me.
 *
 * Tous les champs sont optionnels (null = pas de modification).
 * On envoie uniquement ce qu'on veut changer.
 */
class UpdateUserProfileDto
{
    #[Assert\Length(min: 1, max: 100)]
    public ?string $firstName = null;

    #[Assert\Length(min: 1, max: 100)]
    public ?string $lastName = null;

    #[Assert\Email]
    #[Assert\Length(max: 255)]
    public ?string $email = null;

    #[Assert\Length(max: 255)]
    public ?string $avatarUrl = null;

    /** Nouveau mot de passe — minimum 8 caractères */
    #[Assert\Length(min: 8, max: 255)]
    public ?string $newPassword = null;

    /** Obligatoire uniquement si newPassword est renseigné (vérifié dans le controller) */
    #[Assert\NotBlank(groups: ['password_change'])]
    public ?string $currentPassword = null;
}
