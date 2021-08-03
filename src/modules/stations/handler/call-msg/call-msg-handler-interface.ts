import { StationWebSocketClient } from '../../station-websocket-client';

export interface CallMsgHandlerInterface {
  handle(wsClient: StationWebSocketClient, station, requestFromCS: string): void | Promise<void>;
}
