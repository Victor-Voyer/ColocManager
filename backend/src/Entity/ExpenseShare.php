<?php

namespace App\Entity;

use App\Repository\ExpenseShareRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ExpenseShareRepository::class)]
#[ORM\Table(name: 'expense_shares')]
#[ORM\UniqueConstraint(name: 'uniq_expense_user', columns: ['expense_id', 'user_id'])]
class ExpenseShare
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Expense::class, inversedBy: 'shares')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Expense $expense;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'expenseShares')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'RESTRICT')]
    private User $user;

    #[ORM\Column(name: 'amount_owed', type: Types::DECIMAL, precision: 10, scale: 2)]
    private string $amountOwed = '0.00';

    #[ORM\Column]
    private bool $isPaid = false;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $paidAt = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getExpense(): Expense
    {
        return $this->expense;
    }

    public function setExpense(Expense $expense): static
    {
        $this->expense = $expense;

        return $this;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getAmountOwed(): string
    {
        return $this->amountOwed;
    }

    public function setAmountOwed(string $amountOwed): static
    {
        $this->amountOwed = $amountOwed;

        return $this;
    }

    public function isPaid(): bool
    {
        return $this->isPaid;
    }

    public function setIsPaid(bool $isPaid): static
    {
        $this->isPaid = $isPaid;

        return $this;
    }

    public function getPaidAt(): ?\DateTimeImmutable
    {
        return $this->paidAt;
    }

    public function setPaidAt(?\DateTimeImmutable $paidAt): static
    {
        $this->paidAt = $paidAt;

        return $this;
    }
}
