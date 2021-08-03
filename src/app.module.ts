import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, } from '@nestjs/config';
import { MailerModule } from '@nest-modules/mailer';
import { HandlebarsAdapter } from '@nest-modules/mailer';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import ormconfig from './ormconfig';
import { ConfigService as config } from './common/config.service';
import { AuthModule } from './modules/auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { EmailService } from './shared/services/email/email.service';
import { UserModule } from './modules/user/user.module';
import { TransactionModule } from './modules/transaction/transaction.module';

import { HttpExceptionFilter } from './shared/http-exception.filter';
import { AngularModule } from './modules/angular/angular.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { FaqCategoryModule } from './modules/faq-category/faq-category.module';
import { VehicleModelModule } from './modules/vehicle-model/vehicle-model.module';
import { VehicleMakeModule } from './modules/vehicle-make/vehicle-make.module';
import { ChargerTypeModelModule } from './modules/charger-type/charger-type.module';
import { UserPreferencesModule } from './modules/user-preferences/user-preferences.module';
import { SettingModule } from './modules/setting/setting.module';
import { FaqModule } from './modules/faq/faq.module';
import { PageModule } from './modules/page/page.module';
import { VoucherModule } from './modules/voucher/voucher.module';
import { StationsModule } from './modules/stations/stations.module';
import { MessageModule } from './message/message.module';
import { ConnectorsModule } from './modules/connector/connector.module';
import { EvseModule } from './modules/evse/evse.module';
import { LocationsModule } from './modules/locations/locations.module';
import { AmenitiesTypeModule } from './modules/amenities-type/amenities-type.module';
import { CountryModule } from './modules/country/country.module';
import { CapabilityModule } from './modules/capability/capability.module';
import { TerrifModule } from './modules/terrif/terrif.module';
import { NotificationModule } from './modules/notification/notification.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.servise';

@Module({
    imports: [
        EventEmitterModule.forRoot(),
        ScheduleModule.forRoot(),
        AngularModule.forRoot({
            rootPath: join(process.cwd(), 'backend/dist/fuse'),
            renderPath: '*',
        }),
        TypeOrmModule.forRoot(ormconfig),
        AuthModule,
        SharedModule.forRoot(),
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [config],
            useFactory: async () => ({
                transport: {
                    host: config.get('MAIL_HOST'),
                    port: config.get('MAIL_PORT'),
                    secure: true,
                    auth: {
                        user: config.get('MAIL_USERNAME'),
                        pass: config.get('MAIL_PASSWORD'),
                    },
                },
                defaults: {
                    forceEmbeddedImages: config.get('MAIL_EMBEDDED_IMAGES'),
                    from: `${config.get('APP_NAME')} <${config.get('MAIL_FROM_EMAIL')}>`,
                },
                template: {
                    dir: process.cwd() + '/views/email-templates',
                    adapter: new HandlebarsAdapter(), // or new PugAdapter()
                    options: {
                        strict: true,
                    },
                },
            }),
        }),
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        UserModule,
        VehicleModule,
        FaqModule,
        FaqCategoryModule,
        VehicleModelModule,
        VehicleMakeModule,
        ChargerTypeModelModule,
        SettingModule,
        PageModule,
        VoucherModule,
        AmenitiesTypeModule,
        StationsModule,
        MessageModule,
        TransactionModule,
        ConnectorsModule,
        EvseModule,
        LocationsModule,
        CountryModule,
        UserPreferencesModule,
        CapabilityModule,
        TerrifModule,
        NotificationModule
    ],
    controllers: [AppController],
    providers: [
        AppService,
        EmailService,
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
        CronService
    ],
})
export class AppModule { }
