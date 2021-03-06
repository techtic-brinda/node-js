import { Injectable, Logger } from '@nestjs/common';
import { OperationNameFromChargePoint } from 'src/models/OperationNameFromChargePoint';
import { ByChargePointOperationMessageGenerator } from 'src/message/by-charge-point/by-charge-point-operation-message-generator';
import { ChargePointMessageTypes } from 'src/models/ChargePointMessageTypes';
import { RemoteStartStopStatusEnum } from 'src/models/RemoteStartStopStatusEnum';
import { RemoteStartTransactionRequest } from 'src/models/RemoteStartTransactionRequest';
import { RemoteStartTransactionResponse } from 'src/models/RemoteStartTransactionResponse';
import { StationWebSocketClient } from '../../station-websocket-client';
import { CallMsgHandlerInterface } from './call-msg-handler-interface';

@Injectable()
export class RemoteStartTransactionMsgHandler implements CallMsgHandlerInterface {
  private logger = new Logger(RemoteStartTransactionMsgHandler.name);
  public constructor(private byChargePointOperationMessageGenerator: ByChargePointOperationMessageGenerator) {}

  public handle(wsClient: StationWebSocketClient, station, requestFromCS: string): void {
    // parse message & build response
    const parsedMessage = JSON.parse(requestFromCS);

    const [, uniqueId, , payload] = parsedMessage as [number, string, string, object];
    const { idTag } = payload as RemoteStartTransactionRequest;
    const remoteStartResponse = this.buildResponseMsg();
    const responseMessage = JSON.stringify([ChargePointMessageTypes.CallResult, uniqueId, remoteStartResponse]);

    // send response back to station
    this.logger.log(`Sending response for remote start (identity: ${wsClient.stationIdentity}): ${responseMessage}`);
    wsClient.send(responseMessage);

    // create new flow, send StartTransaction to station
    const startTransactionMsg = this.byChargePointOperationMessageGenerator.createMessage(
      OperationNameFromChargePoint.StartTransaction,
      station,
      wsClient.getMessageIdForCall(),
      { idTag },
    );

    this.logger.log(`Sending message for station ${wsClient.stationIdentity}: ${startTransactionMsg}`);
    wsClient.sendCallMsgForOperation(startTransactionMsg, OperationNameFromChargePoint.StartTransaction);
  }

  private buildResponseMsg(): RemoteStartTransactionResponse {
    const response = new RemoteStartTransactionResponse();
    response.status = RemoteStartStopStatusEnum.Accepted; // later should check to reject if charger is in use?

    return response;
  }
}
