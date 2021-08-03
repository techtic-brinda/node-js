import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { TerrifController } from './terrif.controller';

@Module({
  controllers: [TerrifController],
  imports: [
    SharedModule,
    AuthModule,
  ]
})
export class TerrifModule {}
