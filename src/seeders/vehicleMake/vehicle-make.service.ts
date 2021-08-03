import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { data } from './data';
import { VehicleMake } from 'src/modules/entity/vehicleMake.entity';
import { VehicleModel } from 'src/modules/entity/vehicleModel.entity';

@Injectable()
export class VehicleMakesSeederService {
  /**
   * Create an instance of class.
   *
   * @constructs
   *
   * @param {Repository<VehicleMake>} VehicleMakeRepository
   */
  constructor(
    @InjectRepository(VehicleMake)
    private readonly vehicleMakeRepository: Repository<VehicleMake>,
    @InjectRepository(VehicleModel)
    private readonly VehicleModelRepository: Repository<VehicleModel>,
    private readonly logger: Logger,
  ) { }

  async makes() {
    await this.vehicleMakeRepository.query("TRUNCATE TABLE vehicle_makes");
    await this.VehicleModelRepository.query("TRUNCATE TABLE vehicle_models");
    return await Promise.all(this.create())
      .then(data => {
        // Can also use this.logger.verbose('...');
        this.logger.debug(
          'No. of make created : ' +
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
  create(): Array<Promise<VehicleMake>> {
    return data.map(async vehicleMake => {
      let modelsData = vehicleMake.models ? vehicleMake.models : [];
      delete vehicleMake.models;

      let makeData = await this.vehicleMakeRepository.create(vehicleMake);
      let promiseData = await this.vehicleMakeRepository.save(makeData);
      if (modelsData.length > 0) {
        let vehicleModelData = []
        await modelsData.map(async vehilceModel => {
          vehilceModel.vehicle_make_id = promiseData.id;
          vehicleModelData.push(vehilceModel);
          //await this.VehicleModelRepository.save(modelData);
        })
        let modelData = await this.VehicleModelRepository.insert(vehicleModelData);

      }
      return Promise.resolve(
        promiseData,
      );

    });
  }
}
