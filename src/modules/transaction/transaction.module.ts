import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { SharedModule } from 'src/shared/shared.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [TransactionController],
  imports: [
    SharedModule,
    AuthModule,
  ]
})
export class TransactionModule {}
