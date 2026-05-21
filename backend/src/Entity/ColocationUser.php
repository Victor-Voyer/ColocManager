<?php

namespace App\Entity;

use App\Enum\ColocationRole;
use App\Repository\ColocationUserRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ColocationUserRepository::class)]
#[ORM\Table(name: 'colocation_user')]
class ColocationUser
{
    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'colocationMemberships')]
    #[ORM\JoinColumn(name: 'user_id', nullable: false, onDelete: 'CASCADE')]
    private User $user;

    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: Colocation::class, inversedBy: 'memberships')]
    #[ORM\JoinColumn(name: 'colocation_id', nullable: false, onDelete: 'CASCADE')]
    private Colocation $colocation;

    #[ORM\Column(enumType: ColocationRole::class)]
    private ColocationRole $role = ColocationRole::Member;

    #[ORM\Column]
    private \DateTimeImmutable $joinedAt;

    public function __construct(User $user, Colocation $colocation)
    {
        $this->user = $user;
        $this->colocation = $colocation;
        $this->joinedAt = new \DateTimeImmutable();
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

    public function getColocation(): Colocation
    {
        return $this->colocation;
    }

    public function setColocation(Colocation $colocation): static
    {
        $this->colocation = $colocation;

        return $this;
    }

    public function getRole(): ColocationRole
    {
        return $this->role;
    }

    public function setRole(ColocationRole $role): static
    {
        $this->role = $role;

        return $this;
    }

    public function getJoinedAt(): \DateTimeImmutable
    {
        return $this->joinedAt;
    }

    public function setJoinedAt(\DateTimeImmutable $joinedAt): static
    {
        $this->joinedAt = $joinedAt;

        return $this;
    }
}
