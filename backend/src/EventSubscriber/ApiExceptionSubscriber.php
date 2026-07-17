<?php

namespace App\EventSubscriber;

use App\Exception\ApiException;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Validator\Exception\ValidationFailedException;

/**
 * Hook Symfony (EventSubscriber) : intercepte les ApiException
 * et les transforme en réponses JSON avant qu'elles n'atteignent le client.
 *
 * Gère aussi le cas des DTO liés via #[MapRequestPayload] : le
 * RequestPayloadValueResolver de Symfony valide ces DTO et lève lui-même
 * une UnprocessableEntityHttpException (enveloppant une
 * ValidationFailedException) avant même d'atteindre le contrôleur — on la
 * reconvertit ici vers le même format que ApiException::validation() pour
 * que le front reçoive toujours la même forme de réponse d'erreur.
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

        if ($exception instanceof UnprocessableEntityHttpException
            && ($previous = $exception->getPrevious()) instanceof ValidationFailedException
        ) {
            $exception = ApiException::validation($previous->getViolations());
        }

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
