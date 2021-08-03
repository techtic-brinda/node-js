import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { data } from './data';
import { ChargerSpeed } from 'src/modules/entity/chargerSpeed.entity';

@Injectable()
export class ChargerSpeedSeederService {
  /**
   * Create an instance of class.
   *
   * @constructs
   *
   * @param {Repository<ChargerSpeed>} ChargerSpeedRepository
   */
  constructor(
    @InjectRepository(ChargerSpeed)
    private readonly chargerSpeedRepository: Repository<ChargerSpeed>,

    private readonly logger: Logger,
  ) { }

  async chargerSpeeds() {
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
  create(): Array<Promise<ChargerSpeed>> {
    return data.map(async chargerSpeed => {

      let chargerSpeedData = await this.chargerSpeedRepository.findOne(chargerSpeed);

      if (!chargerSpeedData) {
        return Promise.resolve(
          await this.chargerSpeedRepository.save(this.chargerSpeedRepository.create(chargerSpeed)),
        );
      }
      return chargerSpeedData;
    });
  }
}
