import {MigrationInterface, QueryRunner} from "typeorm";

export class addColumnIntoWallet1623913863185 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `wallets` ADD COLUMN `transaction_id` int AFTER `wallet_type`");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("wallets", "caseback_available");
    }

}
