import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { StationsService } from "src/modules/stations/stations.service";
import { SetChargingProfileEvent } from "./set-charging-profile.event";

@Injectable()
export class SetChargingProfileListener {
  constructor(
    private readonly stationsService: StationsService
  ){}

  @OnEvent('set-charging-profile')
  handleOrderCreatedEvent(event: SetChargingProfileEvent) {
    // handle and process "OrderCreatedEvent" event
    this.stationsService.sendStationOperationRequest(
      event.evse_id,
      'SetChargingProfile',
      {}
    );
  }
}
