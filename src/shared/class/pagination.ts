import { SelectQueryBuilder, getConnection, In } from "typeorm";
import { _ } from "underscore";

export class RelatuionQueryOption {
    relations: string[]
    withDeleted? : boolean
}
export class PaginationResponse<T>{
    meta: {
        from: number;
        to: number;
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    }
    data: T[]
}

export class Pagination<T> {
    data: T[];
    meta: {
        from: number;
        to: number;
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };

    private query: SelectQueryBuilder<T>

    constructor(query: SelectQueryBuilder<T>, private type?: any) {
        this.query = query;
    }

    async paginate(per_page: number = 10, current_page: number = 0, option?: RelatuionQueryOption): Promise<PaginationResponse<T>> {
        this.meta = {
            from: 0,
            to: 10,
            total: 0,
            per_page: 10,
            current_page: 0,
            last_page: 0,
        }

        this.meta.total = await this.query.getCount();

        this.meta.per_page = isNaN(per_page) ? 10 : per_page;
        this.meta.current_page = Math.max(current_page, 0);
        this.query.limit(this.meta.per_page);

        const offset = (this.meta.current_page * this.meta.per_page) || 0;
        this.meta.from = offset;
        this.meta.to = this.meta.from + this.meta.per_page;
        this.query.offset(offset);

        
        this.data = await this.query.getMany();

        if (option && option.relations) {
            const ids = _.pluck(this.data, 'id');

            if (ids.length > 0) {
                const connection = getConnection();
                const queryRepository = connection.getRepository<T>(this.type);
                let data = await queryRepository.find({ where: { 'id': In(ids) }, ...option });

                data = _.indexBy(data, 'id');
                this.data = _.map(this.data, (item) => {
                    for (let index = 0; index < option.relations.length; index++) {
                        const element = option.relations[index];
                        if (data[item.id]) {
                            item[element] = data[item.id][element];
                        }
                    }
                    return item;
                })
            }
        }

        this.meta.last_page = Math.ceil(this.meta.total / this.meta.per_page) - 1;

        return { meta: this.meta, data: this.data };
    }

}
