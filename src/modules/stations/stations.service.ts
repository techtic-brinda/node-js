import { BadRequestException, forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrUpdateStationDto } from './dto/create-update-station.dto';
import { GetStationsFilterDto } from './dto/get-station-filter.dto';
import { StationRepository } from './station.repository';
import { StationWebSocketService } from './station-websocket.service';
import { StationWebSocketClient } from './station-websocket-client';
import { StationOperationDto } from './dto/station-operation-dto';
import { WebSocketReadyStates } from 'src/models/WebSocketReadyStates';
import { bindDataTableQuery } from 'src/shared/helpers/utill';
import { Pagination } from 'src/shared/class';
import { User } from '../entity/user.entity';
import { pick } from "lodash";
import { Any, Repository } from 'typeorm';
import { Evse } from '../entity/evse.entity';
import { Transaction } from '../entity/transaction.entity';
import { MachineToken } from '../entity/machineToken.entity';
import { Location } from '../entity/location.entity';
import { PromoCodeUses } from '../entity/promoCodeUses.entity';
import { PromoCode } from '../entity/promoCode.entity';
import { VoucherService } from 'src/shared/services/voucher/voucher.service';
import { incrementNumber } from 'src/common/utils';
import { UserService } from 'src/shared/services/user/user.service';
import { Terrif } from '../entity/terrif.entity';


@Injectable()
export class StationsService {
  private logger = new Logger('StationsService');
  public connectedStationsClients: Set<StationWebSocketClient> = new Set<StationWebSocketClient>();
  constructor(

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(Evse)
    private readonly evseRepository: Repository<Evse>,
    @InjectRepository(Location) private readonly locationRepository: Repository<Location>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(PromoCode) private readonly promoCodeRepository: Repository<PromoCode>,

    private stationWebSocketService: StationWebSocketService,

    @InjectRepository(MachineToken)
    private readonly machineTokenRepository: Repository<MachineToken>,

    private stationRepository: StationRepository,
    @Inject(forwardRef(() => VoucherService)) private readonly voucherService: VoucherService,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,

    @InjectRepository(Terrif) private readonly terrifRepository: Repository<Terrif>,


  ) { }

  async getAllData(request) {
    try {
      const query = await this.stationRepository.createQueryBuilder('station')
      if (request.order != undefined && request.order && request.order != '') {
        let order = JSON.parse(request.order);
        query.orderBy(`${order.name}`, order.direction.toUpperCase());
      } else {
        query.orderBy('id', 'ASC');
      }

      if (request.filter && request.filter != '') {
        query.where(`station.name LIKE :f`, { f: `%${request.filter}%` })
      }

      let limit = 10;
      if (request && request.limit) {
        limit = request.limit;
      }
      let page = 0;
      if (request && request.page) {
        page = request.page
      }
      request = pick(request, ['limit', 'page', 'name'])
      bindDataTableQuery(request, query);

      let response = await (new Pagination(query, User).paginate(limit, page));

      return response;
    } catch (error) {
      throw error;
    }
  }


