import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/modules/entity/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

    async createRole(payload){
        try {
            let role = new Role();
            role.name = payload.name;

            if (payload.id) {
                await this.roleRepository.update(payload.id, role);
            } else {
                let data = await this.roleRepository.save(role);
                payload.id = data.id;
            }
            await this.roleRepository.findOne(payload.id);
            return role;
        } catch (error) {
            throw error;
        }
    }
}
