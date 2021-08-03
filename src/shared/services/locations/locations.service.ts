import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pagination } from 'src/shared/class';
import { bindDataTableQuery } from 'src/common/utils';
import { Location } from 'src/modules/entity/location.entity';
import { UserPreferences } from 'src/modules/entity/userPreferences.entity';
import { pick, map, pluck, includes } from "lodash";
import { LocationFacility } from 'src/modules/entity/locationFacility.entity';
import { incrementNumber } from 'src/common/utils';
import { LocationHour } from 'src/modules/entity/locationHour.entity';
import { Evse } from 'src/modules/entity/evse.entity';
import { Connector } from 'src/modules/entity/connector.entity';
import { MachineLog } from 'src/modules/entity/machineLog.entity';
import moment = require('moment');

@Injectable()
export class LocationsService {
    constructor(
        @InjectRepository(Location)
        private readonly locationsRepository: Repository<Location>,
        @InjectRepository(UserPreferences)
        private readonly userPreferencesRepository: Repository<UserPreferences>,
        @InjectRepository(LocationFacility)
        private readonly locationsFacilityRepository: Repository<LocationFacility>,
        @InjectRepository(LocationHour)
        private readonly locationHourRepository: Repository<LocationHour>,
        @InjectRepository(Evse)
        private readonly evseRepository: Repository<Evse>,
        @InjectRepository(Connector)
        private readonly connectorRepository: Repository<Connector>,

        @InjectRepository(MachineLog)
        private readonly machineLogRepository: Repository<MachineLog>,

    ) { }
    async getAllData(request) {
        try {
            let query = await this.locationsRepository.createQueryBuilder('locations')
                .leftJoinAndSelect('locations.user', 'user')

            query.withDeleted()

            bindDataTableQuery(request, query);

            let response = await (new Pagination(query, Location).paginate(request.limit, request.page));

            return response;
        } catch (error) {
            throw error;
        }
    }

    async getAll(request) {
        try {
            let response;
            if (request && request.party_id) {
                response = await this.locationsRepository.createQueryBuilder("locations")
                    .select(["locations.name", "locations.id", "locations.party_id"])
                    .where("locations.party_id = :party_id", { party_id: request.party_id })
                    .getMany();
            } else {
                response = await this.locationsRepository.find();
            }
            return response;
        } catch (error) {
            throw error;
        }
    }

    async getPublishedLocation() {
        try {
            const response = await this.locationsRepository.createQueryBuilder("location")
                .select(['location.id', 'location.name'])
                .where("location.publish = :publish", { publish: "1" })
                .getMany();
            return response;
        } catch (error) {
            throw error;
        }
    }

    async findOne(where: Object): Promise<Location> {
        return this.locationsRepository.findOne({ where: where, relations: ['locationFacility', 'opening_times'], withDeleted: true });
    }

    /* async get() {
        try {
            var responseFilter = {};
            let response = await this.locationsRepository.find();
            if (response.length > 0) {
                response.forEach((res) => {
                    Object.assign(responseFilter, { [res.key]: res.value })
                })
                return responseFilter;
            }
            return responseFilter;
        } catch (error) {
            throw error;
        }
    }
 */
    async delete(id) {
        const result = await this.locationsRepository.findOne({ where: { id }, withDeleted: true });

        if (result && result.deleted_at == null) {
            await this.locationsRepository.softDelete({ id: id })
            let evseIds = await this.evseRepository.find({ location_id: id });
            if (evseIds && evseIds.length > 0) {
                await evseIds.map(async (item: Evse) => {
                    await this.connectorRepository.softDelete({ evse_id: String(item.uid) });
                });
            }
            await this.evseRepository.softDelete({ location_id: id });
        }

        if (result && result.deleted_at != null) {
            await this.locationsRepository.restore({ id: id });
        }
    }

