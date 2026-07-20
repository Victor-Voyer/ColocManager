<?php

namespace App\EventSubscriber;

use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationFailureEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Events;
use Lexik\Bundle\JWTAuthenticationBundle\Response\JWTAuthenticationFailureResponse;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Remplace les messages JWT Lexik (souvent en anglais) par leurs traductions françaises.
 */
final class JwtAuthenticationFailureSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly TranslatorInterface $translator,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            Events::JWT_EXPIRED => 'onJwtFailure',
            Events::JWT_INVALID => 'onJwtFailure',
            Events::JWT_NOT_FOUND => 'onJwtFailure',
        ];
    }

    public function onJwtFailure(AuthenticationFailureEvent $event): void
    {
        $response = $event->getResponse();
        if (!$response instanceof JWTAuthenticationFailureResponse) {
            return;
        }

        $exception = $event->getException();
        $message = $this->translator->trans(
            $exception->getMessageKey(),
            $exception->getMessageData(),
            'security',
        );

        $response->setMessage($message);
    }
}
