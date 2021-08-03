import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class addFieldToTableModelChargerType1616584852773 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.addColumn("model_charger_type",
            new TableColumn({
                name: 'verint',
                type: 'varchar',
                isNullable: true,
                length: '191',
            }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("model_charger_type", "verint");
    }

}
