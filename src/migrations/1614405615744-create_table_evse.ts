import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class createTableEvse1614405615744 implements MigrationInterface {



    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'evse',
                columns: [
                    {
                        name: 'uid',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'location_id',
                        type: 'int',
                        isNullable: false,
                        isPrimary: false,
                    },
                    {
                        name: 'evse_id',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'centralSystemUrl',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'meterValue',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'currentChargingPower',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ["AVAILABLE", "BLOCKED", "CHARGING", "INOPERATIVE", "OUTOFORDER", "PLANNED", "REMOVED", "RESERVED", "UNKNOWN"]
                    },
                    // {
                    //     name: 'capabilities',
                    //     type: 'enum',
                    //     enum: ["CHARGING_PROFILE_CAPABLE","CREDIT_CARD_PAYABLE","REMOTE_START_STOP_CAPABLE","RESERVABLE","RFID_READER","UNLOCK_CAPABLE"],
                    // },                    
                    // {
                    //     name: 'status_schedule',
                    //     type: 'longtext',
                    //     isNullable: true,
                    // },
                    {
                        name: 'floor_level',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'physical_reference',
                        type: 'varchar',
                        isNullable: true,
                    },
                    // {
                    //     name: 'directions',
                    //     type: 'longtext',
                    //     isNullable: true,
                    // },
                    {
                        name: 'latitude',
                        type: 'varchar',
                        length: '12',
                        isNullable: true,
                    },
                    {
                        name: 'longitude',
                        type: 'varchar',
                        length: '12',
                        isNullable: true,
                    },
                    {
                        name: 'parking_restrictions',
                        type: 'longtext',
                        isNullable: true,
                    },
                    // {
                    //     name: 'image',
                    //     type: 'text',
                    //     isNullable: true,
                    // },
                    {
                        name: 'created_at',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'last_updated',
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
        await queryRunner.dropTable('evse', true);
    }

}
