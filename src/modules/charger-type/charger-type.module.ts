import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { ChargerTypeController } from './charger-type.controller';

@Module({
    controllers: [ChargerTypeController],
    imports: [
      SharedModule,
    ]
  })
export class ChargerTypeModelModule {}