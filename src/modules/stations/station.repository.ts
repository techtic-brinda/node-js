import { EntityRepository, Repository } from 'typeorm';
import { Evse } from '../entity/evse.entity';
import { CreateOrUpdateStationDto } from './dto/create-update-station.dto';
import { GetStationsFilterDto } from './dto/get-station-filter.dto';

@EntityRepository(Evse)
export class StationRepository extends Repository<Evse> {
  async createStation(createStationDto: CreateOrUpdateStationDto) {
    const { identity, centralSystemUrl, meterValue, currentChargingPower } = createStationDto;

    let latestStation = null;
    if (!identity) {
      latestStation = await this.getLatestStation();
    }

    const station = this.create();
    station.evse_id = identity ?? `${process.env.DEFAULT_IDENTITY_NAME}${(latestStation?.uid ?? 0) + 1}`;
    station.centralSystemUrl = centralSystemUrl ?? `${process.env.DEFAULT_CENTRAL_SYSTEM_URL}`;
    station.meterValue = meterValue ?? 0;
    station.currentChargingPower = currentChargingPower ?? 11000;

    await station.save();

    return station;
  }

  async getLatestStation() {
    const query = this.createQueryBuilder('station');
    return await query.orderBy('id', 'DESC').getOne();
  }

  async updateStation(station: Evse, updateStationDto: CreateOrUpdateStationDto) {
    Object.keys(updateStationDto).forEach(key => {
      station[key] = updateStationDto[key];
    });
    await station.save();

    return station;
  }

  async getStations(filterDto: GetStationsFilterDto): Promise<Evse[]> {
    const { evse_id } = filterDto;

    const query = this.createQueryBuilder('station');

    if (evse_id) {
      query.andWhere('station.identity like :identity', {
        identity: `%${evse_id}%`,
      });
    }

    const stations = await query.getMany();

    return stations;
  }
}
