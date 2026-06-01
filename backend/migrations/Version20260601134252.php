<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260601134252 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE shopping_lists (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) DEFAULT NULL, is_archived TINYINT NOT NULL, created_at DATETIME NOT NULL, colocation_id INT NOT NULL, created_by INT NOT NULL, INDEX IDX_984E7FF8B419309 (colocation_id), INDEX IDX_984E7FFDE12AB56 (created_by), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE shopping_lists ADD CONSTRAINT FK_984E7FF8B419309 FOREIGN KEY (colocation_id) REFERENCES colocations (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE shopping_lists ADD CONSTRAINT FK_984E7FFDE12AB56 FOREIGN KEY (created_by) REFERENCES users (id)');
        $this->addSql('ALTER TABLE shopping_items DROP FOREIGN KEY `FK_E0BC91178B419309`');
        $this->addSql('DROP INDEX IDX_E0BC91178B419309 ON shopping_items');
        $this->addSql('ALTER TABLE shopping_items CHANGE quantity quantity NUMERIC(10, 2) DEFAULT \'1\' NOT NULL, CHANGE colocation_id shopping_list_id INT NOT NULL');
        $this->addSql('ALTER TABLE shopping_items ADD CONSTRAINT FK_E0BC911723245BF9 FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_E0BC911723245BF9 ON shopping_items (shopping_list_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE shopping_lists DROP FOREIGN KEY FK_984E7FF8B419309');
        $this->addSql('ALTER TABLE shopping_lists DROP FOREIGN KEY FK_984E7FFDE12AB56');
        $this->addSql('DROP TABLE shopping_lists');
        $this->addSql('ALTER TABLE shopping_items DROP FOREIGN KEY FK_E0BC911723245BF9');
        $this->addSql('DROP INDEX IDX_E0BC911723245BF9 ON shopping_items');
        $this->addSql('ALTER TABLE shopping_items CHANGE quantity quantity NUMERIC(10, 2) DEFAULT \'1.00\' NOT NULL, CHANGE shopping_list_id colocation_id INT NOT NULL');
        $this->addSql('ALTER TABLE shopping_items ADD CONSTRAINT `FK_E0BC91178B419309` FOREIGN KEY (colocation_id) REFERENCES colocations (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_E0BC91178B419309 ON shopping_items (colocation_id)');
    }
}
