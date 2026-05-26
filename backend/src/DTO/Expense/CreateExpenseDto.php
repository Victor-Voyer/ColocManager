<?php

namespace App\DTO\Expense;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO pour créer une dépense.
 * Représente le JSON envoyé sur POST /api/colocations/{id}/expenses.
 *
 * splitMode :
 * - equal    → participantUserIds (ou tous les membres si vide)
 * - weighted → shares[].percentage (somme = 100)
 * - custom   → shares[].amountOwed (somme = amount)
 */
class CreateExpenseDto
{
    #[Assert\NotBlank]
    #[Assert\Positive]
    public string $amount = '0.00';

    #[Assert\NotBlank]
    #[Assert\Length(max: 500)]
    public string $description = '';

    #[Assert\Length(max: 100)]
    public ?string $category = null;

    #[Assert\NotBlank]
    #[Assert\Choice(choices: ['equal', 'weighted', 'custom'])]
    public string $splitMode = 'equal';

    /** Format Y-m-d — par défaut aujourd'hui si omis */
    public ?string $expenseDate = null;

    /** ID du payeur — par défaut l'utilisateur connecté */
    #[Assert\Positive]
    public ?int $paidByUserId = null;

    /** Membres concernés (mode equal) — tous les membres si vide */
    #[Assert\All([new Assert\Positive()])]
    public array $participantUserIds = [];

    /** Parts détaillées (modes weighted et custom) */
    #[Assert\Valid]
    public array $shares = [];
}
