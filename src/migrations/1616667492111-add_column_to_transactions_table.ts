import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class addColumnToTransactionsTable1616667492111 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        //await queryRunner.query("SET FOREIGN_KEY_CHECKS=0");
        await queryRunner.query("ALTER TABLE transaction DROP FOREIGN KEY IF EXISTS transaction_ibfk_1");
        //await queryRunner.query("DROP INDEX `station_id` ON `transaction`");
        await queryRunner.dropColumn("transaction", "station_id");

        await queryRunner.addColumn("transaction",
            new TableColumn({
                name: 'location_id',
                type: 'int',
                isPrimary: false,
                isNullable: true,
            }));
        await queryRunner.addColumn("transaction",
            new TableColumn({
                name: 'party_id',
                type: 'int',
                isPrimary: false,
            }));
        await queryRunner.addColumn("transaction",
            new TableColumn({
                name: 'vehicle_id',
                type: 'int',
                isPrimary: false,
            }));

        await queryRunner.addColumn("transaction",
            new TableColumn({
                name: 'connector_id',
                type: 'int',
                isPrimary: false,
            }));

        await queryRunner.addColumn("transaction",
            new TableColumn({
                name: 'total_amount',
                type: 'varchar',
                isNullable: true,
            }));
        await queryRunner.addColumn("transaction",
            new TableColumn({
                name: 'franchise_deduction',
                type: 'varchar',
                isNullable: true,
            }));
        await queryRunner.addColumn("transaction",
            new TableColumn({
                name: 'electrict_deduction',
                type: 'varchar',
                isNullable: true,
            }));

        await queryRunner.addColumn("transaction",
            new TableColumn({
                name: 'tax_deduction',
                type: 'varchar',
                isNullable: true,
            }));
        await queryRunner.addColumn("transaction",
            new TableColumn({
                name: 'cpo_coupon_deduction',
                type: 'varchar',
                isNullable: true,
            }));

        await queryRunner.addColumn("transaction",
            new TableColumn({
                name: 'kwik_promo_avail',
                type: 'varchar',
                isNullable: true,
            }));

       // await queryRunner.query("SET FOREIGN_KEY_CHECKS=1");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("transaction", "party_id");
        await queryRunner.dropColumn("transaction", "location_id");
        await queryRunner.dropColumn("transaction", "connector_id");
        await queryRunner.dropColumn("transaction", "total_amount");
        await queryRunner.dropColumn("transaction", "franchise_deduction");
        await queryRunner.dropColumn("transaction", "electrict_deduction");
        await queryRunner.dropColumn("transaction", "tax_deduction");
        await queryRunner.dropColumn("transaction", "cpo_coupon_deduction");
        await queryRunner.dropColumn("transaction", "kwik_promo_avail");
    }
}
