import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class createEvseLogTable1621582603986 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'evse_log',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'user_id',
                        type: 'int',
                        isPrimary: false,
                    },
                    {
                        name: 'evse_id',
                        type: 'int',
                        isPrimary: false,
                    },
                    {
                        name: 'start_time',
                        type: 'datetime',
                        isNullable: true,
                    },
                    {
                        name: 'end_time',
                        type: 'datetime',
                        isNullable: true,
                    },
                    {
                        name: 'total_time',
                        type: 'int',
                        default: '0',
                    },
                    {
                        name: 'start_meter_value',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'end_meter_value',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'total_meter',
                        type: 'int',
                        default: 0,
                    },
                    {
                        name: 'type',
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
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('evse_log', true);
    }

}
