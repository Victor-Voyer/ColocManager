<?php

namespace App\Controller;

use App\DTO\Task\CreateTaskDto;
use App\DTO\Task\UpdateTaskDto;
use App\Exception\ApiException;
use App\Service\Security\CurrentUserProvider;
use App\Service\Task\TaskService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Gere le planning des taches menageres d'une colocation.
 * Toutes les routes necessitent d'etre connecte (JWT).
 * La logique metier est deleguee a TaskService.
 */
#[Route('/api')]
#[IsGranted('ROLE_USER')]
class TaskController extends AbstractController
{
    public function __construct(
        private readonly CurrentUserProvider $currentUserProvider,
        private readonly TaskService $taskService,
        private readonly ValidatorInterface $validator,
    ) {
    }

    /** POST /api/colocations/{colocationId}/tasks - Cree une tache */
    #[Route('/colocations/{colocationId}/tasks', name: 'api_task_create', methods: ['POST'], requirements: ['colocationId' => '\d+'])] 
    /*collocationId doit respecter le format regex avec un chiffre entre 0-9 et possibilité d'en avoir plsusieurs */ 
    public function create(int $colocationId, #[MapRequestPayload] CreateTaskDto $dto): JsonResponse
    {
        $this->validate($dto);

        return $this->json(
            $this->taskService->create($this->currentUserProvider->getUser(), $colocationId, $dto),
            Response::HTTP_CREATED,
        );
    }

    /** GET /api/colocations/{colocationId}/tasks - Liste des taches (filtres : status, assignedTo) */
    #[Route('/colocations/{colocationId}/tasks', name: 'api_task_list', methods: ['GET'], requirements: ['colocationId' => '\d+'])]
    public function list(int $colocationId, Request $request): JsonResponse
    {
        return $this->json(
            $this->taskService->list(
                $this->currentUserProvider->getUser(),
                $colocationId,
                $request->query->get('status'),
                $request->query->getInt('assignedTo') > 0 ? $request->query->getInt('assignedTo') : null,
            ),
        );
    }

    /** GET /api/colocations/{colocationId}/tasks/history - Historique des 10 dernieres taches terminees */
    #[Route('/colocations/{colocationId}/tasks/history', name: 'api_task_history', methods: ['GET'], requirements: ['colocationId' => '\d+'])]
    public function history(int $colocationId): JsonResponse
    {
        return $this->json(
            $this->taskService->history($this->currentUserProvider->getUser(), $colocationId),
        );
    }

    /** GET /api/colocations/{colocationId}/tasks/{taskId} - Detail d'une tache */
    #[Route('/colocations/{colocationId}/tasks/{taskId}', name: 'api_task_show', methods: ['GET'], requirements: ['colocationId' => '\d+', 'taskId' => '\d+'])]
    public function show(int $colocationId, int $taskId): JsonResponse
    {
        return $this->json(
            $this->taskService->show($this->currentUserProvider->getUser(), $colocationId, $taskId),
        );
    }

    /** PUT /api/colocations/{colocationId}/tasks/{taskId} - Modifie une tache */
    #[Route('/colocations/{colocationId}/tasks/{taskId}', name: 'api_task_update', methods: ['PUT'], requirements: ['colocationId' => '\d+', 'taskId' => '\d+'])]
    public function update(int $colocationId, int $taskId, #[MapRequestPayload] UpdateTaskDto $dto): JsonResponse
    {
        $this->validate($dto);

        return $this->json(
            $this->taskService->update($this->currentUserProvider->getUser(), $colocationId, $taskId, $dto),
        );
    }

    /** DELETE /api/colocations/{colocationId}/tasks/{taskId} - Supprime une tache */
    #[Route('/colocations/{colocationId}/tasks/{taskId}', name: 'api_task_delete', methods: ['DELETE'], requirements: ['colocationId' => '\d+', 'taskId' => '\d+'])]
    public function delete(int $colocationId, int $taskId): JsonResponse
    {
        $this->taskService->delete($this->currentUserProvider->getUser(), $colocationId, $taskId);

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    /** PATCH /api/tasks/{taskId}/complete - Marque une tache comme terminee */
    #[Route('/tasks/{taskId}/complete', name: 'api_task_complete', methods: ['PATCH'], requirements: ['taskId' => '\d+'])]
    public function complete(int $taskId): JsonResponse
    {
        return $this->json(
            $this->taskService->complete($this->currentUserProvider->getUser(), $taskId),
        );
    }

    /** Valide un DTO - leve ApiException (422) si les donnees sont invalides */
    private function validate(object $dto, ?array $groups = null): void
    {
        $errors = $this->validator->validate($dto, null, $groups ?? []);
        if (count($errors) > 0) {
            throw ApiException::validation($errors);
        }
    }
}