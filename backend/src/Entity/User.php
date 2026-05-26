<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: 'users')]
#[ORM\HasLifecycleCallbacks]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private string $firstName = '';

    #[ORM\Column(length: 100)]
    private string $lastName = '';

    #[ORM\Column(length: 255, unique: true)]
    private string $email = '';

    #[ORM\Column(length: 255)]
    private string $passwordHash = '';

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $avatarUrl = null;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column]
    private \DateTimeImmutable $updatedAt;

    /** @var Collection<int, ColocationUser> */
    #[ORM\OneToMany(targetEntity: ColocationUser::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $colocationMemberships;

    /** @var Collection<int, InvitationToken> */
    #[ORM\OneToMany(targetEntity: InvitationToken::class, mappedBy: 'createdBy')]
    private Collection $invitationTokensCreated;

    /** @var Collection<int, Expense> */
    #[ORM\OneToMany(targetEntity: Expense::class, mappedBy: 'paidBy')]
    private Collection $expensesPaid;

    /** @var Collection<int, ExpenseShare> */
    #[ORM\OneToMany(targetEntity: ExpenseShare::class, mappedBy: 'user')]
    private Collection $expenseShares;

    /** @var Collection<int, Task> */
    #[ORM\OneToMany(targetEntity: Task::class, mappedBy: 'assignedTo')]
    private Collection $tasksAssigned;

    /** @var Collection<int, TaskRotationMember> */
    #[ORM\OneToMany(targetEntity: TaskRotationMember::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $taskRotationMemberships;

    /** @var Collection<int, ShoppingItem> */
    #[ORM\OneToMany(targetEntity: ShoppingItem::class, mappedBy: 'createdBy')]
    private Collection $shoppingItemsCreated;

    /** @var Collection<int, ShoppingItem> */
    #[ORM\OneToMany(targetEntity: ShoppingItem::class, mappedBy: 'assignedTo')]
    private Collection $shoppingItemsAssigned;

    /** @var Collection<int, Message> */
    #[ORM\OneToMany(targetEntity: Message::class, mappedBy: 'user')]
    private Collection $messages;

    public function __construct()
    {
        $this->colocationMemberships = new ArrayCollection();
        $this->invitationTokensCreated = new ArrayCollection();
        $this->expensesPaid = new ArrayCollection();
        $this->expenseShares = new ArrayCollection();
        $this->tasksAssigned = new ArrayCollection();
        $this->taskRotationMemberships = new ArrayCollection();
        $this->shoppingItemsCreated = new ArrayCollection();
        $this->shoppingItemsAssigned = new ArrayCollection();
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

    public function getFirstName(): string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): static
    {
        $this->firstName = $firstName;

        return $this;
    }

    public function getLastName(): string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): static
    {
        $this->lastName = $lastName;

        return $this;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getPasswordHash(): string
    {
        return $this->passwordHash;
    }

    public function setPasswordHash(string $passwordHash): static
    {
        $this->passwordHash = $passwordHash;

        return $this;
    }

    public function getAvatarUrl(): ?string
    {
        return $this->avatarUrl;
    }

    public function setAvatarUrl(?string $avatarUrl): static
    {
        $this->avatarUrl = $avatarUrl;

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
    public function getColocationMemberships(): Collection
    {
        return $this->colocationMemberships;
    }

    public function addColocationMembership(ColocationUser $membership): static
    {
        if (!$this->colocationMemberships->contains($membership)) {
            $this->colocationMemberships->add($membership);
            $membership->setUser($this);
        }

        return $this;
    }

    public function removeColocationMembership(ColocationUser $membership): static
    {
        if ($this->colocationMemberships->removeElement($membership)) {
            if ($membership->getUser() === $this) {
                $membership->setUser($this);
            }
        }

        return $this;
    }

    /** @return Collection<int, InvitationToken> */
    public function getInvitationTokensCreated(): Collection
    {
        return $this->invitationTokensCreated;
    }

    /** @return Collection<int, Expense> */
    public function getExpensesPaid(): Collection
    {
        return $this->expensesPaid;
    }

    /** @return Collection<int, ExpenseShare> */
    public function getExpenseShares(): Collection
    {
        return $this->expenseShares;
    }

    /** @return Collection<int, Task> */
    public function getTasksAssigned(): Collection
    {
        return $this->tasksAssigned;
    }

    /** @return Collection<int, TaskRotationMember> */
    public function getTaskRotationMemberships(): Collection
    {
        return $this->taskRotationMemberships;
    }

    /** @return Collection<int, ShoppingItem> */
    public function getShoppingItemsCreated(): Collection
    {
        return $this->shoppingItemsCreated;
    }

    /** @return Collection<int, ShoppingItem> */
    public function getShoppingItemsAssigned(): Collection
    {
        return $this->shoppingItemsAssigned;
    }

    /** @return Collection<int, Message> */
    public function getMessages(): Collection
    {
        return $this->messages;
    }

    public function getUserIdentifier(): string
    {
        return $this->email;
    }

    /** @return list<string> */
    public function getRoles(): array
    {
        return ['ROLE_USER'];
    }

    public function eraseCredentials(): void
    {
    }

    public function getPassword(): ?string
    {
        return $this->passwordHash;
    }
}
