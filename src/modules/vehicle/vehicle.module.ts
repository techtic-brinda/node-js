import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { VehicleController } from './vehicle.controller';

@Module({
    controllers: [VehicleController],
    imports: [
      SharedModule,
    ]
  })
export class VehicleModule {}