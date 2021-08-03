import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { data } from './data';
import { ChargerType } from 'src/modules/entity/chargerType.entity';
import { AmenitiesType } from 'src/modules/entity/amenitiesType.entity';

@Injectable()
export class AmenitiesTypeSeederService {
  /**
   * Create an instance of class.
   *
   * @constructs
   *
   * @param {Repository<AmenitiesType>} amenitiesTypeRepository
   */
  constructor(
    @InjectRepository(AmenitiesType)
    private readonly amenitiesTypeRepository: Repository<AmenitiesType>,

    private readonly logger: Logger,
  ) { }

  async amenities() {
    return await Promise.all(this.create())
      .then(data => {
        // Can also use this.logger.verbose('...');
        this.logger.debug(
          'No. of charger speeds created : ' +
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
  create(): Array<Promise<AmenitiesType>> {
    return data.map(async amenitiesType => {

      let amenitiesTypeData = await this.amenitiesTypeRepository.findOne(amenitiesType);

      if (!amenitiesTypeData) {
        return Promise.resolve(
          await this.amenitiesTypeRepository.save(this.amenitiesTypeRepository.create(amenitiesType)),
        );
      }
      return amenitiesTypeData;
    });
  }
}
