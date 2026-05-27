<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationSuccessHandlerInterface;

/** Connexion réussie : JWT posé en cookie httpOnly, pas dans le corps JSON */
final class JwtCookieAuthenticationSuccessHandler implements AuthenticationSuccessHandlerInterface
{
    public function __construct(
        private readonly JwtCookieManager $jwtCookieManager,
    ) {
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token): Response
    {
        $user = $token->getUser();
        if (!\is_object($user)) {
            throw new \LogicException('Utilisateur invalide après authentification.');
        }

        $response = new JsonResponse(['message' => 'Connexion réussie.']);
        $this->jwtCookieManager->attachAuthCookie($response, $user);

        return $response;
    }
}
