import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { SharedModule } from 'src/shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { EvseModule } from '../evse/evse.module';
import { StationsService } from '../stations/stations.service';
import { StationWebSocketService } from '../stations/station-websocket.service';
import { MessageModule } from 'src/message/message.module';
import { CallMsgHandlerFactory } from '../stations/handler/call-msg/call-msg-handler-factory';
import { RemoteStartTransactionMsgHandler } from '../stations/handler/call-msg/remote-start-transaction-msg-handler';
import { RemoteStopTransactionMsgHandler } from '../stations/handler/call-msg/remote-stop-transaction-msg-handler';
import { ResetMsgHandler } from '../stations/handler/call-msg/reset-msg-handler';
import { CallResultMsgHandlerFactory } from '../stations/handler/call-result-msg/call-result-msg-handler-factory';
import { StartTransactionResultMsgHandler } from '../stations/handler/call-result-msg/start-transaction-result-msg-handler';
import { StopTransactionResultMsgHandler } from '../stations/handler/call-result-msg/stop-transaction-result-msg-handler';

@Module({
  controllers: [UserController],
  imports: [
    SharedModule,
    AuthModule,
    EvseModule,
    MessageModule
  ],
  providers:[
    StationsService,
    StationWebSocketService,
    CallMsgHandlerFactory,
    CallResultMsgHandlerFactory,
    StartTransactionResultMsgHandler,
    StopTransactionResultMsgHandler,
    RemoteStartTransactionMsgHandler,
    RemoteStopTransactionMsgHandler,
    ResetMsgHandler,
  ],
  exports :[StationsService]
})
export class UserModule {}
