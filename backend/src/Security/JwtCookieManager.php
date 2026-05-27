<?php

namespace App\Security;

use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\User\UserInterface;

/** Pose ou supprime le JWT dans un cookie httpOnly */
final class JwtCookieManager
{
    public const COOKIE_NAME = 'BEARER';

    public function __construct(
        private readonly JWTTokenManagerInterface $jwtManager,
        private readonly bool $secureCookie = false,
    ) {
    }

    public function attachAuthCookie(Response $response, UserInterface $user): void
    {
        $response->headers->setCookie($this->createAuthCookie($user));
    }

    public function createAuthCookie(UserInterface $user): Cookie
    {
        return Cookie::create(self::COOKIE_NAME)
            ->withValue($this->jwtManager->create($user))
            ->withHttpOnly(true)
            ->withSecure($this->secureCookie)
            ->withSameSite('lax')
            ->withPath('/');
    }

    public function createClearCookie(): Cookie
    {
        return Cookie::create(self::COOKIE_NAME)
            ->withValue('')
            ->withHttpOnly(true)
            ->withSecure($this->secureCookie)
            ->withSameSite('lax')
            ->withPath('/')
            ->withExpires(new \DateTimeImmutable('-1 day'));
    }
}
