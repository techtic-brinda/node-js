import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { data } from './data';
import { Role } from 'src/modules/entity/role.entity';
import { Permission } from 'src/modules/entity/permission.entity';

@Injectable()
export class PermissionSeederService {
  /**
   * Create an instance of class.
   *
   * @constructs
   *
   * @param {Repository<Permission>} permissionRepository
   */
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    private readonly logger: Logger,
  ) {}

  async permission() {
    return await Promise.all(this.create())
      .then(data => {
        // Can also use this.logger.verbose('...');
        this.logger.debug(
          'No. of role created : ' +
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
  create(): Array<Promise<Permission>> {
    return data.map(async role => {
     
      let roleData = await this.permissionRepository.findOne(role);
      
      if (!roleData) {
        return Promise.resolve(
          await this.permissionRepository.save(this.permissionRepository.create(role)),
        );
      }
      return roleData;
    });
  }
}
