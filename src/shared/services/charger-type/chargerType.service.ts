import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { pick } from "lodash";
import { User } from 'src/modules/entity/user.entity';
import { Pagination } from 'src/shared/class';
import { saveBase64Image } from 'src/shared/helpers/utill';
import { ChargerType } from 'src/modules/entity/chargerType.entity';
import { Standard } from 'src/modules/entity/standard.entity';
import { bindDataTableQuery } from 'src/common/utils';


@Injectable()
export class ChargerTypeService {
    constructor(
        @InjectRepository(ChargerType)
        private readonly chargerTypeRepository: Repository<ChargerType>,
        @InjectRepository(Standard)
        private readonly standardRepository: Repository<Standard>,

    ) { }

    async getAllData(request) {
        try {
            let response = {};
            const query = await this.chargerTypeRepository.createQueryBuilder('charger_types')
            if(request){
                bindDataTableQuery(request, query);

                if (request.filter && request.filter != '') {
                    query.where(`charger_types.name LIKE :f`, { f: `%${request.filter}%` })
                    query.orWhere(`charger_types.status LIKE :f`, { f: `%${request.filter}%` })
                    query.orWhere(`charger_types.charger_types LIKE :f`, { f: `%${request.filter}%` })
                }
                response = await (new Pagination(query, User).paginate(request.limit, request.page));

            }else{
                response = await this.chargerTypeRepository.find();
            }
            return response;
        } catch (error) {
            throw error;
        }
    }

    async getChargerType() {
        try {
            let response = await this.chargerTypeRepository.find();
            return response;
        } catch (error) {
            throw error;
        }
    }

    async getStandard() {
        try {
            //let response = await this.standardRepository.find({ status: 'active' });
            let response = await this.standardRepository.find({
                where: { status: 'active' },
                order: {
                    name: "ASC"
                }
            });
            return response;
        } catch (error) {
            throw error;
        }
    }

    async delete(id) {
        await this.chargerTypeRepository.softDelete({ id: id })
    }

    async createOrUpdate(payload): Promise<ChargerType> {
        try {
            let chargerType = new ChargerType();

            if (payload.name) {
                chargerType.name = payload.name;
            }

            if (payload.status) {
                chargerType.status = payload.status;
            }

            if (payload.charger_types) {
                chargerType.charger_types = payload.charger_types;
            }

            if (payload.standard) {
                chargerType.standard = payload.standard;
            }

            if (payload.image) {
                const path = saveBase64Image(payload.image, 'chargerType');
                if (path) {
                    chargerType.image = path;
                }
            }

            if (payload.id) {
                await this.chargerTypeRepository.update(payload.id, chargerType);
            } else {
                const res = await this.chargerTypeRepository.save(chargerType);
                payload.id = res.id;
            }

            return await this.chargerTypeRepository.findOne({ id: payload.id });
        } catch (error) {
            throw error;
        }
    }
}
