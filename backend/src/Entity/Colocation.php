<?php

namespace App\Entity;

use App\Repository\ColocationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ColocationRepository::class)]
#[ORM\Table(name: 'colocations')]
#[ORM\HasLifecycleCallbacks]
class Colocation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $name = '';

    #[ORM\Column(length: 64, unique: true)]
    private string $invitationCode = '';

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column]
    private \DateTimeImmutable $updatedAt;

    /** @var Collection<int, ColocationUser> */
    #[ORM\OneToMany(targetEntity: ColocationUser::class, mappedBy: 'colocation', orphanRemoval: true)]
    private Collection $memberships;

    /** @var Collection<int, InvitationToken> */
    #[ORM\OneToMany(targetEntity: InvitationToken::class, mappedBy: 'colocation', orphanRemoval: true)]
    private Collection $invitationTokens;

    /** @var Collection<int, Expense> */
    #[ORM\OneToMany(targetEntity: Expense::class, mappedBy: 'colocation')]
    private Collection $expenses;

    /** @var Collection<int, Task> */
    #[ORM\OneToMany(targetEntity: Task::class, mappedBy: 'colocation', orphanRemoval: true)]
    private Collection $tasks;

    /** @var Collection<int, ShoppingItem> */
    #[ORM\OneToMany(targetEntity: ShoppingItem::class, mappedBy: 'colocation', orphanRemoval: true)]
    private Collection $shoppingItems;

    /** @var Collection<int, Message> */
    #[ORM\OneToMany(targetEntity: Message::class, mappedBy: 'colocation', orphanRemoval: true)]
    private Collection $messages;

    public function __construct()
    {
        $this->memberships = new ArrayCollection();
        $this->invitationTokens = new ArrayCollection();
        $this->expenses = new ArrayCollection();
        $this->tasks = new ArrayCollection();
        $this->shoppingItems = new ArrayCollection();
        $this->messages = new ArrayCollection();
    }

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $now = new \DateTimeImmutable();
        $this->createdAt = $now;
        $this->updatedAt = $now;
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
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

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTimeImmutable
    {
        return $this->updatedAt;
    }

    /** @return Collection<int, ColocationUser> */
    public function getMemberships(): Collection
    {
        return $this->memberships;
    }

    public function addMembership(ColocationUser $membership): static
    {
        if (!$this->memberships->contains($membership)) {
            $this->memberships->add($membership);
            $membership->setColocation($this);
        }

        return $this;
    }

    public function removeMembership(ColocationUser $membership): static
    {
        if ($this->memberships->removeElement($membership)) {
            if ($membership->getColocation() === $this) {
                $membership->setColocation($this);
            }
        }

        return $this;
    }

    /** @return Collection<int, InvitationToken> */
    public function getInvitationTokens(): Collection
    {
        return $this->invitationTokens;
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

    /** @return Collection<int, ShoppingItem> */
    public function getShoppingItems(): Collection
    {
        return $this->shoppingItems;
    }

    /** @return Collection<int, Message> */
    public function getMessages(): Collection
    {
        return $this->messages;
    }
}
