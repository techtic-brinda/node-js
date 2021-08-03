import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { pick, map, pluck, includes, isEqual } from "lodash";
import { User } from 'src/modules/entity/user.entity';
import { Pagination } from 'src/shared/class';
import { bindDataTableQuery, saveBase64Image } from 'src/shared/helpers/utill';
import { UserPreferences } from 'src/modules/entity/userPreferences.entity';
import { UserPreferencesAmenities } from 'src/modules/entity/userPreferencesAmenities.entity';
import { UserPreferencesPort } from 'src/modules/entity/userPreferencesPort.entity';
import { ChargerType } from 'src/modules/entity/chargerType.entity';
import { AmenitiesType } from 'src/modules/entity/amenitiesType.entity';
import { Vehicle } from 'src/modules/entity/vehicle.entity';


@Injectable()
export class UserPreferencesService {
    constructor(
        @InjectRepository(UserPreferences)
        private readonly userPreferencesRepository: Repository<UserPreferences>,
        @InjectRepository(UserPreferencesAmenities)
        private readonly UserPreferencesAmenitiesRepository: Repository<UserPreferencesAmenities>,
        @InjectRepository(UserPreferencesPort)
        private readonly UserPreferencesPortRepository: Repository<UserPreferencesPort>,
        @InjectRepository(ChargerType)
        private readonly ChargerTypeRepository: Repository<ChargerType>,
        @InjectRepository(AmenitiesType)
        private readonly AmenitiesTypeRepository: Repository<AmenitiesType>,
        @InjectRepository(Vehicle)
        private readonly VehicleRepository: Repository<Vehicle>,


    ) { }

