import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { pick } from 'lodash';
import { Pagination } from 'src/shared/class';
import { Transaction } from 'src/modules/entity/transaction.entity';
import { Terrif } from 'src/modules/entity/terrif.entity';
import { TerrifPrice } from 'src/modules/entity/terrifPrice.entity';
import { PriceComponents } from 'src/modules/entity/priceComponent.entity';
import { TariffRestrictions } from 'src/modules/entity/tariffRestrictions.entity';
import { Country } from 'src/modules/entity/country.entity';
import { Connector } from 'src/modules/entity/connector.entity';
import { bindDataTableQuery } from 'src/common/utils';
import { Setting } from 'src/modules/entity/settings.entity';
import { ConfigService } from '@nestjs/config';
import { EvseLog } from 'src/modules/entity/evseLog.entity';
const configService = new ConfigService();

@Injectable()
export class TerrifService {
  public DEFAULT_AC_TERRIF_ID = 1;
  public DEFAULT_DC_TERRIF_ID = 2;
  constructor(
    @InjectRepository(Terrif)
    private readonly terrifRepository: Repository<Terrif>,
    @InjectRepository(TerrifPrice)
    private readonly terrifPriceRepository: Repository<TerrifPrice>,
    @InjectRepository(PriceComponents)
    private readonly priceComponentsRepository: Repository<PriceComponents>,
    @InjectRepository(TariffRestrictions)
    private readonly tariffRestrictionsRepository: Repository<TerrifPrice>,
    @InjectRepository(Connector)
    private readonly connectorRepository: Repository<Connector>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(Setting) private readonly settingRepository: Repository<Setting>,

    @InjectRepository(EvseLog)
    private readonly evseLogRepository: Repository<EvseLog>,

    @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
  ) {
    this.DEFAULT_AC_TERRIF_ID = configService.get('DEFAULT_AC_TERRIF_ID');
    this.DEFAULT_DC_TERRIF_ID = configService.get('DEFAULT_DC_TERRIF_ID');
  }

