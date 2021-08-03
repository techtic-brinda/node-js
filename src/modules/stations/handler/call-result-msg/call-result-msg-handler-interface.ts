import { CallResultMessage } from 'src/models/CallResultMessage';
import { StationWebSocketClient } from '../../station-websocket-client';

export interface CallResultMsgHandlerInterface {
  handle(wsClient: StationWebSocketClient, station, requestFromCS: CallResultMessage): void | Promise<void>;
}
