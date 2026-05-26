<?php

namespace App\Exception;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\ConstraintViolationListInterface;

/**
 * Exception métier avec code HTTP.
 * Convertie automatiquement en JSON par ApiExceptionSubscriber.
 */
final class ApiException extends \RuntimeException
{
    /**
     * @param array<string, mixed> $extra Données additionnelles dans la réponse JSON
     */
    public function __construct(
        string $message,
        private readonly int $statusCode = Response::HTTP_BAD_REQUEST,
        private readonly array $extra = [],
    ) {
        parent::__construct($message);
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    /** @return array<string, mixed> */
    public function getExtra(): array
    {
        return $this->extra;
    }

    /** Raccourci pour une erreur 404 */
    public static function notFound(string $message): self
    {
        return new self($message, Response::HTTP_NOT_FOUND);
    }

    /** Raccourci pour une erreur 403 */
    public static function forbidden(string $message): self
    {
        return new self($message, Response::HTTP_FORBIDDEN);
    }

    /** Raccourci pour une erreur 409 */
    public static function conflict(string $message, array $extra = []): self
    {
        return new self($message, Response::HTTP_CONFLICT, $extra);
    }

    /** Raccourci pour une erreur 422 avec la liste des erreurs de validation */
    public static function validation(ConstraintViolationListInterface $violations): self
    {
        $messages = [];
        foreach ($violations as $violation) {
            $messages[$violation->getPropertyPath()] = $violation->getMessage();
        }

        return new self('Données invalides.', Response::HTTP_UNPROCESSABLE_ENTITY, ['errors' => $messages]);
    }
}
