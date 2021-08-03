import {MigrationInterface, QueryRunner} from "typeorm";

export class changeColumnDataType1622556235072 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `connector` MODIFY COLUMN `standard` INT");
        await queryRunner.query("ALTER TABLE `charger_types` MODIFY COLUMN `standard` INT");

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `connector` MODIFY COLUMN `standard` varchar(151)");
        await queryRunner.query("ALTER TABLE `charger_types` MODIFY COLUMN `standard` varchar(151)");
    }

}
