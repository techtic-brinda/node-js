import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/entity/user.entity';
import { Services } from './services';
import { UserHasRole } from 'src/modules/entity/userHasRole.entity';
import { Role } from 'src/modules/entity/role.entity';
import { DeviceTokens } from 'src/modules/entity/deviceTokens.entity';
import { Vehicle } from 'src/modules/entity/vehicle.entity';
import { Faq } from 'src/modules/entity/faq.entity';
import { FaqCategory } from 'src/modules/entity/faqCategory.entity';
import { Setting } from 'src/modules/entity/settings.entity';
import { VehicleMake } from 'src/modules/entity/vehicleMake.entity';
import { VehicleModel } from 'src/modules/entity/vehicleModel.entity';
import { ChargerType } from 'src/modules/entity/chargerType.entity';
import { UserPreferences } from 'src/modules/entity/userPreferences.entity';
import { Page } from 'src/modules/entity/page.entity';
import { VehicleModelChargerType } from 'src/modules/entity/vehicleModelChargerType.entity';
import { PromoCode } from 'src/modules/entity/promoCode.entity';
import { Transaction } from 'src/modules/entity/transaction.entity';
import { Location } from 'src/modules/entity/location.entity';
import { Evse } from 'src/modules/entity/evse.entity';
import { Connector } from 'src/modules/entity/connector.entity';

import { AmenitiesType } from 'src/modules/entity/amenitiesType.entity';
import { UserPreferencesAmenities } from 'src/modules/entity/userPreferencesAmenities.entity';
import { UserPreferencesPort } from 'src/modules/entity/userPreferencesPort.entity';
import { Country } from 'src/modules/entity/country.entity';
import { Standard } from 'src/modules/entity/standard.entity';
import { UserDocument } from 'src/modules/entity/userDocument.entity';
import { LocationFacility } from 'src/modules/entity/locationFacility.entity';
import { Capability } from 'src/modules/entity/capability.entity';
import { EvseCapability } from 'src/modules/entity/evseCapability.entity';
import { Terrif } from 'src/modules/entity/terrif.entity';
import { TerrifPrice } from 'src/modules/entity/terrifPrice.entity';
import { PriceComponents } from 'src/modules/entity/priceComponent.entity';
import { TariffRestrictions } from 'src/modules/entity/tariffRestrictions.entity';
import { Wallet } from 'src/modules/entity/wallet.entity';
import { PromoCodeUses } from 'src/modules/entity/promoCodeUses.entity';
import { UserNotification } from 'src/modules/entity/user_notification.entity';
import { Notification } from 'src/modules/entity/notification.entity';
import { VehicleChargerType } from 'src/modules/entity/vehicleChargerType.entity';
import { LocationHour } from 'src/modules/entity/locationHour.entity';
import { Permission } from 'src/modules/entity/permission.entity';
import { CpoInvoice } from 'src/modules/entity/cpoInvoice.entity';
import { EvseLog } from 'src/modules/entity/evseLog.entity';
import { MachineLog } from 'src/modules/entity/machineLog.entity';
import { EvseDetails } from 'src/modules/entity/evseDetails.entity';
import { MachineToken } from 'src/modules/entity/machineToken.entity';
import { MachineTransationLog } from 'src/modules/entity/machineTransationLog.entity';
import { Station } from 'src/modules/entity/station.entity';

const Entity = [
  DeviceTokens,
  Role,
  User,
  UserHasRole,
  Vehicle,
  Faq,
  FaqCategory,
  Setting,
  VehicleMake,
  VehicleModel,
  ChargerType,
  Page,
  VehicleModelChargerType,
  PromoCode,
  Station,
  Transaction,
  Location,
  Evse,
  Connector,
  AmenitiesType,
  UserPreferences,
  UserPreferencesAmenities,
  UserPreferencesPort,
  Country,
  Standard,
  UserDocument,
  LocationFacility,
  Capability,
  EvseCapability,
  Terrif,
  TerrifPrice,
  PriceComponents,
  TariffRestrictions,
  Wallet,
  PromoCodeUses,
  UserNotification,
  Notification,
  VehicleChargerType,
  LocationHour,
  Permission,
  CpoInvoice,
  EvseLog,
  MachineLog,
  EvseDetails,
  MachineToken,
  MachineTransationLog
];

@Module({
  imports: [TypeOrmModule.forFeature(Entity)],
  exports: [...Services, TypeOrmModule.forFeature(Entity)],
  providers: [
    ...Services
  ],
})
export class SharedModule {
  static forRoot(): DynamicModule {
    return {
      module: SharedModule,
      providers: [...Services],
    };
  }
}
