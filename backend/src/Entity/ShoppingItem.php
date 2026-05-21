<?php

namespace App\Entity;

use App\Enum\ShoppingItemStatus;
use App\Repository\ShoppingItemRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ShoppingItemRepository::class)]
#[ORM\Table(name: 'shopping_items')]
#[ORM\HasLifecycleCallbacks]
class ShoppingItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Colocation::class, inversedBy: 'shoppingItems')]
    #[ORM\JoinColumn(nullable: false)]
    private Colocation $colocation;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'shoppingItemsCreated')]
    #[ORM\JoinColumn(name: 'created_by', nullable: false)]
    private User $createdBy;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'shoppingItemsAssigned')]
    #[ORM\JoinColumn(name: 'assigned_to', nullable: true, onDelete: 'SET NULL')]
    private ?User $assignedTo = null;

    #[ORM\Column(length: 255)]
    private string $name = '';

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, options: ['default' => '1'])]
    private string $quantity = '1';

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $unit = null;

    #[ORM\Column(enumType: ShoppingItemStatus::class)]
    private ShoppingItemStatus $status = ShoppingItemStatus::ToBuy;

    #[ORM\Column]
    private bool $isArchived = false;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $boughtAt = null;

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt = new \DateTimeImmutable();
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

    public function getCreatedBy(): User
    {
        return $this->createdBy;
    }

    public function setCreatedBy(User $createdBy): static
    {
        $this->createdBy = $createdBy;

        return $this;
    }

    public function getAssignedTo(): ?User
    {
        return $this->assignedTo;
    }

    public function setAssignedTo(?User $assignedTo): static
    {
        $this->assignedTo = $assignedTo;

        return $this;
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

    public function getQuantity(): string
    {
        return $this->quantity;
    }

    public function setQuantity(string $quantity): static
    {
        $this->quantity = $quantity;

        return $this;
    }

    public function getUnit(): ?string
    {
        return $this->unit;
    }

    public function setUnit(?string $unit): static
    {
        $this->unit = $unit;

        return $this;
    }

    public function getStatus(): ShoppingItemStatus
    {
        return $this->status;
    }

    public function setStatus(ShoppingItemStatus $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function isArchived(): bool
    {
        return $this->isArchived;
    }

    public function setIsArchived(bool $isArchived): static
    {
        $this->isArchived = $isArchived;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getBoughtAt(): ?\DateTimeImmutable
    {
        return $this->boughtAt;
    }

    public function setBoughtAt(?\DateTimeImmutable $boughtAt): static
    {
        $this->boughtAt = $boughtAt;

        return $this;
    }
}
