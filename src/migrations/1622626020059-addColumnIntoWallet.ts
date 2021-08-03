import {MigrationInterface, QueryRunner} from "typeorm";

export class addColumnIntoWallet1622626020059 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `wallets` ADD COLUMN `details` text AFTER `description`");
        await queryRunner.query("ALTER TABLE `wallets` ADD COLUMN `method` varchar(10) AFTER `details`");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("wallets", "details");
        await queryRunner.dropColumn("wallets", "method");
    }

}
