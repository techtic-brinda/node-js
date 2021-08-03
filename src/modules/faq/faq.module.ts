import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { FaqController } from './faq.controller';

@Module({
    controllers: [FaqController],
    imports: [
      SharedModule,
    ]
  })
export class FaqModule {}