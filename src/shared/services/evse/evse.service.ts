import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { pick, map } from "lodash";
import { User } from 'src/modules/entity/user.entity';
import { Pagination } from 'src/shared/class';
import { bindDataTableQuery } from 'src/shared/helpers/utill';
import { Evse } from 'src/modules/entity/evse.entity';
import { EvseCapability } from 'src/modules/entity/evseCapability.entity';
import { Terrif } from 'src/modules/entity/terrif.entity';
import { Location } from 'src/modules/entity/location.entity';
import { incrementNumber } from 'src/common/utils';
import { Connector } from 'src/modules/entity/connector.entity';
import { EvseLog } from 'src/modules/entity/evseLog.entity';
import { EvseDetails } from 'src/modules/entity/evseDetails.entity';
import { MachineLog } from 'src/modules/entity/machineLog.entity';
@Injectable()
export class EvseService {
    constructor(
        @InjectRepository(Evse)
        private readonly evseRepository: Repository<Evse>,
        @InjectRepository(Terrif)
        private readonly terrifRepository: Repository<Terrif>,
        @InjectRepository(EvseDetails)
        private readonly evseDetailsRepository: Repository<EvseDetails>,
        @InjectRepository(Location)
        private readonly locationsRepository: Repository<Location>,
        @InjectRepository(Connector)
        private readonly connectorRepository: Repository<Connector>,
        @InjectRepository(EvseLog)
        private readonly evseLogRepository: Repository<EvseLog>,
        @InjectRepository(MachineLog)
        private readonly machineLogRepository: Repository<MachineLog>,
        @InjectRepository(Location) private readonly locationRepository: Repository<Location>,

    ) { }
    async getAllData(request, user) {
        try {
            const query = await this.evseRepository.createQueryBuilder('evse')
            if (request.order != undefined && request.order && request.order != '') {
                let order = JSON.parse(request.order);
                query.orderBy(`${order.name}`, order.direction.toUpperCase());
            } else {
                query.orderBy('evse.uid', 'ASC');
            }

            if (request.filter && request.filter != '') {
                query.where(`evse.name LIKE :f`, { f: `%${request.filter}%` })
            }

            if(request.status){
                query.where(`evse.status = :s`, { s: `${request.status}` })
            }
            if (user.roles.length > 0 && user.roles[0].name == 'Owner') {
                let locationsData = await this.locationRepository.createQueryBuilder("locations")
                    .where('locations.party_id = :userId',{ userId: user.id })
                    .getMany();
                let locationsIds = await map(locationsData, 'id');
                if(locationsIds.length){
                    query.andWhere("location_id IN (:...location_id)", { location_id: locationsIds })
                }

            }
            let limit = 10;
            if (request && request.limit) {
                limit = request.limit;
            }
            let page = 0;
            if (request && request.page) {
                page = request.page
            }
            request = pick(request, ['limit', 'page', 'name'])
            bindDataTableQuery(request, query);

            let response = await (new Pagination(query, User).paginate(limit, page));

            return response;
        } catch (error) {
            throw error;
        }
    }
    async getBylocation(locationId) {
        try {
            let response = await this.evseRepository.find({
                where: { location_id: locationId },
                withDeleted: true
            });
            return response;
        } catch (error) {
            throw error;
        }
    }
    async searchByevseId(evse_id){
       let response = await this.evseRepository.findOne({
                where: { evse_id: evse_id }
        });
        return response;

    }

    async getByparty(party_id) {
        try {
            let partyIds = ['kwik_ac', 'kwik_dc', party_id];
            let response = await this.terrifRepository.createQueryBuilder('tariffs')
                .where('tariffs.party_id IN (:...partyIds)', { partyIds })
                .getMany();
            return response;
        } catch (error) {
            throw error;
        }
    }

    async getAll() {
        try {
            let response = await this.evseRepository.find();

            return response;
        } catch (error) {
            throw error;
        }
    }

    async delete(uid) {
        const result = await this.evseRepository.findOne({ where: { uid }, withDeleted: true });
        if (result && result.deleted_at == null) {
            await this.evseRepository.softDelete({ uid: uid })
            await this.connectorRepository.softDelete({ evse_id: uid });
        }

        if (result && result.deleted_at != null) {
            await this.evseRepository.restore({ uid: uid });
        }
    }


    async getEvse(evse_id) {
        try {
            let response = await this.evseDetailsRepository.findOne({
                where: { evse_id: evse_id },
                withDeleted: true
            });
            return response;
        } catch (error) {
            throw error;
        }
    }

