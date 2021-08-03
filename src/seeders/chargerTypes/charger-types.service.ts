import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { data } from './data';
import { ChargerType } from 'src/modules/entity/chargerType.entity';

@Injectable()
export class ChargerTypesSeederService {
  /**
   * Create an instance of class.
   *
   * @constructs
   *
   * @param {Repository<ChargerType>} ChargerTypeRepository
   */
  constructor(
    @InjectRepository(ChargerType)
    private readonly chargerTypeRepository: Repository<ChargerType>,

    private readonly logger: Logger,
  ) { }

  async chargerTypes() {
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
  create(): Array<Promise<ChargerType>> {
    return data.map(async chargerType => {

      let chargerTypesData = await this.chargerTypeRepository.findOne(chargerType);

      if (!chargerTypesData) {
        return Promise.resolve(
          await this.chargerTypeRepository.save(this.chargerTypeRepository.create(chargerType)),
        );
      }
      return chargerTypesData;
    });
  }
}
