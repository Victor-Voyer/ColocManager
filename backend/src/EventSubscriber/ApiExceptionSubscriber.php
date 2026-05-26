<?php

namespace App\EventSubscriber;

use App\Exception\ApiException;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Hook Symfony (EventSubscriber) : intercepte les ApiException
 * et les transforme en réponses JSON avant qu'elles n'atteignent le client.
 */
final class ApiExceptionSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::EXCEPTION => 'onKernelException',
        ];
    }

    public function onKernelException(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();

        // On ne gère que nos exceptions métier — les autres passent à Symfony
        if (!$exception instanceof ApiException) {
            return;
        }

        $payload = array_merge(
            ['error' => $exception->getMessage()],
            $exception->getExtra(),
        );

        $event->setResponse(new JsonResponse($payload, $exception->getStatusCode()));
    }
}