    async createOrUpdate(payload): Promise<Location> {
        //console.log(payload, 'payload');

        try {

            let location = new Location();

            if (payload.party_id) {
                location.party_id = payload.party_id;
            }

            if (payload.country) {
                location.country = payload.country;
            }

            if (payload.publish != undefined) {
                location.publish = payload.publish ? true : false;
            }

            if (payload.name) {
                location.name = payload.name;
            }

            if (payload.address) {
                location.address = payload.address;
            }

            if (payload.city) {
                location.city = payload.city;
            }


            if (payload.postal_code) {
                location.postal_code = payload.postal_code;
            }

            if (payload.latitude) {
                location.latitude = payload.latitude;
            }


            if (payload.longitude) {
                location.longitude = payload.longitude;
            }


            if (payload.related_locations) {
                location.related_locations = payload.related_locations;
            }

            if (payload.opening_times) {
                location.opening_times = payload.opening_times;
            }

            if (payload.charging_when_closed != undefined) {
                location.charging_when_closed = payload.charging_when_closed ? true : false;
            }

            if (payload.images) {
                location.images = payload.images;
            }

            if (payload.parking_type) {
                location.parking_type = payload.parking_type;
            }


            if (payload.energy_mix) {
                location.energy_mix = payload.energy_mix;
            }

            if (payload.time_zone) {
                location.time_zone = payload.time_zone;
            }

            if (payload.id) {
               // console.log(payload, 'payload');

                await this.locationsRepository.update(payload.id, location);
                await this.addLocationHoursData(payload.id, payload, 'edit');
            } else {
                location.time_zone = 'Asia/Kolkata';
                let postalCodeLocation = await this.locationsRepository.findOne({
                    where: { postal_code: payload.postal_code },
                    order: { id: 'DESC' },
                    withDeleted: true
                });

                const res = await this.locationsRepository.save(location);
                payload.id = res.id;

                await this.addLocationHoursData(res.id, payload, 'add');


                if (payload.id) {
                    let uid = payload.postal_code;
                    if (postalCodeLocation) {
                        uid += await incrementNumber(postalCodeLocation.uid);
                    } else {
                        uid += '001';
                    }
                    await this.locationsRepository.update(payload.id, { uid: uid });
                }
            }
            let data = await this.locationsRepository.findOne({ where: { id: payload.id }, withDeleted: true });
            //let data = await this.locationsRepository.findOne({ id: payload.id });
          //  console.log(data, 'data');

            if (data) {
                await this.locationsFacilityRepository.delete({ location_id: data.id })
            }

            if (data && payload.facility_id && payload.facility_id.length > 0) {
                let userAmenityData = [];
                payload.facility_id.map((item) => {
                    userAmenityData.push({
                        location_id: data.id,
                        facility_id: item,
                    });
                });

                if (userAmenityData.length > 0) {
                    await this.locationsFacilityRepository.insert(userAmenityData);
                }
            }

            return await this.locationsRepository.findOne({ where: { id: payload.id }, withDeleted: true });
        } catch (error) {
            throw error;
        }
    }
    async addLocationHoursData(locationId, payload, type) {
        let regularTimes = payload.hours != undefined ? payload.hours : [];
        let twentyfourseven = payload.twentyfourseven ? true : false;

        if(type == 'edit'){
            await this.locationHourRepository.delete({ location_id : locationId});
        }

        let locationHour = new LocationHour();
        locationHour.location_id = locationId;
        locationHour.twentyfourseven = twentyfourseven;
        locationHour.regular_hours = regularTimes.length > 0 ?  JSON.stringify(regularTimes) : null;
        await this.locationHourRepository.save(locationHour);

    }
    async getLocationById(id): Promise<any> {
        let element: any = await this.locationsRepository.createQueryBuilder('location')
            .leftJoinAndSelect('location.evses', 'evses')
            .leftJoinAndSelect('location.user', 'user')
            .leftJoinAndSelect('location.countries', 'countries')
            .leftJoinAndSelect('location.opening_times', 'opening_times')
            .leftJoinAndSelect('location.locationFacility', 'locationFacility')
            .leftJoinAndSelect('locationFacility.facility', 'facility')
            .leftJoinAndSelect('evses.connectors', 'connectors')
            .leftJoinAndSelect('evses.capabilities', 'capabilities')
            .where("location.id = :id", { id: id })
            .getOne();
        if (element) {
            element.coordinates = { latitude: element.latitude, longitude: element.longitude }
            element.country = element.countries?.name
            element.country_code = element.countries?.alpha2_code
            let evsesResponse = await element.evses.filter(item => !item.deleted_at);
            element.evses = [];
            var evsesData = [];
            if (evsesResponse.length) {
                await this.filter(evsesResponse, async (item, index) => {
                    item.coordinates = { latitude: item.latitude, longitude: item.longitude }
                    item.capabilities = await map(item.capabilities, "capability");
                    delete item.latitude;
                    delete item.longitude;
                    delete item.deleted_at;
                    delete item.centralSystemUrl;
                    delete item.meterValue;
                    delete item.currentChargingPower;
                    delete item.location_id;
                    item.connectors = await this.filter(item.connectors, async (ele, jIndex) => {
                        if (!ele.deleted_at) {
                            delete ele.evse_id;
                            delete ele.deleted_at;
                            ele.tariff_ids = [ele.tariff_ids]
                            return ele;
                        }

                    });
                    await evsesData.push(item);
                });
            }

            if (element.locationFacility) {
                element.facilities = await map(element.locationFacility, "facility.name");
            }
            element.evses = evsesData;
            element.owner = {
                name: element.user?.name,
                phone_number: element.user?.phone_number,
            }
            delete element.locationFacility
            delete element.latitude
            delete element.latitude
            delete element.latitude
            delete element.longitude
            delete element.countries
            delete element.deleted_at
            delete element.user
            return element;
        } else {
            return null;
        }
    }

