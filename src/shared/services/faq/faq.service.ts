import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { pick } from "lodash";
import { User } from 'src/modules/entity/user.entity';
import { Pagination } from 'src/shared/class';
import { bindDataTableQuery } from 'src/common/utils';
import { Faq } from 'src/modules/entity/faq.entity';

@Injectable()
export class FaqService {
    constructor(
        @InjectRepository(Faq)
        private readonly faqRepository: Repository<Faq>,

    ) { }

    async getAllData(input) {
        try {
            const query = await this.faqRepository.createQueryBuilder('faqs')
            
            bindDataTableQuery(input, query);

            let response = await (new Pagination(query, Faq).paginate(input.limit, input.page, { relations: ["category"] }));

            return response;
        } catch (error) {
            throw error;
        }
    }

    async getAll() {
        try {
            return await this.faqRepository.find({relations: ["category"]});
        } catch (error) {
            throw error;
        }
    }

    async get(request) {
        try {
            let response = await this.faqRepository.findOne(
                {
                    where: { id: request.query.id }
                }
            );
            return response;
        } catch (error) {
            throw error;
        }
    }

    async delete(id) {
        await this.faqRepository.delete({ id: id })
    }

    async createOrUpdate(payload): Promise<Faq> {
        try {

            let faq = new Faq();

            if (payload.category_id) {
                faq.category_id = payload.category_id;
            }

            if (payload.title) {
                faq.title = payload.title;
            }

            if (payload.description) {
                faq.description = payload.description;
            }

            if (payload.status) {
                faq.status = payload.status;
            }

            if (payload.id) {
                await this.faqRepository.update(payload.id, faq);
            } else {
                const res = await this.faqRepository.save(faq);
                payload.id = res.id;
            }

            return await this.faqRepository.findOne({ id: payload.id });
        } catch (error) {
            throw error;
        }
    }
}
