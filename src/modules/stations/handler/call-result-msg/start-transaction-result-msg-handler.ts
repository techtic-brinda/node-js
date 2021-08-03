import { Injectable, Logger } from '@nestjs/common';
import { StartTransactionResponse } from 'src/models/StartTransactionResponse';
import { CreateOrUpdateStationDto } from '../../../stations/dto/create-update-station.dto';
import { StationRepository } from '../../../stations/station.repository';
import { StationWebSocketClient } from '../../../stations/station-websocket-client';
import { CallResultMsgHandlerInterface } from './call-result-msg-handler-interface';
import { calculatePowerUsageInWh } from '../../../stations/utils';
import { ByChargePointOperationMessageGenerator } from 'src/message/by-charge-point/by-charge-point-operation-message-generator';
import { OperationNameFromChargePoint } from 'src/models/OperationNameFromChargePoint';
import { CallResultMessage } from 'src/models/CallResultMessage';
import { IdTagInfoStatusEnum } from 'src/models/IdTagInfoStatusEnum';
import { Evse } from 'src/modules/entity/evse.entity';

@Injectable()
export class StartTransactionResultMsgHandler implements CallResultMsgHandlerInterface {
  private logger = new Logger(StartTransactionResultMsgHandler.name);
  constructor(
    private stationRepository: StationRepository,
    private byChargePointOperationMessageGenerator: ByChargePointOperationMessageGenerator,
  ) {}

  async handle(wsClient: StationWebSocketClient, station, parsedMessage: CallResultMessage): Promise<void> {
    const [, , payload] = parsedMessage;
    const {
      transactionId,
      idTagInfo: { status },
    } = payload as StartTransactionResponse;

    if (status === IdTagInfoStatusEnum.Accepted && transactionId > 0) {
      const dto: CreateOrUpdateStationDto = {
        chargeInProgress: true,
        currentTransactionId: transactionId,
      };
     // this.stationRepository.updateStation(station, dto);

      //this.createMeterValueInterval(wsClient, station);
    }
  }

  private createMeterValueInterval(wsClient: StationWebSocketClient, station) {
    clearInterval(wsClient.meterValueInterval);
    wsClient.meterValueInterval = setInterval(async () => {
      await station.reload();
      /* station.meterValue =
        station.meterValue + calculatePowerUsageInWh(station.last_updated, station.currentChargingPower);
      await station.save(); */

      const message = this.byChargePointOperationMessageGenerator.createMessage(
        'MeterValues',
        station,
        wsClient.getMessageIdForCall(),
        { value: station.meterValue },
      );

      this.logger.log(`Sending message for station ${wsClient.stationIdentity}: ${message}`);
      wsClient.sendCallMsgForOperation(message, OperationNameFromChargePoint.MeterValues);
    }, 60000);
  }
}
