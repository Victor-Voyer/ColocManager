<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260716100001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Étapes #5/#6/#7 (2/2) : supprimer colocation_user, ajouter tasks.created_by, corriger ON DELETE CASCADE/SET NULL sur expenses/tasks/expense_shares';
    }

    public function up(Schema $schema): void
    {
        // --- Étape #5 : supprimer la table colocation_user ---
        $this->addSql('ALTER TABLE colocation_user DROP FOREIGN KEY FK_5C3A3229A76ED395');
        $this->addSql('ALTER TABLE colocation_user DROP FOREIGN KEY FK_5C3A32298B419309');
        $this->addSql('DROP TABLE colocation_user');

        // --- Étape #6 : ajouter created_by sur tasks ---
        $this->addSql('ALTER TABLE tasks ADD created_by INT DEFAULT NULL');
        $this->addSql('ALTER TABLE tasks ADD CONSTRAINT FK_tasks_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_tasks_created_by ON tasks (created_by)');

        // --- Étape #7 : corriger les contraintes ON DELETE ---

        // expenses.colocation_id : RESTRICT → CASCADE
        $this->addSql('ALTER TABLE expenses DROP FOREIGN KEY FK_2496F35B8B419309');
        $this->addSql('ALTER TABLE expenses ADD CONSTRAINT FK_expenses_colocation FOREIGN KEY (colocation_id) REFERENCES colocations (id) ON DELETE CASCADE');

        // expenses.paid_by : RESTRICT → SET NULL (nullable)
        $this->addSql('ALTER TABLE expenses DROP FOREIGN KEY FK_2496F35B8B380FF2');
        $this->addSql('ALTER TABLE expenses MODIFY paid_by INT DEFAULT NULL');
        $this->addSql('ALTER TABLE expenses ADD CONSTRAINT FK_expenses_paid_by FOREIGN KEY (paid_by) REFERENCES users (id) ON DELETE SET NULL');

        // tasks.colocation_id : ajouter ON DELETE CASCADE
        $this->addSql('ALTER TABLE tasks DROP FOREIGN KEY FK_505865978B419309');
        $this->addSql('ALTER TABLE tasks ADD CONSTRAINT FK_tasks_colocation FOREIGN KEY (colocation_id) REFERENCES colocations (id) ON DELETE CASCADE');

        // expense_shares.user_id : RESTRICT → SET NULL (nullable)
        $this->addSql('ALTER TABLE expense_shares DROP FOREIGN KEY FK_56F0A069A76ED395');
        $this->addSql('ALTER TABLE expense_shares MODIFY user_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE expense_shares ADD CONSTRAINT FK_expense_shares_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        // Restaurer colocation_user
        $this->addSql('CREATE TABLE colocation_user (user_id INT NOT NULL, colocation_id INT NOT NULL, role VARCHAR(255) NOT NULL, joined_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', PRIMARY KEY(user_id, colocation_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE colocation_user ADD CONSTRAINT FK_5C3A3229A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE colocation_user ADD CONSTRAINT FK_5C3A32298B419309 FOREIGN KEY (colocation_id) REFERENCES colocations (id) ON DELETE CASCADE');
        $this->addSql('INSERT INTO colocation_user (user_id, colocation_id, role, joined_at) SELECT id, colocation_id, role, created_at FROM users WHERE colocation_id IS NOT NULL');

        // Supprimer created_by
        $this->addSql('ALTER TABLE tasks DROP FOREIGN KEY FK_tasks_created_by');
        $this->addSql('DROP INDEX IDX_tasks_created_by ON tasks');
        $this->addSql('ALTER TABLE tasks DROP created_by');

        // Restaurer les contraintes ON DELETE
        $this->addSql('ALTER TABLE expenses DROP FOREIGN KEY FK_expenses_colocation');
        $this->addSql('ALTER TABLE expenses ADD CONSTRAINT FK_2496F35B8B419309 FOREIGN KEY (colocation_id) REFERENCES colocations (id)');
        $this->addSql('ALTER TABLE expenses DROP FOREIGN KEY FK_expenses_paid_by');
        $this->addSql('ALTER TABLE expenses MODIFY paid_by INT NOT NULL');
        $this->addSql('ALTER TABLE expenses ADD CONSTRAINT FK_2496F35B8B380FF2 FOREIGN KEY (paid_by) REFERENCES users (id)');
        $this->addSql('ALTER TABLE tasks DROP FOREIGN KEY FK_tasks_colocation');
        $this->addSql('ALTER TABLE tasks ADD CONSTRAINT FK_505865978B419309 FOREIGN KEY (colocation_id) REFERENCES colocations (id)');
        $this->addSql('ALTER TABLE expense_shares DROP FOREIGN KEY FK_expense_shares_user');
        $this->addSql('ALTER TABLE expense_shares MODIFY user_id INT NOT NULL');
        $this->addSql('ALTER TABLE expense_shares ADD CONSTRAINT FK_56F0A069A76ED395 FOREIGN KEY (user_id) REFERENCES users (id)');
    }
}
