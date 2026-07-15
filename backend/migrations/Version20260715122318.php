<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260715122318 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Supprime shopping_lists et shopping_items (hors périmètre CDC v2)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE shopping_items DROP FOREIGN KEY `FK_E0BC911723245BF9`');
        $this->addSql('ALTER TABLE shopping_items DROP FOREIGN KEY `FK_E0BC911789EEAF91`');
        $this->addSql('ALTER TABLE shopping_items DROP FOREIGN KEY `FK_E0BC9117DE12AB56`');
        $this->addSql('ALTER TABLE shopping_lists DROP FOREIGN KEY `FK_984E7FF8B419309`');
        $this->addSql('ALTER TABLE shopping_lists DROP FOREIGN KEY `FK_984E7FFDE12AB56`');
        $this->addSql('DROP TABLE shopping_items');
        $this->addSql('DROP TABLE shopping_lists');
    }

    public function down(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
            CREATE TABLE shopping_items (
              id INT AUTO_INCREMENT NOT NULL,
              name VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_0900_ai_ci`,
              quantity NUMERIC(10, 2) DEFAULT '1.00' NOT NULL,
              unit VARCHAR(50) CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_0900_ai_ci`,
              status VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_0900_ai_ci`,
              is_archived TINYINT NOT NULL,
              created_at DATETIME NOT NULL,
              bought_at DATETIME DEFAULT NULL,
              shopping_list_id INT NOT NULL,
              created_by INT NOT NULL,
              assigned_to INT DEFAULT NULL,
              INDEX IDX_E0BC911723245BF9 (shopping_list_id),
              INDEX IDX_E0BC911789EEAF91 (assigned_to),
              INDEX IDX_E0BC9117DE12AB56 (created_by),
              PRIMARY KEY (id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_0900_ai_ci` ENGINE = InnoDB COMMENT = ''
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE shopping_lists (
              id INT AUTO_INCREMENT NOT NULL,
              name VARCHAR(255) CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_0900_ai_ci`,
              is_archived TINYINT NOT NULL,
              created_at DATETIME NOT NULL,
              colocation_id INT NOT NULL,
              created_by INT NOT NULL,
              INDEX IDX_984E7FF8B419309 (colocation_id),
              INDEX IDX_984E7FFDE12AB56 (created_by),
              PRIMARY KEY (id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_0900_ai_ci` ENGINE = InnoDB COMMENT = ''
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE
              shopping_items
            ADD
              CONSTRAINT `FK_E0BC911723245BF9` FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists (id) ON
            UPDATE
              NO ACTION ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE
              shopping_items
            ADD
              CONSTRAINT `FK_E0BC911789EEAF91` FOREIGN KEY (assigned_to) REFERENCES users (id) ON
            UPDATE
              NO ACTION ON DELETE
            SET
              NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE
              shopping_items
            ADD
              CONSTRAINT `FK_E0BC9117DE12AB56` FOREIGN KEY (created_by) REFERENCES users (id) ON
            UPDATE
              NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE
              shopping_lists
            ADD
              CONSTRAINT `FK_984E7FF8B419309` FOREIGN KEY (colocation_id) REFERENCES colocations (id) ON
            UPDATE
              NO ACTION ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE
              shopping_lists
            ADD
              CONSTRAINT `FK_984E7FFDE12AB56` FOREIGN KEY (created_by) REFERENCES users (id) ON
            UPDATE
              NO ACTION ON DELETE NO ACTION
        SQL);
    }
}
