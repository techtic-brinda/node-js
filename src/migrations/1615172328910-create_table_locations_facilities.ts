import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class createTableLocationsFacilities1615172328910 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'location_facility',
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
                        isPrimary: false,
                    },
                    {
                        name: 'facility_id',
                        type: 'int',
                        isPrimary: false,
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('location_facility', true);
    }

}
