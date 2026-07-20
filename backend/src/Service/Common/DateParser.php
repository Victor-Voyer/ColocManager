<?php

namespace App\Service\Common;

use App\Exception\ApiException;

final class DateParser
{
    /** Parse une date Y-m-d ; lève une exception si le format est invalide. */
    public static function parseYmd(string $date, ?string $paramName = null): \DateTimeImmutable
    {
        $parsed = \DateTimeImmutable::createFromFormat('Y-m-d', $date);
        if ($parsed === false) {
            $message = $paramName !== null
                ? sprintf('Format de date invalide pour "%s" (attendu : Y-m-d).', $paramName)
                : 'Date invalide, format attendu : Y-m-d.';

            throw new ApiException($message);
        }

        return $parsed;
    }

    /** Retourne null si absent/vide, sinon parse avec validation stricte. */
    public static function parseOptionalYmd(mixed $value, string $paramName): ?\DateTimeImmutable
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_array($value) || !is_string($value)) {
            throw new ApiException(sprintf('Format de date invalide pour "%s" (attendu : Y-m-d).', $paramName));
        }

        return self::parseYmd($value, $paramName);
    }

    /** Pour les champs optionnels métier : null/vide → null, invalide → exception. */
    public static function parseNullableYmd(?string $date): ?\DateTimeImmutable
    {
        if ($date === null || $date === '') {
            return null;
        }

        return self::parseYmd($date);
    }

    /** Pour les champs obligatoires avec défaut : null/vide/invalide → today. */
    public static function parseOrToday(?string $date): \DateTimeImmutable
    {
        if ($date === null || $date === '') {
            return new \DateTimeImmutable('today');
        }

        $parsed = \DateTimeImmutable::createFromFormat('Y-m-d', $date);

        return $parsed === false ? new \DateTimeImmutable('today') : $parsed;
    }
}
