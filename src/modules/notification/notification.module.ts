import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { NotificationController } from './notification.controller';

@Module({
    controllers: [NotificationController],
    imports: [
      SharedModule,
    ]
  })
export class NotificationModule {}