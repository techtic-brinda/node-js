import { Module, Logger } from "@nestjs/common";
import { Seeder } from "./seeder";
import { ConfigService, ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigService as config } from '../common/config.service';

import { Role } from "src/modules/entity/role.entity";
import { User } from "src/modules/entity/user.entity";

import { RoleSeederService } from "./role/role.service";
import { UsersSeederService } from "./user/user.service";
import { UserHasRole } from "src/modules/entity/userHasRole.entity";
import { ChargerTypesSeederService } from "./chargerTypes/charger-types.service";
import { ChargerType } from "src/modules/entity/chargerType.entity";
import { VehicleMakesSeederService } from "./vehicleMake/vehicle-make.service";
import { VehicleModel } from "src/modules/entity/vehicleModel.entity";
import { VehicleMake } from "src/modules/entity/vehicleMake.entity";
import { AmenitiesType } from 'src/modules/entity/amenitiesType.entity';
import { AmenitiesTypeSeederService } from "./amenities/amenities.service";
import { CountrySeederService } from "./country/country.service";
import { Country } from "src/modules/entity/country.entity";

import { Terrif } from "src/modules/entity/terrif.entity";
import { TerrifSeederService } from "./terrif/terrif.service";
import { PriceComponents } from "src/modules/entity/priceComponent.entity";
//import { Standard } from "src/modules/entity/standard.entity";
//import { StandardSeederService } from "./standard/standard.service";


/**
 * Import and provide seeder classes.
 *
 * @module
 */
const Entity = [
  Role,
  User,
  UserHasRole,
  ChargerType,
  VehicleModel,
  VehicleMake,
  AmenitiesType,
  Country,
  Terrif,
  PriceComponents,
  //Standard,
];

const Services = [
  RoleSeederService,
  UsersSeederService,
  ChargerTypesSeederService,
  VehicleMakesSeederService,
  AmenitiesTypeSeederService,
  CountrySeederService,
  TerrifSeederService,
  //StandardSeederService,
];
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async () => ({
        type: 'mysql' as 'mysql',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        entities: [__dirname + '/../**/**.entity{.ts,.js}'],
        synchronize: false,
        migrationsRun: false,
        logging: false,
        logger: 'file' as 'file',
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        subscribers: [__dirname + '/subscribers/**/*{.ts,.js}'],
        cli: {
          // Location of migration should be inside src folder
          // to be compiled into dist/ folder.
          migrationsDir: 'src/migrations',
          subscribersDir: 'src/subscribers',
        },
        charset: 'utf8',
      }),
    }),
    TypeOrmModule.forFeature(Entity),
  ],
  providers: [Logger, Seeder, ...Services],
  exports: [],
})
export class SeederModule { }
