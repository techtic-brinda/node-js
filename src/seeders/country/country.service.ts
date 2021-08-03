import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from 'src/modules/entity/country.entity';

@Injectable()
export class CountrySeederService {
    /**
     * Create an instance of class.
     *
     * @constructs
     *
     * @param {Repository<Country>} CountryRepository
     */
    constructor(
        @InjectRepository(Country)
        private readonly CountryRepository: Repository<Country>,
        private readonly logger: Logger,
    ) { }

    async countries() {
        return await Promise.all(this.create())
            .then(data => {
                // Can also use this.logger.verbose('...');
                this.logger.debug(
                    'No. of drawer created : ' +
                    // Remove all null values and return only created languages.
                    data.filter(
                        nullValueOrCreatedLanguage => nullValueOrCreatedLanguage,
                    ).length,
                );
                return Promise.resolve(true);
            })
            .catch(error => Promise.reject(error));
    }
    /**
     * Seed all page tooltip.
     *
     * @function
     */
    create(): Array<Promise<any>> {
        return require('./COUNTRIES_201905081635').COUNTRIES.map(async(c) => {
            var obj = {};
            obj["name"] = c.NAME_EN;
            obj["alpha2_code"] = c.ALPHA2_CODE;
            obj["alpha3_code"] = c.ALPHA3_CODE;
            obj["numeric_code"] = c.NUMERIC_CODE;
            obj["phone_code"] = c.PHONE_CODE_PREFIX;
            return await this.CountryRepository.save(this.CountryRepository.create(obj));
        });
    }
}
