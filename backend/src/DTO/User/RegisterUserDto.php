<?php

namespace App\DTO\User;

use Symfony\Component\Validator\Constraints as Assert;

/** DTO pour l'inscription — JSON envoyé sur POST /api/register */
class RegisterUserDto
{
    #[Assert\NotBlank]
    #[Assert\Length(min: 1, max: 100)]
    public string $firstName = '';

    #[Assert\NotBlank]
    #[Assert\Length(min: 1, max: 100)]
    public string $lastName = '';

    #[Assert\NotBlank]
    #[Assert\Email]
    #[Assert\Length(max: 255)]
    public string $email = '';

    /** Minimum 8 caractères — aligné sur UpdateUserProfileDto */
    #[Assert\NotBlank]
    #[Assert\Length(min: 8, max: 255)]
    public string $password = '';
}