    async getAllData(request) {
        try {
            const query = await this.userPreferencesRepository.createQueryBuilder('chargerType')
            if (request.order != undefined && request.order && request.order != '') {
                let order = JSON.parse(request.order);
                query.orderBy(`${order.name}`, order.direction.toUpperCase());
            } else {
                query.orderBy('id', 'ASC');
            }

            if (request.filter && request.filter != '') {
                query.where(`chargerType.name LIKE :f`, { f: `%${request.filter}%` })
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

    async filter(arr, callback) {
        const fail = Symbol()
        return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i => i !== fail)
    }

    async getUserPreferenceData(userId): Promise<any> {
        try {
            //userId = 3;
            let is_availabel = false;
            let current_vehicle_id = null;
            let is_offer = false;
            let userPrefrenceAmenity = [];
            let userPrefrencePorts = [];
            let charger_types = [{
                name: 'All',
                isSelected: false
            },
            {
                name: 'Ac',
                isSelected: false
            },
            {
                name: 'Dc',
                isSelected: false
            }];

            let userPreferencesData = await this.userPreferencesRepository.findOne({ where: { user_id: userId }, relations: ['userPrefrenceAmenity', 'userPrefrencePorts'] });

            if (userPreferencesData) {
                is_availabel = userPreferencesData.is_availabel;
                current_vehicle_id = userPreferencesData.current_vehicle_id;
                is_offer = userPreferencesData.is_offer;
                userPrefrenceAmenity = await userPreferencesData.userPrefrenceAmenity ? map(userPreferencesData.userPrefrenceAmenity, 'amenity_id') : [];

                userPrefrencePorts = await userPreferencesData.userPrefrencePorts ? map(userPreferencesData.userPrefrencePorts, 'charger_type_id') : [];

                await charger_types.filter((item) => {
                    if (item.name.toLowerCase() == userPreferencesData.charger_type.toLowerCase()) {
                        item.isSelected = true;
                    }
                    return item;
                });
            }

            let myports: any[] = await this.VehicleRepository.find({ where: { user_id: userId, status: "active" }, relations: ['charger_types', 'charger_types.charger_type', 'make', 'model'] });
            var chargerTypesId = [];
            var myportsData = [];
            var otherPortsData = [];

            if (myports.length > 0) {
                //chargerTypesId = await map(myports, "charger_type_id");
                myportsData = await this.filter(myports, async element => {
                    element.charger_types = await this.filter(element.charger_types, async item => {
                        if (current_vehicle_id == item.vehicle_id && includes(userPrefrencePorts, item.charger_type_id)) {
                            item.isSelected = true;
                        } else {
                            item.isSelected = false;
                        }
                        chargerTypesId.push(item.charger_type_id);
                        return item;
                    });

                    return element;
                });

                otherPortsData = await this.ChargerTypeRepository.createQueryBuilder('chargerType')
                    //.where('chargerType.id NOT IN (:...chargerTypesId)', { chargerTypesId })
                    .getMany();

                otherPortsData = await otherPortsData.filter(async (item) => {
                    if (includes(userPrefrencePorts, item.id)) {
                        item.isSelected = true
                    } else {
                        item.isSelected = false
                    }
                    return item;
                });
            } else {

                otherPortsData = await this.ChargerTypeRepository.createQueryBuilder('chargerType')
                    .getMany();

                otherPortsData = await otherPortsData.filter(async (item) => {
                    if (includes(userPrefrencePorts, item.id)) {
                        item.isSelected = true
                    } else {
                        item.isSelected = false
                    }
                    return item;
                });

            }



            let amenities: any = await this.AmenitiesTypeRepository.find();

            amenities = await amenities.filter(async (item) => {
                if (includes(userPrefrenceAmenity, item.id)) {
                    item.isSelected = true
                } else {
                    item.isSelected = false
                }
                return item;
            });

            let ports = {
                myportsData,
                otherPortsData,
            }
            return {
                charger_types,
                ports,
                amenities,
                is_offer,
                is_availabel,
                current_vehicle_id
            }

        } catch (error) {
            throw error;
        }
    }

    async delete(id) {
        await this.userPreferencesRepository.softDelete({ id: id })
    }

    async createOrUpdate(payload): Promise<UserPreferences> {
        try {

            let userPreference = new UserPreferences();

            if (payload.user_id) {
                userPreference.user_id = payload.user_id;
            }

            if (payload.charger_type) {
                userPreference.charger_type = payload.charger_type;
            }

            if (payload.current_vehicle_id) {
                userPreference.current_vehicle_id = payload.current_vehicle_id;
            }

            if (payload.is_availabel != undefined) {
                userPreference.is_availabel = payload.is_availabel == 1 ? true : false;
            }

            if (payload.is_offer != undefined) {
                userPreference.is_offer = payload.is_offer == 1 ? true : false;
            }


            let userdetail = await this.userPreferencesRepository.findOne({ user_id: payload.user_id });
            if (userdetail) {
                await this.userPreferencesRepository.update(userdetail.id, userPreference);
            } else {
                const res = await this.userPreferencesRepository.save(userPreference);
                payload.id = res.id;
            }
            // } else {
            //     const res = await this.userPreferencesRepository.save(userPreference);
            //     payload.id = res.id;
            // }

            let data = await this.userPreferencesRepository.findOne({ user_id: payload.user_id });
            if (data) {
                await this.UserPreferencesPortRepository.delete({ user_preference_id: data.id })
                await this.UserPreferencesAmenitiesRepository.delete({ user_preference_id: data.id })
            }
            let amenities = await this.UserPreferencesAmenitiesRepository.findOne({ user_preference_id: data.id });

            if (data && payload.amenity_id && payload.amenity_id.length > 0 && !amenities) {
                let userAmenityData = [];
                payload.amenity_id.map((item) => {
                    userAmenityData.push({
                        user_preference_id: data.id,
                        amenity_id: item,
                    });
                });

                if (userAmenityData.length > 0) {
                    await this.UserPreferencesAmenitiesRepository.insert(userAmenityData);
                }
            }

            let port = await this.UserPreferencesPortRepository.findOne({ user_preference_id: data.id });
            if (data && payload.charger_type_id && payload.charger_type_id.length > 0 && !port) {
                let userPortData = [];
                payload.charger_type_id.map((item) => {
                    userPortData.push({
                        user_preference_id: data.id,
                        charger_type_id: item,
                    });
                });

                if (userPortData.length > 0) {
                    await this.UserPreferencesPortRepository.insert(userPortData);
                }
            }

            return data;

        } catch (error) {
            throw error;
        }
    }
}
