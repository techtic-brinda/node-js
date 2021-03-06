import { Injectable, Logger } from '@nestjs/common';
import { RemoteStopTransactionRequest } from 'src/models/RemoteStopTransactionRequest';
import { RemoteStopTransactionResponse } from 'src/models/RemoteStopTransactionResponse';
import { ByChargePointOperationMessageGenerator } from 'src/message/by-charge-point/by-charge-point-operation-message-generator';
import { ChargePointMessageTypes } from 'src/models/ChargePointMessageTypes';
import { RemoteStartStopStatusEnum } from 'src/models/RemoteStartStopStatusEnum';
import { StationWebSocketClient } from '../../station-websocket-client';
import { CallMsgHandlerInterface } from './call-msg-handler-interface';
import { OperationNameFromChargePoint } from 'src/models/OperationNameFromChargePoint';
import { StationRepository } from '../../station.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrUpdateStationDto } from '../../dto/create-update-station.dto';
import { calculatePowerUsageInWh } from '../../utils';
import { Evse } from 'src/modules/entity/evse.entity';

@Injectable()
export class RemoteStopTransactionMsgHandler implements CallMsgHandlerInterface {
  private logger = new Logger(RemoteStopTransactionMsgHandler.name);
  public constructor(
    @InjectRepository(StationRepository)
    private stationRepository: StationRepository,
    private byChargePointOperationMessageGenerator: ByChargePointOperationMessageGenerator,
  ) {}

  public async handle(wsClient: StationWebSocketClient, station, requestFromCS: string): Promise<void> {
    // parse message & build response
    await station.reload();
    const parsedMessage = JSON.parse(requestFromCS);
    const [, uniqueId, , payload] = parsedMessage as [number, string, string, object];
    const { transactionId } = payload as RemoteStopTransactionRequest;
    const response = this.buildResponse(station, transactionId);

    const responseMsg = JSON.stringify([ChargePointMessageTypes.CallResult, uniqueId, response]);

    // send response back to station
    this.logger.verbose(`Sending response for station ${wsClient.stationIdentity}: ${responseMsg}`);
    wsClient.send(responseMsg);

    if (response.status === RemoteStartStopStatusEnum.Accepted) {
      const dto = new CreateOrUpdateStationDto();
      dto.meterValue = station.meterValue + calculatePowerUsageInWh(station.last_updated, station.currentChargingPower);
      this.stationRepository.updateStation(station, dto);

      const stopTransactionMsg = this.byChargePointOperationMessageGenerator.createMessage(
        OperationNameFromChargePoint.StopTransaction,
        station,
        wsClient.getMessageIdForCall(),
      );

      wsClient.sendCallMsgForOperation(stopTransactionMsg, OperationNameFromChargePoint.StopTransaction);
    }
  }

  private buildResponse(station, transactionId: number) {
    const response = new RemoteStopTransactionResponse();
    response.status = RemoteStartStopStatusEnum.Accepted;
    if (station.currentTransactionId !== transactionId) {
      this.logger.error(
        `Different transaction_ID received: ${transactionId}. Current transactionId: ${station.currentTransactionId}`,
      );
      response.status = RemoteStartStopStatusEnum.Rejected;
    }

    return response;
  }
}
