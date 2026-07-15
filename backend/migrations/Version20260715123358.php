<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260715123358 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Supprime task_rotation_members, recurrence et rotation_index (hors périmètre CDC v2)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE task_rotation_members DROP FOREIGN KEY `FK_FEC6F7C48DB60186`');
        $this->addSql('ALTER TABLE task_rotation_members DROP FOREIGN KEY `FK_FEC6F7C4A76ED395`');
        $this->addSql('DROP TABLE task_rotation_members');
        $this->addSql('ALTER TABLE tasks DROP recurrence, DROP rotation_index');
    }

    public function down(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
            CREATE TABLE task_rotation_members (
              id INT AUTO_INCREMENT NOT NULL,
              position INT NOT NULL,
              task_id INT NOT NULL,
              user_id INT NOT NULL,
              UNIQUE INDEX uniq_task_user (task_id, user_id),
              INDEX IDX_FEC6F7C4A76ED395 (user_id),
              INDEX IDX_FEC6F7C48DB60186 (task_id),
              UNIQUE INDEX uniq_task_position (task_id, position),
              PRIMARY KEY (id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_0900_ai_ci` ENGINE = InnoDB COMMENT = ''
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE
              task_rotation_members
            ADD
              CONSTRAINT `FK_FEC6F7C48DB60186` FOREIGN KEY (task_id) REFERENCES tasks (id) ON
            UPDATE
              NO ACTION ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE
              task_rotation_members
            ADD
              CONSTRAINT `FK_FEC6F7C4A76ED395` FOREIGN KEY (user_id) REFERENCES users (id) ON
            UPDATE
              NO ACTION ON DELETE CASCADE
        SQL);
        $this->addSql('ALTER TABLE tasks ADD recurrence VARCHAR(255) NOT NULL, ADD rotation_index INT NOT NULL');
    }
}
