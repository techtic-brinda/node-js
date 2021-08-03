import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class createTableMachineToken1624358188338 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'machine_token',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'location_id',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'evse_uuid',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'evse_id',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'id_token',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'connector_id',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'deleted_at',
                        type: 'datetime',
                        isNullable: true,
                    }
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('machine_token', true);
    }

}
