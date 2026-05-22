<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260522073503 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE colocation_user (role VARCHAR(255) NOT NULL, joined_at DATETIME NOT NULL, user_id INT NOT NULL, colocation_id INT NOT NULL, INDEX IDX_5C3A3229A76ED395 (user_id), INDEX IDX_5C3A32298B419309 (colocation_id), PRIMARY KEY (user_id, colocation_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE colocations (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, invitation_code VARCHAR(64) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_73B2403CBA14FCCC (invitation_code), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE expense_shares (id INT AUTO_INCREMENT NOT NULL, amount_owed NUMERIC(10, 2) NOT NULL, percentage NUMERIC(5, 2) DEFAULT NULL, is_paid TINYINT NOT NULL, paid_at DATETIME DEFAULT NULL, expense_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_56F0A069F395DB7B (expense_id), INDEX IDX_56F0A069A76ED395 (user_id), UNIQUE INDEX uniq_expense_user (expense_id, user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE expenses (id INT AUTO_INCREMENT NOT NULL, amount NUMERIC(10, 2) NOT NULL, description VARCHAR(500) NOT NULL, category VARCHAR(100) DEFAULT NULL, split_mode VARCHAR(255) NOT NULL, expense_date DATE NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, colocation_id INT NOT NULL, paid_by INT NOT NULL, INDEX IDX_2496F35B8B419309 (colocation_id), INDEX IDX_2496F35B8B380FF2 (paid_by), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE invitation_tokens (id INT AUTO_INCREMENT NOT NULL, token VARCHAR(255) NOT NULL, email VARCHAR(255) DEFAULT NULL, expires_at DATETIME NOT NULL, used_at DATETIME DEFAULT NULL, colocation_id INT NOT NULL, created_by INT NOT NULL, UNIQUE INDEX UNIQ_E65FCA445F37A13B (token), INDEX IDX_E65FCA448B419309 (colocation_id), INDEX IDX_E65FCA44DE12AB56 (created_by), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE messages (id INT AUTO_INCREMENT NOT NULL, content LONGTEXT NOT NULL, created_at DATETIME NOT NULL, deleted_at DATETIME DEFAULT NULL, colocation_id INT NOT NULL, user_id INT DEFAULT NULL, INDEX IDX_DB021E968B419309 (colocation_id), INDEX IDX_DB021E96A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE shopping_items (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, quantity NUMERIC(10, 2) DEFAULT \'1\' NOT NULL, unit VARCHAR(50) DEFAULT NULL, status VARCHAR(255) NOT NULL, is_archived TINYINT NOT NULL, created_at DATETIME NOT NULL, bought_at DATETIME DEFAULT NULL, colocation_id INT NOT NULL, created_by INT NOT NULL, assigned_to INT DEFAULT NULL, INDEX IDX_E0BC91178B419309 (colocation_id), INDEX IDX_E0BC9117DE12AB56 (created_by), INDEX IDX_E0BC911789EEAF91 (assigned_to), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE task_rotation_members (id INT AUTO_INCREMENT NOT NULL, position INT NOT NULL, task_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_FEC6F7C48DB60186 (task_id), INDEX IDX_FEC6F7C4A76ED395 (user_id), UNIQUE INDEX uniq_task_user (task_id, user_id), UNIQUE INDEX uniq_task_position (task_id, position), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE tasks (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, status VARCHAR(255) NOT NULL, priority VARCHAR(255) NOT NULL, recurrence VARCHAR(255) NOT NULL, rotation_index INT NOT NULL, due_date DATE DEFAULT NULL, completed_at DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, colocation_id INT NOT NULL, assigned_to INT DEFAULT NULL, INDEX IDX_505865978B419309 (colocation_id), INDEX IDX_5058659789EEAF91 (assigned_to), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE users (id INT AUTO_INCREMENT NOT NULL, first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, email VARCHAR(255) NOT NULL, password_hash VARCHAR(255) NOT NULL, avatar_url VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_1483A5E9E7927C74 (email), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE colocation_user ADD CONSTRAINT FK_5C3A3229A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE colocation_user ADD CONSTRAINT FK_5C3A32298B419309 FOREIGN KEY (colocation_id) REFERENCES colocations (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE expense_shares ADD CONSTRAINT FK_56F0A069F395DB7B FOREIGN KEY (expense_id) REFERENCES expenses (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE expense_shares ADD CONSTRAINT FK_56F0A069A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT');
        $this->addSql('ALTER TABLE expenses ADD CONSTRAINT FK_2496F35B8B419309 FOREIGN KEY (colocation_id) REFERENCES colocations (id) ON DELETE RESTRICT');
        $this->addSql('ALTER TABLE expenses ADD CONSTRAINT FK_2496F35B8B380FF2 FOREIGN KEY (paid_by) REFERENCES users (id) ON DELETE RESTRICT');
        $this->addSql('ALTER TABLE invitation_tokens ADD CONSTRAINT FK_E65FCA448B419309 FOREIGN KEY (colocation_id) REFERENCES colocations (id)');
        $this->addSql('ALTER TABLE invitation_tokens ADD CONSTRAINT FK_E65FCA44DE12AB56 FOREIGN KEY (created_by) REFERENCES users (id)');
        $this->addSql('ALTER TABLE messages ADD CONSTRAINT FK_DB021E968B419309 FOREIGN KEY (colocation_id) REFERENCES colocations (id)');
        $this->addSql('ALTER TABLE messages ADD CONSTRAINT FK_DB021E96A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE shopping_items ADD CONSTRAINT FK_E0BC91178B419309 FOREIGN KEY (colocation_id) REFERENCES colocations (id)');
        $this->addSql('ALTER TABLE shopping_items ADD CONSTRAINT FK_E0BC9117DE12AB56 FOREIGN KEY (created_by) REFERENCES users (id)');
        $this->addSql('ALTER TABLE shopping_items ADD CONSTRAINT FK_E0BC911789EEAF91 FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE task_rotation_members ADD CONSTRAINT FK_FEC6F7C48DB60186 FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE task_rotation_members ADD CONSTRAINT FK_FEC6F7C4A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE tasks ADD CONSTRAINT FK_505865978B419309 FOREIGN KEY (colocation_id) REFERENCES colocations (id)');
        $this->addSql('ALTER TABLE tasks ADD CONSTRAINT FK_5058659789EEAF91 FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE colocation_user DROP FOREIGN KEY FK_5C3A3229A76ED395');
        $this->addSql('ALTER TABLE colocation_user DROP FOREIGN KEY FK_5C3A32298B419309');
        $this->addSql('ALTER TABLE expense_shares DROP FOREIGN KEY FK_56F0A069F395DB7B');
        $this->addSql('ALTER TABLE expense_shares DROP FOREIGN KEY FK_56F0A069A76ED395');
        $this->addSql('ALTER TABLE expenses DROP FOREIGN KEY FK_2496F35B8B419309');
        $this->addSql('ALTER TABLE expenses DROP FOREIGN KEY FK_2496F35B8B380FF2');
        $this->addSql('ALTER TABLE invitation_tokens DROP FOREIGN KEY FK_E65FCA448B419309');
        $this->addSql('ALTER TABLE invitation_tokens DROP FOREIGN KEY FK_E65FCA44DE12AB56');
        $this->addSql('ALTER TABLE messages DROP FOREIGN KEY FK_DB021E968B419309');
        $this->addSql('ALTER TABLE messages DROP FOREIGN KEY FK_DB021E96A76ED395');
        $this->addSql('ALTER TABLE shopping_items DROP FOREIGN KEY FK_E0BC91178B419309');
        $this->addSql('ALTER TABLE shopping_items DROP FOREIGN KEY FK_E0BC9117DE12AB56');
        $this->addSql('ALTER TABLE shopping_items DROP FOREIGN KEY FK_E0BC911789EEAF91');
        $this->addSql('ALTER TABLE task_rotation_members DROP FOREIGN KEY FK_FEC6F7C48DB60186');
        $this->addSql('ALTER TABLE task_rotation_members DROP FOREIGN KEY FK_FEC6F7C4A76ED395');
        $this->addSql('ALTER TABLE tasks DROP FOREIGN KEY FK_505865978B419309');
        $this->addSql('ALTER TABLE tasks DROP FOREIGN KEY FK_5058659789EEAF91');
        $this->addSql('DROP TABLE colocation_user');
        $this->addSql('DROP TABLE colocations');
        $this->addSql('DROP TABLE expense_shares');
        $this->addSql('DROP TABLE expenses');
        $this->addSql('DROP TABLE invitation_tokens');
        $this->addSql('DROP TABLE messages');
        $this->addSql('DROP TABLE shopping_items');
        $this->addSql('DROP TABLE task_rotation_members');
        $this->addSql('DROP TABLE tasks');
        $this->addSql('DROP TABLE users');
    }
}
