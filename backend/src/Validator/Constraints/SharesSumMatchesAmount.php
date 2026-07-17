<?php

namespace App\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * Vérifie la cohérence entre les parts saisies (shares[].amountOwed) et le
 * montant total de la dépense (amount). Contrainte de classe : s'applique
 * sur un DTO exposant les propriétés `amount` et `shares` (règle 5 / section 6).
 *
 * Une part sans montant (`amountOwed` null) est calculée automatiquement :
 * la somme des parts explicites ne doit alors pas dépasser le montant total
 * (le reste est réparti automatiquement). Si toutes les parts sont
 * explicites, leur somme doit être strictement égale au montant total.
 */
#[\Attribute(\Attribute::TARGET_CLASS)]
class SharesSumMatchesAmount extends Constraint
{
    public string $message = 'La somme des parts doit être égale au montant total.';
    public string $exceededMessage = 'La somme des montants précis dépasse le montant total.';

    public function getTargets(): string|array
    {
        return self::CLASS_CONSTRAINT;
    }
}
