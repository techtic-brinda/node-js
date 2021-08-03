import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class createUsersTable1594207642308 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '191',
            isNullable: true,
          },
          {
            name: 'phone_number',
            type: 'varchar',
            length: '15',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '110',
            isNullable: true,
          },
          {
            name: 'password',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'profile_pic',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'company_name',
            type: 'varchar',
            length: '191',
            isNullable: true,
          },
          {
            name: 'gst_number',
            type: 'varchar',
            length: '25',
            isNullable: true,
          },
          {
            name: 'pan_number',
            type: 'varchar',
            length: '25',
            isNullable: true,
          },
          {
            name: 'otp',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          {
            name: 'is_verified',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'token',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'fcm_token',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'is_notify',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'notify_count',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'apple_id',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'facebook_id',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'google_id',
            type: 'text',
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
    await queryRunner.dropTable('users', true);
  }

}

