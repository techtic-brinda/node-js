import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageModule } from 'src/message/message.module';
import { SetChargingProfileListener } from 'src/shared/listeners/set-charging-profile.listener';
import { SharedModule } from 'src/shared/shared.module';
import { Evse } from '../entity/evse.entity';
import { Transaction } from '../entity/transaction.entity';
import { CallMsgHandlerFactory } from './handler/call-msg/call-msg-handler-factory';
import { RemoteStartTransactionMsgHandler } from './handler/call-msg/remote-start-transaction-msg-handler';
import { RemoteStopTransactionMsgHandler } from './handler/call-msg/remote-stop-transaction-msg-handler';
import { ResetMsgHandler } from './handler/call-msg/reset-msg-handler';
import { CallResultMsgHandlerFactory } from './handler/call-result-msg/call-result-msg-handler-factory';
import { StartTransactionResultMsgHandler } from './handler/call-result-msg/start-transaction-result-msg-handler';
import { StopTransactionResultMsgHandler } from './handler/call-result-msg/stop-transaction-result-msg-handler';
import { StationWebSocketService } from './station-websocket.service';
import { StationsController } from './stations.controller';
import { StationsService } from './stations.service';

@Module({
  imports: [
    SharedModule,
    MessageModule,
    TypeOrmModule.forFeature([Evse, Transaction]),

  ],
  controllers: [StationsController],
  providers: [
    StationWebSocketService,
    StationsService,
    CallMsgHandlerFactory,
    CallResultMsgHandlerFactory,
    StartTransactionResultMsgHandler,
    StopTransactionResultMsgHandler,
    RemoteStartTransactionMsgHandler,
    RemoteStopTransactionMsgHandler,
    ResetMsgHandler,
    SetChargingProfileListener
  ],
  exports: [StationsService],
})
export class StationsModule {}
