import { Injectable } from "@nestjs/common";
import { ChargerTypesSeederService } from "./chargerTypes/charger-types.service";
import { RoleSeederService } from "./role/role.service";
import { UsersSeederService } from "./user/user.service";
import { VehicleMakesSeederService } from "./vehicleMake/vehicle-make.service";
import { AmenitiesTypeSeederService } from "./amenities/amenities.service";
import { CountrySeederService } from "./country/country.service";
import { TerrifSeederService } from "./terrif/terrif.service";

@Injectable()
export class Seeder {
  constructor(
    private readonly roleService: RoleSeederService,
    private readonly userService: UsersSeederService,
    private readonly chargerTypesSeederService: ChargerTypesSeederService,
    private readonly vehicleMakesSeederService: VehicleMakesSeederService,
    private readonly amenitiesTypeSeederService: AmenitiesTypeSeederService,
    private readonly countrySeederService: CountrySeederService,
   
    private readonly terrifSeederService: TerrifSeederService,

  ) { }
  async seed(table) {
    let response;
    switch (table) {
      case 'role':
        response = this.roleService.role();
        break;
      case 'user':
        response = this.userService.users();
        break;
      case 'charger_types':
        response = this.chargerTypesSeederService.chargerTypes();
        break;
      case 'vehicle_makes':
        response = this.vehicleMakesSeederService.makes();
        break;
      case 'amenities_types':
        response = this.amenitiesTypeSeederService.amenities();
        break;
      case 'countries':
        response = this.countrySeederService.countries();
        break;
      
      case 'tariffs':
        response = this.terrifSeederService.defaultTerrif();
        break;

      default:
        response = this.all();
        break;
    }

    await response
      .then(completed => {
        Promise.resolve(completed);
      })
      .catch(error => {
        Promise.reject(error);
      });
  }
  async all() {

    return await Promise.all([
      await this.roleService.role(),
      await this.userService.users(),
      await this.chargerTypesSeederService.chargerTypes(),
      await this.vehicleMakesSeederService.makes(),
      await this.amenitiesTypeSeederService.amenities(),
      await this.countrySeederService.countries(),
      await this.terrifSeederService.defaultTerrif(),
    ]);
  }
}
