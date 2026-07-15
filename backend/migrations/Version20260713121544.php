<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260713121544 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE messages DROP FOREIGN KEY `FK_DB021E968B419309`');
        $this->addSql('ALTER TABLE messages DROP FOREIGN KEY `FK_DB021E96A76ED395`');
        $this->addSql('DROP TABLE messages');
        $this->addSql('ALTER TABLE shopping_items CHANGE quantity quantity NUMERIC(10, 2) DEFAULT \'1\' NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE messages (id INT AUTO_INCREMENT NOT NULL, content LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_0900_ai_ci`, created_at DATETIME NOT NULL, deleted_at DATETIME DEFAULT NULL, colocation_id INT NOT NULL, user_id INT DEFAULT NULL, INDEX IDX_DB021E96A76ED395 (user_id), INDEX IDX_DB021E968B419309 (colocation_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_0900_ai_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE messages ADD CONSTRAINT `FK_DB021E968B419309` FOREIGN KEY (colocation_id) REFERENCES colocations (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE messages ADD CONSTRAINT `FK_DB021E96A76ED395` FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE NO ACTION ON DELETE SET NULL');
        $this->addSql('ALTER TABLE shopping_items CHANGE quantity quantity NUMERIC(10, 2) DEFAULT \'1.00\' NOT NULL');
    }
}
