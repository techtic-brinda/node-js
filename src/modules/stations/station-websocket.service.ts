import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ByChargePointOperationMessageGenerator } from 'src/message/by-charge-point/by-charge-point-operation-message-generator';
import { ChargePointMessageTypes } from 'src/models/ChargePointMessageTypes';
import { StationOperationDto } from './dto/station-operation-dto';
import { StationWebSocketClient } from './station-websocket-client';
import { calculatePowerUsageInWh } from './utils';
import { CallMsgHandlerFactory } from './handler/call-msg/call-msg-handler-factory';
import { OperationNameFromCentralSystem } from 'src/models/OperationNameFromCentralSystem';
import { CallResultMsgHandlerFactory } from './handler/call-result-msg/call-result-msg-handler-factory';
import { OperationNameFromChargePoint } from 'src/models/OperationNameFromChargePoint';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

@Injectable()
export class StationWebSocketService {
  private logger = new Logger(StationWebSocketService.name);

  constructor(
    private byChargePointOperationMessageGenerator: ByChargePointOperationMessageGenerator,
    private callMsgHandlerFactory: CallMsgHandlerFactory,
    private callResultMsgHandlerFactory: CallResultMsgHandlerFactory,
  ) { }

  public createStationWebSocket = (station): StationWebSocketClient => {
    let wsClient: StationWebSocketClient;
    const protocols = 'ocpp1.6';
    try {
      let url = configService.get('CENTRAL_SYSTEM_URL');
      console.log(`${url}/${station.evse_id}`, 'station');
      //wsClient = new StationWebSocketClient(`${station.centralSystemUrl}/${station.evse_id}`, protocols);
      wsClient = new StationWebSocketClient(`${url}/${station.evse_id}`, protocols);
    } catch (error) {
     // console.log(error, 'errorerror');
      this.logger.log(`Error connecting for station ${station.evse_id}: ${error?.message ?? ''}`);
      return null;
    }
    //console.log(wsClient, 'wsClient');


    wsClient.on('open', () => {
      console.log("connected");
      this.onConnectionOpen(wsClient, station)
    });
    wsClient.on('message', (data) => {
    //  console.log(data, 'data');
    //  console.log(typeof data, 'data');
      this.onMessage(wsClient, station, data)
    });
    wsClient.on('error', error => {
      console.log(error, 'error');
      this.onError(error)
    });
    wsClient.on('close', (code: number, reason: string) => this.onConnectionClosed(wsClient, station, code, reason));
    //console.log(wsClient, 'wsClient');
    return wsClient;

  };

  public onConnectionOpen = (wsClient: StationWebSocketClient, station) => {
    this.logger.log(`connection opened for station ${station.evse_id}, sending Boot`);
   // wsClient.stationIdentity = station.evse_id;
   // wsClient.connectedTime = new Date();

    /* const bootMessage = this.byChargePointOperationMessageGenerator.createMessage(
      'BootNotification',
      station,
      wsClient.getMessageIdForCall(),
    ); */
   // this.logger.verbose(`Sending BootNotification message for station ${wsClient.stationIdentity}: ${bootMessage}`);
  //  wsClient.sendCallMsgForOperation(bootMessage, OperationNameFromChargePoint.BootNotification);

   // this.createHeartbeatInterval(wsClient, station);

    /* if (station.chargeInProgress) {
      this.createMeterValueInterval(wsClient, station);
    } */

    // TODO: ping the server if heartbeat is more than 5 mins
  };

  private createHeartbeatInterval(wsClient: StationWebSocketClient, station) {
    wsClient.heartbeatInterval = setInterval(() => {
      // do not send heartbeat if meterValue is being sent
      if (wsClient.meterValueInterval) return;

      const heartbeatMessage = this.byChargePointOperationMessageGenerator.createMessage(
        OperationNameFromChargePoint.Heartbeat,
        station,
        wsClient.getMessageIdForCall(),
      );
      this.logger.verbose(`Sending Heartbeat message for station ${wsClient.stationIdentity}: ${heartbeatMessage}`);
      wsClient.sendCallMsgForOperation(heartbeatMessage, OperationNameFromChargePoint.Heartbeat);
    }, 60000);
  }

  private createMeterValueInterval(wsClient: StationWebSocketClient, station) {
    // clear any stuck interval
    clearInterval(wsClient.meterValueInterval);
    wsClient.meterValueInterval = setInterval(async () => {
      await station.reload();
      station.meterValue =
        station.meterValue + calculatePowerUsageInWh(station.last_updated, station.currentChargingPower);
      await station.save();

      const message = this.byChargePointOperationMessageGenerator.createMessage(
        OperationNameFromChargePoint.MeterValues,
        station,
        wsClient.getMessageIdForCall(),
        { value: station.meterValue },
      );
      this.logger.verbose(`Sending MeterValues message for station ${wsClient.stationIdentity}: ${message}`);
      wsClient.sendCallMsgForOperation(message, OperationNameFromChargePoint.MeterValues);
    }, 60000);
  }