    async getNearLocations(userId, payload) {
        const { latitude, longitude, radius = 500, search = '' } = payload;

        let userPreferencesData = await this.userPreferencesRepository.findOne({ where: { user_id: userId }, relations: ['userPrefrenceAmenity', 'userPrefrencePorts', 'userPrefrencePorts.chargerType'] });

        let query = `SELECT DISTINCT locations.id , ( 3959 * acos( cos( radians(${latitude}) ) * cos( radians( locations.latitude ) ) * cos( radians( locations.longitude ) - radians(${longitude}) ) + sin( radians(${latitude}) ) * sin( radians( locations.latitude ) ) ) ) AS distance,
                    location_facility.location_id,
                    location_facility.facility_id,
                    connector.standard,
                    connector.power_type,
                    evse.location_id ,
                    location_hours.twentyfourseven,
                    location_hours.regular_hours,
                    evse.uid,
                    evse.status
                    FROM locations
                    left Join location_facility on locations.id = location_facility.location_id
                    left Join location_hours on locations.id = location_hours.location_id
                    left Join evse on locations.id = evse.location_id
                    left Join connector on evse.uid = connector.evse_id
                    where locations.publish = TRUE `;


        if (search && search != '') {
            query += `AND locations.name LIKE '%${search}%'
                      OR locations.address LIKE '%${search}%'
                      OR locations.city LIKE '%${search}%'
                      OR locations.postal_code LIKE '%${search}%'
                      OR (CONCAT_WS(" ", locations.name , locations.address, locations.city) LIKE '%${search}%')`
        }

        //Check filter for connector power type
        let chargerType = userPreferencesData && userPreferencesData.charger_type ? userPreferencesData.charger_type.toLowerCase() : null;
        if (userPreferencesData && chargerType && chargerType == "ac") {
            query += ` AND  connector.power_type IN ('AC_3_PHASE', 'AC_1_PHASE') `;
        }

        if (userPreferencesData && chargerType && chargerType == "both") {
            query += ` AND  connector.power_type IN ('AC_3_PHASE', 'AC_1_PHASE', 'DC') `;
        }

        if (userPreferencesData && chargerType && chargerType == "dc") {
            query += ` AND  connector.power_type IN ('DC') `;
        }

        if (userPreferencesData && userPreferencesData.is_availabel) {
            query += ` AND  evse.status = 'Available' `;
        }

        // Check filter for connector standard
        if (userPreferencesData && userPreferencesData.userPrefrencePorts && userPreferencesData.userPrefrencePorts.length > 0) {
            let chargerTypes = map(userPreferencesData.userPrefrencePorts, 'chargerType');
            if (chargerTypes.length > 0) {
                let chargerTypesStandard = map(chargerTypes, 'standard');
                if (chargerTypesStandard.length > 0) {
                    var quotedAndCommaSeparated = "'" + chargerTypesStandard.join("','") + "'";
                    query += ` AND  connector.standard IN (${quotedAndCommaSeparated}) `;
                }
            }
        }

        //Chceck filter for location facilities/amynities
        if (userPreferencesData && userPreferencesData.userPrefrenceAmenity && userPreferencesData.userPrefrenceAmenity.length > 0) {
            let userPrefrenceAmenity = map(userPreferencesData.userPrefrenceAmenity, 'amenity_id')
            if (userPrefrenceAmenity.length > 0) {
                var quotedAndCommaSeparatedFacility = "'" + userPrefrenceAmenity.join("','") + "'";
                query += ` AND  location_facility.facility_id IN (${quotedAndCommaSeparatedFacility}) `;
            }
        }

        query += ` HAVING distance < ${radius}
                    ORDER BY distance DESC`;

        let data = await this.locationsRepository.query(query);

        if (data && data.length > 0) {
            let locationsIds = await map(data, "id");
            let query = await this.locationsRepository.createQueryBuilder('location')
                .where('location.id IN (:...locationsIds)', { locationsIds })
                .leftJoinAndSelect('location.evses', 'evses')
                .leftJoinAndSelect('location.user', 'user')
                .leftJoinAndSelect('location.opening_times', 'opening_times')
                .leftJoinAndSelect('location.countries', 'countries')
                .leftJoinAndSelect('location.locationFacility', 'locationFacility')
                .leftJoinAndSelect('locationFacility.facility', 'facility')
                .leftJoinAndSelect('evses.connectors', 'connectors')
                .leftJoinAndSelect('evses.capabilities', 'capabilities')

            if (userPreferencesData && userPreferencesData.is_offer) {
                query.innerJoinAndSelect('location.promocode', 'promocode')
            }

            let locationData: any = await query.getMany();
            locationData = await this.filter(locationData, async element => {
                element.coordinates = { latitude: element.latitude, longitude: element.longitude }
                element.country = element.countries?.name
                element.country_code = element.countries?.alpha2_code
                let evsesResponse = await element.evses.filter(item => !item.deleted_at);
                element.evses = [];
                var evsesData = [];
                if (evsesResponse.length) {
                    await this.filter(evsesResponse, async (item, index) => {
                        item.coordinates = { latitude: item.latitude, longitude: item.longitude }
                        item.capabilities = await map(item.capabilities, "capability");
                        delete item.latitude;
                        delete item.longitude;
                        delete item.deleted_at;
                        delete item.centralSystemUrl;
                        delete item.meterValue;
                        delete item.currentChargingPower;
                        delete item.location_id;
                        item.connectors = await this.filter(item.connectors, async (ele, jIndex) => {
                            if (!ele.deleted_at) {
                                delete ele.evse_id;
                                delete ele.deleted_at;
                                ele.tariff_ids = [ele.tariff_ids]
                                return ele;
                            }
                        });
                        evsesData.push(item);
                    });
                }

                if (element.locationFacility) {
                    element.facilities = await map(element.locationFacility, "facility.name");
                }
                element.owner = {
                    name: element.user?.name,
                    phone_number: element.user?.phone_number,
                }
                element.evses = evsesData;
                delete element.locationFacility
                delete element.latitude
                delete element.latitude
                delete element.latitude
                delete element.longitude
                delete element.countries
                delete element.deleted_at
                delete element.user
                return element;
            });

            return locationData;
        } else {
            return []
        }
    }

