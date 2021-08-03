import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { LocationsController } from './locations.controller';

@Module({
    controllers: [LocationsController],
    imports: [
      SharedModule,
    ]
  })
export class LocationsModule {}