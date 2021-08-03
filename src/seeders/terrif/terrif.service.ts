import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { data } from './data';
import { Terrif } from 'src/modules/entity/terrif.entity';
import { PriceComponents } from 'src/modules/entity/priceComponent.entity';

@Injectable()
export class TerrifSeederService {
  constructor(
    @InjectRepository(Terrif)
    private readonly terrifRepository: Repository<Terrif>,
    @InjectRepository(PriceComponents)
    private readonly priceComponentsRepository: Repository<PriceComponents>,
    private readonly logger: Logger,
  ) { }

  async defaultTerrif() {
    await this.terrifRepository.query("TRUNCATE TABLE tariffs");
    await this.terrifRepository.query("TRUNCATE TABLE terrif_price");
    await this.terrifRepository.query("TRUNCATE TABLE price_components");
    return await Promise.all(this.create())
      .then(data => {
        this.logger.debug(
          'No. of charger speeds created : ' +
          data.filter(
            nullValueOrCreatedLanguage => nullValueOrCreatedLanguage,
          ).length,
        );
        return Promise.resolve(true);
      })
      .catch(error => Promise.reject(error));
  }

  create(): Array<Promise<Terrif>> {
    return data.map(async terrif => {
      const terrifRes = await this.terrifRepository.save(this.terrifRepository.create(terrif));
      if (terrifRes) {
        let priceComponents = new PriceComponents();
        priceComponents.type = "ENERGY";
        priceComponents.terrif_id = terrifRes.id;
        priceComponents.price = "10";
        await this.priceComponentsRepository.save(priceComponents);
      }
      return Promise.resolve(
        terrifRes,
      );
    });
  }
}
