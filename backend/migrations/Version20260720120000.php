<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260720120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Supprime la colonne avatar_url de la table users';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE users DROP avatar_url');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE users ADD avatar_url VARCHAR(255) DEFAULT NULL');
    }
}
