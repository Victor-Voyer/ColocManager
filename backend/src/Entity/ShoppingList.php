<?php

namespace App\Entity;

use App\Repository\ShoppingListRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ShoppingListRepository::class)]
#[ORM\Table(name: 'shopping_lists')]
#[ORM\HasLifecycleCallbacks]
class ShoppingList
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Colocation::class, inversedBy: 'shoppingLists')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Colocation $colocation;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'shoppingListsCreated')]
    #[ORM\JoinColumn(name: 'created_by', nullable: false)]
    private User $createdBy;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $name = null;

    #[ORM\Column]
    private bool $isArchived = false;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    /** @var Collection<int, ShoppingItem> */
    #[ORM\OneToMany(targetEntity: ShoppingItem::class, mappedBy: 'shoppingList', orphanRemoval: true)]
    private Collection $items;

    public function __construct()
    {
        $this->items = new ArrayCollection();
    }

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

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): static
    {
        $this->name = $name;

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

    /** @return Collection<int, ShoppingItem> */
    public function getItems(): Collection
    {
        return $this->items;
    }

    public function addItem(ShoppingItem $item): static
    {
        if (!$this->items->contains($item)) {
            $this->items->add($item);
            $item->setShoppingList($this);
        }

        return $this;
    }

    public function removeItem(ShoppingItem $item): static
    {
        $this->items->removeElement($item);

        return $this;
    }
}