  async getUserTransaction(request, id) {
    try {
      const query = await this.terrifRepository.createQueryBuilder(
        'transaction',
      );
      if (request.order != undefined && request.order && request.order != '') {
        let order = JSON.parse(request.order);
        query.orderBy(
          `${order.query.created_at}`,
          order.direction.toUpperCase(),
        );
      } else {
        query.orderBy('transaction.id', 'ASC');
      }
      query.where(`transaction.user_id = ${request.query.user_id}`);
      if (request.filter && request.filter != '') {
        query.andWhere(`transaction.user_id LIKE :f`, {
          f: `%${request.filter}%`,
        });
      }

      let limit = 10;
      if (request && request.limit) {
        limit = request.limit;
      }
      let page = 0;
      if (request && request.page) {
        page = request.page;
      }
      request = pick(request, ['limit', 'page', 'name']);
      bindDataTableQuery(request, query);
      let response = await new Pagination(query, Transaction).paginate(
        limit,
        page,
        { relations: ['user', 'station'] },
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getTerrifsDetails(payload) {
    const { tariff_id, country_code, party_id } = payload;
    // let countryData = await this.countryRepository.findOne({
    //   alpha2_code: country_code,
    // });
    if (tariff_id) {
      //let country_id = countryData?.id;
      let terrifData: any = await this.terrifRepository.findOne(
        {
          id: tariff_id,
        },
        {
          relations: ['countries', 'price_components', 'restrictions'],
        },
      );

      if (terrifData) {
        terrifData.country_code = terrifData.countries.alpha2_code;
        terrifData.country = terrifData.countries.name;
        terrifData.min_price = await this.terrifPriceRepository.findOne(
          { terrif_id: tariff_id, type: 'min_price' },
          { select: ['excl_vat', 'incl_vat'] },
        );
        terrifData.max_price = await this.terrifPriceRepository.findOne(
          { terrif_id: tariff_id, type: 'max_price' },
          { select: ['excl_vat', 'incl_vat'] },
        );

        terrifData.elements = [];
        if (terrifData.price_components && terrifData.restrictions) {
          terrifData.elements.push({
            price_components: terrifData.price_components,
            restrictions: terrifData.restrictions,
          });
        }

        if (terrifData.price_components && !terrifData.restrictions) {
          terrifData.elements.push({
            price_components: terrifData.price_components,
          });
        }

        if (!terrifData.price_components && terrifData.restrictions) {
          terrifData.elements.push({ restrictions: terrifData.restrictions });
        }

        delete terrifData.country_id;
        delete terrifData.countries;
        delete terrifData.price_components;
        delete terrifData.restrictions;
      }

      return terrifData;
    } else {
      return null;
    }
  }

  async getAllTerrif() {
    try {
      let response = await this.terrifRepository.find();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getAllParty(payload): Promise<Terrif[]> {
    let query: any = await this.terrifRepository.createQueryBuilder('tariffs')
      .andWhere("tariffs.party_id = :partyId ", { partyId: 'all' })
      .getMany();
    return query;

  }

  async getAll(request) {
    try {
      const query = await this.terrifRepository.createQueryBuilder('tariffs');

      bindDataTableQuery(request, query);

      let response = await new Pagination(query, Terrif).paginate(request.limit, request.page, {
        relations: ['user', 'countries', 'price_components'],
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async createOrUpdate(payload): Promise<any> {
    try {
      let terrif = new Terrif();
      let terrifPrice = new PriceComponents();
      let minPrice = new TerrifPrice();
      let maxPrice = new TerrifPrice();

      if (payload.country_id) {
        terrif.country_id = payload.country_id;
      }

      if (payload.party_id) {
        terrif.party_id = payload.party_id;
      }

      if (payload.currency) {
        terrif.currency = payload.currency;
      }

      if (payload.terrif_type) {
        terrif.type = payload.terrif_type;
      }

      if (payload.price_type) {
        terrifPrice.type = payload.price_type;
      }

      if (payload.price) {
        terrifPrice.price = payload.price;
      }

      if (payload.vat) {
        terrifPrice.vat = payload.vat;
      }

      if (payload.step_size) {
        terrifPrice.step_size = payload.step_size;
      }

      if (payload.parking_fees) {
        terrif.parking_fees = payload.parking_fees;
      }

      if (payload.title) {
        terrif.title = payload.title;
      }

      if (payload.description) {
        terrif.description = payload.description;
      }

      if (payload.energy_type) {
        terrif.energy_type = payload.energy_type;
      }

      if (payload.flat_rate) {
        terrif.flat_rate = payload.flat_rate;
      }
      //Min price component
      // if (payload.min_price_excl_vat) {
      //   minPrice.excl_vat = payload.min_price_excl_vat;
      //   minPrice.type = 'min_price';
      // }

      // if (payload.min_price_incl_vat) {
      //   minPrice.incl_vat = payload.min_price_incl_vat;
      // }
      //Max price component
      // if (payload.max_price_excl_vat) {
      //   maxPrice.excl_vat = payload.max_price_excl_vat;
      //   maxPrice.type = 'max_price';
      // }

      // if (payload.max_price_incl_vat) {
      //   maxPrice.incl_vat = payload.max_price_incl_vat;
      // }

      if (payload.id) {
        await this.priceComponentsRepository.delete({ terrif_id: payload.id });
        //await this.terrifPriceRepository.delete({ terrif_id: payload.id });

        terrifPrice.terrif_id = payload.id;
        await this.priceComponentsRepository.save(terrifPrice);
        //save min price
        // minPrice.terrif_id = payload.id;
        // await this.terrifPriceRepository.save(minPrice);
        //save max pprice
        // maxPrice.terrif_id = payload.id;
        // await this.terrifPriceRepository.save(maxPrice);

        await this.terrifRepository.update(payload.id, terrif);
      } else {
        const res = await this.terrifRepository.save(terrif);
        payload.id = res.id;

        terrifPrice.terrif_id = payload.id;
        await this.priceComponentsRepository.save(terrifPrice);

        // minPrice.terrif_id = payload.id;
        // await this.terrifPriceRepository.save(minPrice);

        // maxPrice.terrif_id = payload.id;
        // await this.terrifPriceRepository.save(maxPrice);
      }
      return await this.terrifRepository.findOne({ id: payload.id });
    } catch (error) {
      throw error;
    }
  }

  async terrifCost(payload): Promise<any> {

    let settings = await this.settingRepository.findOne({ key: 'terrif_gst' });
    let connector = await this.connectorRepository.findOne(payload.connector_id)
    let terrifData = await this.terrifRepository.findOne({
      where: { id: payload.terrif_id },
      relations: ['terrif_price', 'price_components'],
    });

    if (terrifData && connector) {
      let max_voltage = connector.max_voltage ? Number(connector.max_voltage) : 0;
      let flatRate = terrifData.flat_rate ? Number(terrifData.flat_rate) : 0;
      let parkingFees = terrifData.parking_fees ? Number(terrifData.parking_fees) : 0;
      let price_components = terrifData.price_components ? terrifData.price_components[0] : [];
      let vatAmount = 0;
      if (price_components) {
        let vatPercentage = settings && settings.value ? Number(settings.value) : 0;
        let mainPriceByUnit = price_components.price ? price_components.price : 0;
        let amount = payload.amount ? payload.amount : 0;
        let payAmount = payload.amount ? payload.amount : 0;
        let mainAmount = 0;

        let time = payload.time ? payload.time : 0;
        let energyAmount = 0;

        if (payload.isTime == 1) {
          let totalAmount = 0;
          let timeTosecond = time * 60;

          if (price_components.type == "ENERGY") {
            let voltagePrice = (Number(mainPriceByUnit) * Number(max_voltage));
            energyAmount = ((timeTosecond * voltagePrice) / 3600);
          }

          if (price_components.type == "TIME") {
            energyAmount = (timeTosecond * mainPriceByUnit);
          }

          if (vatPercentage > 0) {
            //vatAmount = ((vatPercentage / 100) * energyAmount);
            //totalAmount = (energyAmount + vatAmount + flatRate);
            //totalAmount = (energyAmount + flatRate); // as per client need to remove pparking fees from total amount
            totalAmount = energyAmount
          }

          return {
            totalAmount: totalAmount.toFixed(2),
            flatRate,
            parkingFees,
            energyAmount
          }
        } else {
          let totalMin = 0;
          if (vatPercentage > 0) {
            //energyAmount = amount - flatRate // as per client need to remove pparking fees from total amount
            energyAmount = amount;
            //energyAmount = ((energyGST / (100 + vatPercentage)) * 100)
            //vatAmount = ((vatPercentage / 100) * energyAmount);

          }

          if (price_components.type == "ENERGY") {
            let voltagePrice = (Number(mainPriceByUnit) * Number(max_voltage));
            totalMin = (energyAmount / voltagePrice) * 60;
          }

          if (price_components.type == "TIME") {
            totalMin = (energyAmount / mainPriceByUnit);
          }

          return {
            totalMin: totalMin.toFixed(0),
            flatRate,
            parkingFees,
            amount,
            mainAmount,
            payAmount,
            energyAmount
          }
        }
      }
    }
  }
  // at that time not used nywhere
  async terrifFinalCost(payload): Promise<any>{
    let settings = await this.settingRepository.findOne({ key: 'terrif_gst' });
    let connector = await this.connectorRepository.findOne(payload.connector_id)
    let terrifData = await this.terrifRepository.findOne({
      where: { id: payload.terrif_id },
      relations: ['terrif_price', 'price_components'],
    });

    let evseLogData = await this.evseLogRepository.findOne({id: payload.evseLogId, type: 'charging'});
    let evseLogOccupancyData = await this.evseLogRepository.findOne({id: payload.evseLogOccupancyId, type: 'occupancy'});
    let intialTransationData = await this.transactionRepository.findOne({id: payload.transaction_id});

    if (terrifData && connector) {
      let max_voltage = evseLogData.total_meter ? Number(evseLogData.total_meter) : 0;
      let flatRate = terrifData.flat_rate ? Number(terrifData.flat_rate) : 0;
      let parkingFees = terrifData.flat_rate ? Number(terrifData.flat_rate) : 0;
      let occupancyRate = terrifData.parking_fees ? Number(terrifData.parking_fees) : 0;
      let price_components = terrifData.price_components ? terrifData.price_components[0] : [];
      let vatAmount = 0;
      if (price_components) {
        let vatPercentage = settings && settings.value ? Number(settings.value) : 0;
        let mainPriceByUnit = price_components.price ? price_components.price : 0;
        let mainAmount = parkingFees;
        let energyAmount = 0;
        let occupancyFees = 0;

        let timeTosecond = evseLogData.total_time * 60;
        if (price_components.type == "ENERGY") {
          energyAmount = (Number(mainPriceByUnit) * Number(max_voltage));
          mainAmount += energyAmount;
        }

        if(evseLogOccupancyData && evseLogOccupancyData.total_time > 15){
          let totalOccupancyHour = evseLogOccupancyData.total_time/60;
          occupancyFees = totalOccupancyHour * occupancyRate;

          var rhours = Math.floor(totalOccupancyHour);
          var minutes = (totalOccupancyHour - rhours) * 60;
          var rminutes = Math.round(minutes);
          if(rminutes){
            occupancyFees += occupancyRate;
          }
          mainAmount += occupancyFees;
        }else{
          //this.evseLogRepository.delete(payload.evseLogOccupancyId);
        }
        let paybleAmount = 0;
        let cpo_coupon_deduction = 0;
        let kwik_promo_avail = 0;
        if(intialTransationData){
          cpo_coupon_deduction = (intialTransationData.cpo_coupon_deduction) ? (intialTransationData.cpo_coupon_deduction) : 0;
          kwik_promo_avail = (intialTransationData.kwik_promo_avail) ? (intialTransationData.kwik_promo_avail) : 0;
          mainAmount -= cpo_coupon_deduction;
          mainAmount -= kwik_promo_avail;
          if(mainAmount > (intialTransationData.total_amount)){
            paybleAmount = mainAmount - (intialTransationData.total_amount);
          }else{
            paybleAmount = (intialTransationData.total_amount) - mainAmount;
          }
        }
        if(paybleAmount > 0){
          //get payment from user
        }else{
          //give back money to user
        }
        // update row in transaction
        return {
          'charging' : energyAmount.toFixed(2),
          'parking' : parkingFees.toFixed(2),
          'occupancy' : occupancyFees.toFixed(2),
          'gross revenue' : mainAmount.toFixed(2),
          'paybleAmount' : paybleAmount.toFixed(2),
          'CPO Discount' : cpo_coupon_deduction.toFixed(2),
          'Kwik Discount' : kwik_promo_avail.toFixed(2),

        }
      }
    }
  }

  async filter(arr, callback) {
    const fail = Symbol()
    return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i => i !== fail)
  }

  async delete(id) {
    const connnectors = await this.connectorRepository.find({ tariff_ids: id });
    if (connnectors && connnectors.length > 0) {
      await this.filter(connnectors, async element => {
        if (element.power_type == "AC_1_PHASE" || element.power_type == "AC_3_PHASE") {
          let connector = new Connector();
          connector.tariff_ids = String(this.DEFAULT_AC_TERRIF_ID);
          await this.connectorRepository.update(element.id, connector)
        }
        if (element.power_type == "DC") {
          let connector = new Connector();
          connector.tariff_ids = String(this.DEFAULT_DC_TERRIF_ID);
          await this.connectorRepository.update(element.id, connector);
        }
      });
    }
    await this.terrifRepository.softDelete({ id: id });

  }

  async findOne(where: Object, relations: Array<any> = []): Promise<Terrif> {
    return this.terrifRepository.findOne({
      where: where,
      relations: relations,
    });
  }
}