    async filter(arr, callback) {
        const fail = Symbol()
        return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i => i !== fail)
    }

    async machineLog(id, request){
        const query = await this.machineLogRepository.createQueryBuilder('machineLog')
        query.leftJoinAndSelect('machineLog.evse', 'evse')

       if(request.event_name){
            query.andWhere('machineLog.event_name = :event_name', {event_name: request.event_name })
        }

        if(request.starts_at && request.ends_at){
            let startDate = moment(request.starts_at, 'YYYY-MM-DD').format('YYYY-MM-DD');
            let endDate = moment(request.ends_at, 'YYYY-MM-DD').format('YYYY-MM-DD');

            query.andWhere(`DATE(machineLog.updated_at) BETWEEN '${startDate}' AND '${endDate}'`);
        }
        /* if(request.dateRangePicker){
          // query.where('machineLog.event_name = :event_name', {event_name: request.event_name })
        } */

        if(request.evse_id){
           query.andWhere('machineLog.evse_id = :evse_id', {evse_id: request.evse_id })
        }

       query.orderBy('id', 'DESC')
       request = pick(request, ['limit', 'page', 'order'])
        bindDataTableQuery(request, query);
        let limit = 10;
        if (request && request.limit) {
            limit = request.limit;
        }
        let page = 0;
        if (request && request.page) {
            page = request.page
        }

        let response = await (new Pagination(query, MachineLog).paginate(limit, page));

        return response;
    }
}