  async createOrUpdate(payload): Promise<Evse> {
    try {

      let station = new Evse();

      if (payload.identity) {
        station.evse_id = payload.identity;
      }

      if (payload.vendor) {
        station.location_id = payload.vendor;
      }

      /* if (payload.model) {
        station.model = payload.model;
      } */

      if (payload.centralSystemUrl) {
        station.centralSystemUrl = payload.centralSystemUrl;
      }

      if (payload.meterValue) {
        station.meterValue = payload.meterValue;
      }


      if (payload.chargeInProgress != undefined) {
        station.chargeInProgress = payload.chargeInProgress ? true : false;
      }



      if (payload.currentTransactionId) {
        station.currentTransactionId = payload.currentTransactionId;
      }

      if (payload.currentChargingPower) {
        station.currentChargingPower = payload.currentChargingPower;
      }

      if (payload.id) {
        await this.stationRepository.update(payload.id, station);
      } else {
        const res = await this.stationRepository.save(station);
        payload.id = res.uid;
      }

      return await this.stationRepository.findOne({ uid: payload.id });
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    await this.stationRepository.softDelete({ uid: id })
  }

  async getStationById(id: string): Promise<Evse> {
    const station = await this.evseRepository.findOne({evse_id : id});
    if (!station) {
      throw new NotFoundException(`Station ${id} not found`);
    }

    return station;
  }

  async getStations(filterDto: GetStationsFilterDto): Promise<Evse[]> {

    let evseData: any = await this.evseRepository.createQueryBuilder('evse')
      .leftJoinAndSelect('evse.location', 'location')
      .where("location.publish = :id", { id: "1" })
      .getMany();
    return evseData;
    //return this.stationRepository.getStations(filterDto);
  }

  // async createStation(createStationDto: CreateOrUpdateStationDto) {
  //   const station = await this.stationRepository.createStation(createStationDto);

  //   // station is created, connect it to Central System
  //   this.connectStationToCentralSystem(station);
  //   return station;
  // }

  async updateStation(id: string, updateStationDto: CreateOrUpdateStationDto) {
    const station = await this.getStationById(id);

    return this.stationRepository.updateStation(station, updateStationDto);
  }

  connectStationToCentralSystem(station) {
    const newStationWebSocketClient = this.stationWebSocketService.createStationWebSocket(station);

    if (newStationWebSocketClient) {
      this.connectedStationsClients.add(newStationWebSocketClient);
    }
  }

  async connectAllStationsToCentralSystem() {
    let dbStations: Evse[] = [];
    try {
      dbStations = await this.getStations({});
    } catch (error) {
      this.logger.error(`Error fetching stations information`, error?.stack ?? '');
    }

    // remove closing / closed sockets
    this.connectedStationsClients.forEach(client => {
      if (client.readyState !== WebSocketReadyStates.CONNECTING && client.readyState !== WebSocketReadyStates.OPEN) {
        this.connectedStationsClients.delete(client);
      }
    });

    const connectedStationsIdentity = [...this.connectedStationsClients].map(client => client.stationIdentity);

    const unconnectedStations = dbStations.filter(dbStation => !connectedStationsIdentity.includes(dbStation.evse_id));

    unconnectedStations.forEach(station => this.connectStationToCentralSystem(station));
  }

  async sendStationOperationRequest(id: string, operationName: string, stationOperationDto: StationOperationDto) {
    let station = await this.getStationById(id);
   // await this.connectStationToCentralSystem(station);
    const wsClient = await this.stationWebSocketService.createStationWebSocket(station);

    const stationDetail = await this.machineTokenRepository.findOne({ where: { evse_id: station.evse_id }});
    const transationDetail = await this.transactionRepository.findOne({
                        where: { location_id: station.location_id, status: 'pending' },
                        order : { id: 'DESC' }
                    });

    if(operationName == 'ReserveNow'){
      station.connector_id = stationDetail.connector_id;
      station.id_token = stationDetail.id_token;
      station.reservationId = transationDetail.id;
    }else if(operationName == 'RemoteStartTransaction'){
      let terrifData = await this.terrifRepository.findOne({
        where: { id: transationDetail.terrif_id },
        relations: ['terrif_price', 'price_components'],
      });
      let price_components = terrifData.price_components ? terrifData.price_components[0] : [];
      let mainPriceByUnit = price_components.price ? price_components.price : 0;
      let total_energy = 0.1;
      if (price_components.type == "ENERGY") {
        total_energy = (transationDetail.amount) / (mainPriceByUnit);
      }
      station.total_energy = Number(total_energy);
      station.connector_id = stationDetail.connector_id;
      station.id_token = stationDetail.id_token;
      station.transactionId = transationDetail.id;

    }else if(operationName == 'RemoteStopTransaction'){
      station.transactionId = transationDetail.id;
    }else if(operationName == 'SetChargingProfile'){
      station.connector_id = stationDetail.connector_id;
      station.transactionId = transationDetail.id;
    }
   // this.connectStationToCentralSystem(station);
    //console.log(this.connectedStationsClients, 'this.connectedStationsClients');

   // const wsClient = await this.stationWebSocketService.createStationWebSocket(station);
  //  const wsClient = [...this.connectedStationsClients].find(st => st.stationIdentity === station.evse_id);

    if (!wsClient || wsClient.readyState !== WebSocketReadyStates.OPEN) {
      throw new BadRequestException(`Station WS client not found or not connected! ${wsClient?.readyState}`);
    }
    const { request, response } = await this.stationWebSocketService.prepareAndSendMessageToCentralSystem(
      wsClient,
      station,
      operationName,
      stationOperationDto,
    );
    return { request, response };
  }

   async paymentProcess(payload) {
      let evseDetails = await this.evseRepository.findOne(payload.evse_id);
      //need id of evse
      await this.sendStationOperationRequest(
        evseDetails.evse_id,
        'ClearCache',
        {}
      );
      const transactionRes = await this.transactionRepository.findOne({ order: { id: 'DESC' } });

      const location = await this.locationRepository.findOne(payload.location_id);
      // console.log(transactionRes, 'transactionRes');

      // return transactionRes;
      let coupenType = '';
      let cashbackAmount:number = 0;
      let amount = payload.amount ? payload.amount : 0;
      let totalAmount = payload.amount ? payload.amount : 0;
      let userData = await this.userRepository.findOne({ id: payload.user_id });

      if (payload.promocode_id) {
        payload.net_amount = payload.amount;
        if(userData.caseback_amount){
          payload.net_amount = payload.net_amount - userData.caseback_amount;
        }
        let promoCode = await this.promoCodeRepository.findOne(payload.promocode_id);
        if (promoCode) {
          let promocodeData: any = await this.voucherService.checkValidPromocode(promoCode, payload, 'check');
          if (promocodeData.status == 200) {
            if (promocodeData.data && promocodeData.data.cashbackAmount) {
              cashbackAmount = Number(promocodeData.data.cashbackAmount);
              coupenType = promocodeData.data.location_id;
            }
          }
        }
      }
      /* if (userData) {
        let amount1 = Number(amount);
        let caseback_amount1 = userData.caseback_amount ? Number(userData.caseback_amount) : 0;
        let totalAmount1 = userData.balance ? Number(userData.balance) : 0;
      } */
      /* if (cashbackAmount > 0) {
        totalAmount = amount - cashbackAmount;
      } */
      /*
      let franchiseDeduction = await this.settingRepository.findOne({ key: 'franchise_deduction' });
      let electricDeduction = await this.settingRepository.findOne({ key: 'electric_deduction' });
      let gstData = await this.settingRepository.findOne({ key: 'terrif_gst' });
      let gstPercentage = gstData ? Number(gstData.value) : 0;
      let franchiseDeductionPer = franchiseDeduction ? Number(franchiseDeduction.value) : 0;
      let electricDeductionPer = electricDeduction ? Number(electricDeduction.value) : 0;
      let connector_uid = payload.connector_uid;
      let electricAmount = 0;
      let franchiseAmount = 0; */
    /*
      */

    /*  if (franchiseDeductionPer > 0) {
        franchiseAmount = Number((franchiseDeductionPer / 100) * amount);
      }

      if (electricDeductionPer > 0) {
        electricAmount = Number((electricDeductionPer / 100) * amount);
      }
  */
      payload.type = 'debit';

    // payload.description = `Paid to ${location?.name}`;
      payload.description = `Bill Paid`;

    //let wallet = new Wallet();

      //wallet.id = 1;

    //  if (wallet) {

        let transaction = new Transaction();
        transaction.user_id = payload.user_id;
      //  transaction.transaction_id = wallet.id; //why need of wallet id
        transaction.status = 'pending';
        transaction.location_id = payload.location_id;
        transaction.party_id = payload.party_id;
        transaction.vehicle_id = payload.vehicle_id;
        transaction.connector_id = payload.connector_id;
        transaction.franchise_deduction = 0;
        transaction.electrict_deduction = 0;
        transaction.parking_rate = 0;
        transaction.total_energy = 0;
        transaction.user_electrict_deduction = 0;

        transaction.cpo_gst_deduction = 0;
        transaction.cpo_kwick_cashback = 0;
        transaction.cpo_kwick_cashback_gst = 0;
        if (coupenType && coupenType == 'kwik-promotion') {
          transaction.kwik_promo_avail = cashbackAmount;
          transaction.cpo_coupon_deduction = 0;
        }
        if (coupenType && coupenType != 'kwik-promotion') {
          transaction.cpo_coupon_deduction = cashbackAmount;
          transaction.kwik_promo_avail = 0;
        }
        transaction.terrif_id = payload.terrif_id;
        transaction.flat_rate = payload.flat_rate;
        if(transactionRes){
          transaction.invoice_number = await incrementNumber(transactionRes.invoice_number, 'invoice');
        }else{
          transaction.invoice_number = await incrementNumber(null, 'invoice');
        }
        transaction.target_charging_minutes = payload.target_charging_minutes;
        transaction.actual_charging_minutes = 0;
        transaction.charger_type_id = payload.charger_type_id;
        transaction.promocode_id = payload.promocode_id;
        transaction.caseback_available = userData.caseback_amount;
        transaction.amount = parseFloat(amount);
        transaction.total_amount = parseFloat(totalAmount);

        const resTerrif = await this.transactionRepository.save(transaction);
        payload.transactioId =  resTerrif.id;

        let wallet = await this.userService.loadWalletMoney(payload, 0);
        await this.sendStationOperationRequest(
          evseDetails.evse_id,
          'ReserveNow',
          {}
        );
        /* await this.stationsService.sendStationOperationRequest(
          evseDetails.evse_id,
          'SetChargingProfile',
          {}
        ); */

        return await this.transactionRepository.findOne({ where: { id: resTerrif.id }, relations: ['terrif', 'terrif.price_component', 'owner', 'connector', 'location', 'chargerType', 'promoCode'] });
      /* } else {
        throw new BadRequestException('something went wrong!, Please try again later');
      } */
    }
}
function Machine(Machine: any) {
  throw new Error('Function not implemented.');
}