  public onMessage = (wsClient: StationWebSocketClient, station, data) => {
    //console.log(wsClient, 'wsClient');
    //console.log(station, 'station');
    let parsedMessage: any;
    try {

      parsedMessage = JSON.parse(data);
     // console.log(parsedMessage, 'parsedMessage1');
    } catch (error) {
      this.logger.error(`Error parsing message: ${data}`);
      return;
    }

    const messageType = parsedMessage[0] as ChargePointMessageTypes;

    switch (messageType) {
      case ChargePointMessageTypes.Call: {
        const operationName = parsedMessage[2] as OperationNameFromCentralSystem;
        this.logger.log(
          `Received Call message (identity: ${station.evse_id}) for operation ${operationName}: ${data}`,
        );
        const msgHandler = this.callMsgHandlerFactory.getHandler(operationName);
        msgHandler?.handle(wsClient, station, data);
        break;
      }

      case ChargePointMessageTypes.CallResult: {
        const [, reqId] = parsedMessage as [number, string, object];

        this.logger.log(
          `Received CallResult message (identity: ${station.evse_id}) for operation ${wsClient.callMessageOperationFromStation}: ${data}`,
        );

        if (!wsClient.isLastMessageIdSimilar(reqId)) {
          this.logger.error(
            `Received incorrect reqId. wsClient.lastMessageId: ${wsClient.lastMessageId}. Received message: ${data}`,
            null,
            `Identity ${station.evse_id}`,
          );
          return;
        }

        const msgHandler = this.callResultMsgHandlerFactory.getHandler(wsClient.callMessageOperationFromStation);
        msgHandler?.handle(wsClient, station, parsedMessage);

        wsClient.callResultMessageFromCS = wsClient.expectingCallResult ? parsedMessage : null;
        wsClient.callMessageOperationFromStation = '';
        wsClient.clearRemoveCallMsgOperationNameTimer();

        break;
      }
      default:
        this.logger.log('data does not have correct messageTypeId', data);
    }
  };

  public onError(err: Error) {
    this.logger.error(`Error: ${err?.message ?? ''}`, err.stack ?? '');
  }

  public onConnectionClosed = (wsClient: StationWebSocketClient, station, code: number, reason: string) => {
    clearInterval(wsClient.heartbeatInterval);
    clearInterval(wsClient.meterValueInterval);

    if (wsClient?.connectedTime) {
      const connectedDurationInSeconds = (new Date().getTime() - wsClient.connectedTime.getTime()) / 1000;
      const connectedMinutes = Math.floor(connectedDurationInSeconds / 60);
      const extraConnectedSeconds = connectedDurationInSeconds % 60;
      this.logger.log(
        `Duration of the connection: ${connectedMinutes} minutes & ${extraConnectedSeconds} seconds. Closing connection ${station.evse_id}. Code: ${code}. Reason: ${reason}.`,
      );
    }
  };

  public async prepareAndSendMessageToCentralSystem(
    wsClient: StationWebSocketClient,
    station,
    operationName: string,
    payload: StationOperationDto,
  ) {
    // for case when message is sent from UI (maybe not needed, refactor?)
    // if (operationName === 'StopTransaction') {
    //   const dto = new CreateOrUpdateStationDto();
    //   dto.meterValue = station.meterValue + calculatePowerUsageInWh(station.updatedAt, station.currentChargingPower);
    //   this.stationRepository.updateStation(station, dto);
    // }

    const message = this.byChargePointOperationMessageGenerator.createMessage(
      operationName,
      station,
      wsClient.getMessageIdForCall(),
      payload,
    );

    if (!message) {
      throw new BadRequestException(`Cannot form message for operation ${operationName}`);
    }

    wsClient.sendCallMsgForOperation(message, operationName);
    wsClient.expectingCallResult = true;

    //console.log(wsClient,'wsClient');
    const response = await this.waitForMessage(wsClient);
    /* console.log(response,'response1');
    console.log(typeof response,'response1'); */
    //Convert Response to OCPI PROTOCOL
   // const response = await this.getOCPPResponse(response1, operationName);
   // console.log(response.data,'response12');
   // console.log(typeof response.data[0],'response1');

    wsClient.callResultMessageFromCS = null;
    wsClient.expectingCallResult = false;

    return { request: message, response };
  }

  public getOCPPResponse = (response, operationName): Promise<any | null> => {
    return new Promise<any | null>(resolve => {
      resolve({ data: [response] })
    })
  }

  public waitForMessage = (wsClient: StationWebSocketClient): Promise<any[] | null> => {
    return new Promise<any[] | null>(resolve => {
      const maxNumberOfAttemps = 20;
      const intervalTime = 500;

      let currentAttemp = 0;

      const interval = setInterval(() => {
        if (currentAttemp > maxNumberOfAttemps - 1) {
          clearInterval(interval);
          this.logger.log('Server does not respond');
          return resolve(null);
        } else if (wsClient.callResultMessageFromCS) {
          clearInterval(interval);
          return resolve(wsClient.callResultMessageFromCS);
        }
        this.logger.debug('Message not yet received, checking for more');
        currentAttemp++;
      }, intervalTime);
    });
  };
}
