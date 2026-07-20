<?php

namespace App\Entity;

use App\Entity\Trait\TimestampableEntity;
use App\Enum\ColocationRole;
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
    use TimestampableEntity;

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

    #[ORM\ManyToOne(targetEntity: Colocation::class, inversedBy: 'members')]
    #[ORM\JoinColumn(name: 'colocation_id', nullable: true, onDelete: 'SET NULL')]
    private ?Colocation $colocation = null;

    #[ORM\Column(enumType: ColocationRole::class, nullable: true)]
    private ?ColocationRole $role = null;

    /** @var Collection<int, Expense> */
    #[ORM\OneToMany(targetEntity: Expense::class, mappedBy: 'paidBy')]
    private Collection $expensesPaid;

    /** @var Collection<int, Expense> */
    #[ORM\OneToMany(targetEntity: Expense::class, mappedBy: 'createdBy')]
    private Collection $expensesCreated;

    /** @var Collection<int, ExpenseShare> */
    #[ORM\OneToMany(targetEntity: ExpenseShare::class, mappedBy: 'user')]
    private Collection $expenseShares;

    /** @var Collection<int, Task> */
    #[ORM\OneToMany(targetEntity: Task::class, mappedBy: 'assignedTo')]
    private Collection $tasksAssigned;

    /** @var Collection<int, Task> */
    #[ORM\OneToMany(targetEntity: Task::class, mappedBy: 'createdBy')]
    private Collection $tasksCreated;

    public function __construct()
    {
        $this->expensesPaid = new ArrayCollection();
        $this->expensesCreated = new ArrayCollection();
        $this->expenseShares = new ArrayCollection();
        $this->tasksAssigned = new ArrayCollection();
        $this->tasksCreated = new ArrayCollection();
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

    public function getColocation(): ?Colocation
    {
        return $this->colocation;
    }

    public function setColocation(?Colocation $colocation): static
    {
        $this->colocation = $colocation;

        return $this;
    }

    public function getRole(): ?ColocationRole
    {
        return $this->role;
    }

    public function setRole(?ColocationRole $role): static
    {
        $this->role = $role;

        return $this;
    }

    /** @return Collection<int, Expense> */
    public function getExpensesPaid(): Collection
    {
        return $this->expensesPaid;
    }

    /** @return Collection<int, Expense> */
    public function getExpensesCreated(): Collection
    {
        return $this->expensesCreated;
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

    /** @return Collection<int, Task> */
    public function getTasksCreated(): Collection
    {
        return $this->tasksCreated;
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
