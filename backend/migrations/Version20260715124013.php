<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260715124013 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Supprime split_mode et percentage : répartition toujours manuelle (règle 4)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE expense_shares DROP percentage');
        $this->addSql('ALTER TABLE expenses DROP split_mode');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE expense_shares ADD percentage NUMERIC(5, 2) DEFAULT NULL');
        $this->addSql('ALTER TABLE expenses ADD split_mode VARCHAR(255) NOT NULL');
    }
}
