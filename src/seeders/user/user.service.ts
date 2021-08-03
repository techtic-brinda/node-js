import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { data } from './data';
import { User } from 'src/modules/entity/user.entity';
import { UserHasRole } from 'src/modules/entity/userHasRole.entity';
import { Role } from 'src/modules/entity/role.entity';

@Injectable()
export class UsersSeederService {
  /**
   * Create an instance of class.
   *
   * @constructs
   *
   * @param {Repository<Users>} UsersRepository
   */
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserHasRole)
    private readonly userHasRoleRepository: Repository<UserHasRole>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly logger: Logger,
  ) { }

  async users() {
    return await Promise.all(this.create())
      .then(data => {
        // Can also use this.logger.verbose('...');
        this.logger.debug(
          'No. of Users created : ' +
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
  create(): Array<Promise<User>> {
    return data.map(async Users => {
      let userRole = Users.role;
      delete Users.role;
      
      let UsersData = await this.userRepository.findOne(Users);
      if (!UsersData) {
        let roleData = await this.roleRepository.findOne({
          name: userRole,
        });
        

        let userD = await this.userRepository.save(
          this.userRepository.create(Users),
        );


        await this.userHasRoleRepository.save(
          this.userHasRoleRepository.create({
            role_id: roleData.id,
            user_id: userD.id,
          }),
        );
        return userD;
      }
      return UsersData;
    });
  }
}
