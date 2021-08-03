import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { data } from './data';
import { Role } from 'src/modules/entity/role.entity';

@Injectable()
export class RoleSeederService {
  /**
   * Create an instance of class.
   *
   * @constructs
   *
   * @param {Repository<Role>} RoleRepository
   */
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    private readonly logger: Logger,
  ) {}

  async role() {
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
  create(): Array<Promise<Role>> {
    return data.map(async role => {
     
      let roleData = await this.roleRepository.findOne(role);
      
      if (!roleData) {
        return Promise.resolve(
          await this.roleRepository.save(this.roleRepository.create(role)),
        );
      }
      return roleData;
    });
  }
}
