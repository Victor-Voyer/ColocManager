<?php

namespace App\Entity;

use App\Entity\Trait\TimestampableEntity;
use App\Repository\ExpenseRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ExpenseRepository::class)]
#[ORM\Table(name: 'expenses')]
#[ORM\HasLifecycleCallbacks]
class Expense
{
    use TimestampableEntity;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Colocation::class, inversedBy: 'expenses')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Colocation $colocation;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'expensesPaid')]
    #[ORM\JoinColumn(name: 'paid_by', nullable: true, onDelete: 'SET NULL')]
    private ?User $paidBy = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'expensesCreated')]
    #[ORM\JoinColumn(name: 'created_by', nullable: true, onDelete: 'SET NULL')]
    private ?User $createdBy = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private string $amount = '0.00';

    #[ORM\Column(length: 500)]
    private string $description = '';

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $category = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    private \DateTimeImmutable $expenseDate;

    /** @var Collection<int, ExpenseShare> */
    #[ORM\OneToMany(targetEntity: ExpenseShare::class, mappedBy: 'expense', orphanRemoval: true, cascade: ['persist', 'remove'])]
    private Collection $shares;

    public function __construct()
    {
        $this->shares = new ArrayCollection();
        $this->expenseDate = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getColocation(): Colocation
    {
        return $this->colocation;
    }

    public function setColocation(Colocation $colocation): static
    {
        $this->colocation = $colocation;

        return $this;
    }

    public function getPaidBy(): ?User
    {
        return $this->paidBy;
    }

    public function setPaidBy(?User $paidBy): static
    {
        $this->paidBy = $paidBy;

        return $this;
    }

    public function getCreatedBy(): ?User
    {
        return $this->createdBy;
    }

    public function setCreatedBy(?User $createdBy): static
    {
        $this->createdBy = $createdBy;

        return $this;
    }

    public function getAmount(): string
    {
        return $this->amount;
    }

    public function setAmount(string $amount): static
    {
        $this->amount = $amount;

        return $this;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getCategory(): ?string
    {
        return $this->category;
    }

    public function setCategory(?string $category): static
    {
        $this->category = $category;

        return $this;
    }

    public function getExpenseDate(): \DateTimeImmutable
    {
        return $this->expenseDate;
    }

    public function setExpenseDate(\DateTimeImmutable $expenseDate): static
    {
        $this->expenseDate = $expenseDate;

        return $this;
    }

    /** @return Collection<int, ExpenseShare> */
    public function getShares(): Collection
    {
        return $this->shares;
    }

    public function addShare(ExpenseShare $share): static
    {
        if (!$this->shares->contains($share)) {
            $this->shares->add($share);
            $share->setExpense($this);
        }

        return $this;
    }
}
