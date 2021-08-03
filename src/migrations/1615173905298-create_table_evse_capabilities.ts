import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class createTableEvseCapabilities1615173905298 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'evse_capabilities',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'evse_id',
                        type: 'int',
                        isPrimary: false,
                    },
                    {
                        name: 'capability',
                        type: 'varchar',
                        isNullable: true,
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('evse_capabilities', true);
    }

}
