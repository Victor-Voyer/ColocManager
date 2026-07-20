<?php

namespace App\Entity;

use App\Entity\Trait\TimestampableEntity;
use App\Repository\ColocationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ColocationRepository::class)]
#[ORM\Table(name: 'colocations')]
#[ORM\HasLifecycleCallbacks]
class Colocation
{
    use TimestampableEntity;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $name = '';

    #[ORM\Column(length: 64, unique: true)]
    private string $invitationCode = '';

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $invitationCodeExpiresAt = null;

    /** @var Collection<int, User> */
    #[ORM\OneToMany(targetEntity: User::class, mappedBy: 'colocation')]
    private Collection $members;

    /** @var Collection<int, Expense> */
    #[ORM\OneToMany(targetEntity: Expense::class, mappedBy: 'colocation')]
    private Collection $expenses;

    /** @var Collection<int, Task> */
    #[ORM\OneToMany(targetEntity: Task::class, mappedBy: 'colocation', orphanRemoval: true)]
    private Collection $tasks;

    public function __construct()
    {
        $this->members = new ArrayCollection();
        $this->expenses = new ArrayCollection();
        $this->tasks = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getInvitationCode(): string
    {
        return $this->invitationCode;
    }

    public function setInvitationCode(string $invitationCode): static
    {
        $this->invitationCode = $invitationCode;

        return $this;
    }

    public function getInvitationCodeExpiresAt(): ?\DateTimeImmutable
    {
        return $this->invitationCodeExpiresAt;
    }

    public function setInvitationCodeExpiresAt(?\DateTimeImmutable $invitationCodeExpiresAt): static
    {
        $this->invitationCodeExpiresAt = $invitationCodeExpiresAt;

        return $this;
    }

    /** @return Collection<int, User> */
    public function getMembers(): Collection
    {
        return $this->members;
    }

    /** @return Collection<int, Expense> */
    public function getExpenses(): Collection
    {
        return $this->expenses;
    }

    /** @return Collection<int, Task> */
    public function getTasks(): Collection
    {
        return $this->tasks;
    }
}
