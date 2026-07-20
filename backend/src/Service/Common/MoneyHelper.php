<?php

namespace App\Service\Common;

final class MoneyHelper
{
    public static function toCents(string $amount): int
    {
        return (int) round((float) $amount * 100);
    }

    public static function centsToAmount(int $cents): string
    {
        return number_format($cents / 100, 2, '.', '');
    }

    public static function subtract(string $a, string $b): string
    {
        return self::centsToAmount(self::toCents($a) - self::toCents($b));
    }
}
