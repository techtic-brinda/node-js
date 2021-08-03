import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { EvseController } from './evse.controller';

@Module({
    controllers: [EvseController],
    imports: [
      SharedModule,
    ]
  })
export class EvseModule {}