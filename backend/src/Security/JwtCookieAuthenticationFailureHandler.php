<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authentication\AuthenticationFailureHandlerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

/** Échec de connexion : message en français, format JSON aligné sur ApiException */
final class JwtCookieAuthenticationFailureHandler implements AuthenticationFailureHandlerInterface
{
    public function __construct(
        private readonly TranslatorInterface $translator,
    ) {
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): Response
    {
        $message = $this->translator->trans(
            $exception->getMessageKey(),
            $exception->getMessageData(),
            'security',
        );

        return new JsonResponse(['error' => $message], Response::HTTP_UNAUTHORIZED);
    }
}