    async createOrUpdate(payload): Promise<Evse> {
        try {
            let evse = new Evse();

            if (payload.location_id) {
                evse.location_id = payload.location_id;
            }

            if (payload.evse_id) {
                evse.evse_id = payload.evse_id;
            }

            if (payload.centralSystemUrl) {
                evse.centralSystemUrl = payload.centralSystemUrl;
            }

            if (payload.meterValue) {
                evse.meterValue = payload.meterValue;
            }

            if (payload.currentChargingPower) {
                evse.currentChargingPower = payload.currentChargingPower;
            }

            if (payload.status) {
                evse.status = payload.status;
            }

            if (payload.floor_level) {
                evse.floor_level = payload.floor_level;
            }

            if (payload.physical_reference) {
                evse.physical_reference = payload.physical_reference;
            }

            if (payload.latitude) {
                evse.latitude = payload.latitude;
            }

            if (payload.longitude) {
                evse.longitude = payload.longitude;
            }

            if (payload.parking_restrictions) {
                evse.parking_restrictions = payload.parking_restrictions;
            }


            if (payload.uid) {
                await this.evseRepository.update(payload.uid, evse);
            } else {
                let postalCodeLocation = await this.locationsRepository.findOne({
                    where: { id: payload.location_id },
                    order: { id: 'ASC' }
                });
                if (postalCodeLocation) {

                    let lastEvseId = await this.evseRepository.findOne({
                        where: { location_id: postalCodeLocation.id },
                        order: { uid: 'DESC' },
                        withDeleted: true
                    });
                    if (lastEvseId) {
                        let uid = await incrementNumber(lastEvseId.evse_id, 'evse');
                        evse.evse_id = postalCodeLocation.uid + uid;
                    } else {
                        evse.evse_id = postalCodeLocation.uid + '01';
                    }
                }
                const res = await this.evseRepository.save(evse);
                payload.id = res.uid;
            }

            let uuid = payload.uid ? payload.uid : payload.id;

            let evsedetail = await this.evseRepository.findOne({ where: { uid: uuid }, withDeleted: true });

            if(evsedetail) {
                await this.evseDetailsRepository.delete({ evse_id : evsedetail.uid });
            }

            if (evsedetail) {
                let evseDetailData = [];
                    evseDetailData.push({
                       evse_id: evsedetail.uid,
                       charger_make: payload.charger_make,
                       charger_model: payload.charger_model,
                       machine_id: payload.machine_id,
                       wifi_id: payload.wifi_id,
                       wifi_password: payload.wifi_password,
                       mobile_no: payload.mobile_no,
                       mobile_imei: payload.mobile_imei,
                       ocpp_version: payload.ocpp_version,
                       firmware: payload.firmware,
                       other_info: payload.other_info,
                       evse_creation_date: payload.evse_creation_date,
                    });

                    if (evseDetailData.length > 0) {
                    await this.evseDetailsRepository.insert(evseDetailData);
                }
            }

            return await this.evseRepository.findOne({ uid: payload.uid });
        } catch (error) {
            throw error;
        }
    }
    async diffMinutes(start, end){
        var diff = Math.abs(end.getTime() - start.getTime()) / 1000;
        diff = diff/60;
        return Math.floor(diff);
    }

    async createOrUpdateEvseLog(payload): Promise<EvseLog> {
        try {
            let evsData;
            let evseLog = new EvseLog();

            if(payload.id){
                evsData = await this.evseLogRepository.findOne(payload.id)
            }

            if (payload.user_id) {
                evseLog.user_id = payload.user_id;
            }

            if (payload.evse_id) {
                evseLog.evse_id = payload.evse_id;
            }

            if (payload.start_time) {
                evseLog.start_time = payload.start_time;
            }

            if (payload.end_time) {
                evseLog.end_time = payload.end_time;
                evseLog.total_time = await this.diffMinutes(evsData.start_time, evseLog.end_time);
            }

            if (payload.start_meter_value) {
                evseLog.start_meter_value = payload.start_meter_value;
            }

            if (payload.end_meter_value) {
                evseLog.end_meter_value = payload.end_meter_value;
                evseLog.total_meter = payload.end_meter_value - evsData.start_meter_value;
            }

            if (payload.type) {
                evseLog.type = payload.type;
            }

            if (payload.id) {
                await this.evseLogRepository.update(payload.id, evseLog);
            } else {
                const res = await this.evseLogRepository.save(evseLog);
                payload.id = res.id;
            }

            return await this.evseLogRepository.findOne(payload.id);
        } catch (error) {
            throw error;
        }
    }

    async sendNotificationToDatabaseForMachine(){
        let machineLogDetail = await this.machineLogRepository.query("select max(id), evse_id,event_name, max(updated_at) as updated_date,NOW() as now, (max(updated_at) + INTERVAL '+5' MINUTE) as d  from `machine_log` where `event_name`='Heartbeat' group by evse_id HAVING (updated_date + INTERVAL '+5' MINUTE) < NOW()");
        if (machineLogDetail.length > 0) {
            machineLogDetail.forEach(async element => {
                await this.evseRepository.update({ evse_id: element.evse_id }, { status : 'Unavailable'});
            });
        }
    }
}
