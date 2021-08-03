import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class createMachineTransationLogTable1625132917260 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.createTable(
            new Table({
                name: 'machine_transation_log',
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
                        name: 'transaction_id',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'evse_id',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'meter_start',
                        type: 'float',
                        isNullable: true,
                    },
                    {
                        name: 'meter_stop',
                        type: 'float',
                        isNullable: true,
                    },
                    {
                        name: 'total_meter',
                        type: 'float',
                        isNullable: true,
                    },
                    {
                        name: 'start_timestamp',
                        type: 'datetime',
                        isNullable: true
                    },
                    {
                        name: 'stop_timestamp',
                        type: 'datetime',
                        isNullable: true
                    },
                    {
                        name: 'total_time',//in minute
                        type: 'int',
                        isNullable: true,
                    },{
                        name: 'status',
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
        await queryRunner.dropTable('machine_transation_log', true);
    }

}
