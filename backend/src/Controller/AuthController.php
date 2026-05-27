<?php

namespace App\Controller;

use App\DTO\User\RegisterUserDto;
use App\Exception\ApiException;
use App\Security\JwtCookieManager;
use App\Service\Auth\AuthService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/** Inscription, connexion (json_login) et déconnexion via cookie httpOnly */
#[Route('/api')]
class AuthController extends AbstractController
{
    public function __construct(
        private readonly AuthService $authService,
        private readonly JwtCookieManager $jwtCookieManager,
        private readonly ValidatorInterface $validator,
    ) {
    }

    /** POST /api/register — Crée un compte et pose le JWT en cookie httpOnly */
    #[Route('/register', name: 'api_auth_register', methods: ['POST'])]
    public function register(#[MapRequestPayload] RegisterUserDto $dto): JsonResponse
    {
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            throw ApiException::validation($errors);
        }

        $user = $this->authService->register($dto);
        $response = $this->json(
            ['message' => 'Compte créé avec succès.'],
            Response::HTTP_CREATED,
        );
        $this->jwtCookieManager->attachAuthCookie($response, $user);

        return $response;
    }

    /**
     * POST /api/login — Intercepté par le firewall json_login.
     * Cette méthode ne doit jamais être exécutée.
     */
    #[Route('/login', name: 'api_auth_login', methods: ['POST'])]
    public function login(): never
    {
        throw new \LogicException('Intercepté par le firewall de connexion.');
    }

    /** POST /api/logout — Supprime le cookie JWT */
    #[Route('/logout', name: 'api_auth_logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        $response = $this->json(['message' => 'Déconnexion réussie.']);
        $response->headers->setCookie($this->jwtCookieManager->createClearCookie());

        return $response;
    }
}
