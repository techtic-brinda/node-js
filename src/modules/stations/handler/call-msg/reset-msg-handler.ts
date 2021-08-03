import { Injectable, Logger } from '@nestjs/common';
import { ChargePointMessageTypes } from 'src/models/ChargePointMessageTypes';
import { ResetRequest } from 'src/models/ResetRequest';
import { ResetResponse } from 'src/models/ResetResponse';
import { ResetStatusEnum } from 'src/models/ResetStatusEnum';
import { StationWebSocketClient } from '../../station-websocket-client';
import { CallMsgHandlerInterface } from './call-msg-handler-interface';

@Injectable()
export class ResetMsgHandler implements CallMsgHandlerInterface {
  private logger = new Logger(ResetMsgHandler.name);

  async handle(wsClient: StationWebSocketClient, station, requestFromCS: string): Promise<void> {
    const parsedMessage = JSON.parse(requestFromCS);
    const [, uniqueId, , payload] = parsedMessage as [number, string, string, object];
    const { type } = payload as ResetRequest;
    this.logger.log(`Reset command received for identity ${station.evse_id}. Type: ${type}`);
    const resetResponse = this.buildResponseMsg();
    const responseMessage = JSON.stringify([ChargePointMessageTypes.CallResult, uniqueId, resetResponse]);

    // send response back to station
    this.logger.verbose(`Sending response for station ${wsClient.stationIdentity}: ${responseMessage}`);
    wsClient.send(responseMessage);

    // reset station's data
    station.chargeInProgress = false;
    station.currentTransactionId = null;
    await station.save();

    // close connection
    wsClient.close(1012, 'Reset requested by Central System');
  }

  private buildResponseMsg() {
    const response = new ResetResponse();
    response.status = ResetStatusEnum.Accepted;
    return response;
  }
}
