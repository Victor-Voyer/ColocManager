<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260716100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Étape #5 (1/2) : ajouter colocation_id/role sur users, migrer données depuis colocation_user, ajouter invitation_code_expires_at sur colocations';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE users ADD colocation_id INT DEFAULT NULL, ADD role VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD CONSTRAINT FK_users_colocation FOREIGN KEY (colocation_id) REFERENCES colocations (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_users_colocation ON users (colocation_id)');
        $this->addSql('UPDATE users u INNER JOIN colocation_user cu ON cu.user_id = u.id SET u.colocation_id = cu.colocation_id, u.role = cu.role');
        $this->addSql('ALTER TABLE colocations ADD invitation_code_expires_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('UPDATE colocations SET invitation_code_expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE users DROP FOREIGN KEY FK_users_colocation');
        $this->addSql('DROP INDEX IDX_users_colocation ON users');
        $this->addSql('ALTER TABLE users DROP colocation_id, DROP role');
        $this->addSql('ALTER TABLE colocations DROP invitation_code_expires_at');
    }
}
