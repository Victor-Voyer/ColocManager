<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260615091500 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Convert task in_progress status to pending.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("UPDATE tasks SET status = 'pending' WHERE status = 'in_progress'");
    }

    public function down(Schema $schema): void
    {
    }
}
