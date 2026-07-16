<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260716100002 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Sync schéma : renommage index Doctrine + nettoyage COMMENT sur invitation_code_expires_at';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE colocations CHANGE invitation_code_expires_at invitation_code_expires_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE users RENAME INDEX idx_users_colocation TO IDX_1483A5E98B419309');
        $this->addSql('ALTER TABLE tasks RENAME INDEX idx_tasks_created_by TO IDX_50586597DE12AB56');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE colocations CHANGE invitation_code_expires_at invitation_code_expires_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE users RENAME INDEX IDX_1483A5E98B419309 TO idx_users_colocation');
        $this->addSql('ALTER TABLE tasks RENAME INDEX IDX_50586597DE12AB56 TO idx_tasks_created_by');
    }
}
