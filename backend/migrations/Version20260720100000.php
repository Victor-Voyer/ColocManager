<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260720100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajoute le créateur des dépenses pour contrôler la validation des remboursements';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE expenses ADD created_by INT DEFAULT NULL');
        $this->addSql('UPDATE expenses SET created_by = paid_by WHERE created_by IS NULL');
        $this->addSql('ALTER TABLE expenses ADD CONSTRAINT FK_expenses_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_expenses_created_by ON expenses (created_by)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE expenses DROP FOREIGN KEY FK_expenses_created_by');
        $this->addSql('DROP INDEX IDX_expenses_created_by ON expenses');
        $this->addSql('ALTER TABLE expenses DROP created_by');
    }
}
