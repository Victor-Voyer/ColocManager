<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260715122716 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Supprime invitation_tokens (remplacé par invitation_code sur colocations, MLD)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE invitation_tokens DROP FOREIGN KEY `FK_E65FCA448B419309`');
        $this->addSql('ALTER TABLE invitation_tokens DROP FOREIGN KEY `FK_E65FCA44DE12AB56`');
        $this->addSql('DROP TABLE invitation_tokens');
    }

    public function down(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
            CREATE TABLE invitation_tokens (
              id INT AUTO_INCREMENT NOT NULL,
              token VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_0900_ai_ci`,
              email VARCHAR(255) CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_0900_ai_ci`,
              expires_at DATETIME NOT NULL,
              used_at DATETIME DEFAULT NULL,
              colocation_id INT NOT NULL,
              created_by INT NOT NULL,
              UNIQUE INDEX UNIQ_E65FCA445F37A13B (token),
              INDEX IDX_E65FCA448B419309 (colocation_id),
              INDEX IDX_E65FCA44DE12AB56 (created_by),
              PRIMARY KEY (id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_0900_ai_ci` ENGINE = InnoDB COMMENT = ''
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE
              invitation_tokens
            ADD
              CONSTRAINT `FK_E65FCA448B419309` FOREIGN KEY (colocation_id) REFERENCES colocations (id) ON
            UPDATE
              NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE
              invitation_tokens
            ADD
              CONSTRAINT `FK_E65FCA44DE12AB56` FOREIGN KEY (created_by) REFERENCES users (id) ON
            UPDATE
              NO ACTION ON DELETE NO ACTION
        SQL);
    }
}
