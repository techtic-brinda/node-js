import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import moment = require("moment");
import { Evse } from "src/modules/entity/evse.entity";
import { MachineLog } from "src/modules/entity/machineLog.entity";
import { MachineToken } from "src/modules/entity/machineToken.entity";
import { MachineTransationLog } from "src/modules/entity/machineTransationLog.entity";
import { Terrif } from "src/modules/entity/terrif.entity";
import { Transaction } from "src/modules/entity/transaction.entity";
import { SetChargingProfileEvent } from "src/shared/listeners/set-charging-profile.event";
import { Repository } from "typeorm";
import { EvseService } from "../evse/evse.service";
import { NotificationService } from "../notification/notification.service";
import { UserService } from "../user/user.service";

@Injectable()
export class MachineService {
    constructor(
        @InjectRepository(MachineLog)
        private readonly machineLogRepository: Repository<MachineLog>,


        @InjectRepository(MachineToken)
        private readonly machineTokenRepository: Repository<MachineToken>,

        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,

        @InjectRepository(Evse)
        private readonly evseRepository: Repository<Evse>,

        @InjectRepository(Terrif)
        private readonly terrifRepository: Repository<Terrif>,

        @InjectRepository(MachineTransationLog)
        private readonly machineTransationLogRepository: Repository<MachineTransationLog>,

        @Inject(forwardRef(() => EvseService))
        private readonly evseService: EvseService,

        @Inject(forwardRef(() => NotificationService))
        private readonly notificationService: NotificationService,

        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,

        private eventEmitter: EventEmitter2

    ) { }

    async getMachineTokenDetail(id){
        let response = await this.machineTokenRepository.findOne({
            where: { evse_id: id }
        });
        return response;
    }

    async saveMachineToken(request){
        let response = await this.machineTokenRepository.findOne({
                where: { evse_id: request.evse_id }
        });
        let machineToken = new MachineToken();
        if(request.location_id){
            machineToken.location_id = request.location_id;
        }
        if(request.evse_uuid){
            machineToken.evse_uuid = request.evse_uuid;
        }
        if(request.evse_id){
            machineToken.evse_id = request.evse_id;
        }

        if(request.connector_id){
            machineToken.connector_id = request.connector_id;
        }

        if(request.id_token){
            machineToken.id_token = request.id_token;
        }

        if(response && response.id){
            await this.machineTokenRepository.update(response.id, machineToken);
            return await this.machineTokenRepository.findOne(response.id);
        }else{
            const res = await this.machineTokenRepository.save(machineToken);
            return res;
        }
    }

    async saveMachineLog(request){
        try {
            var currentDate = moment().format("YYYY-MM-DD");
            let evseData = await this.evseService.searchByevseId(request.evse_id);
            let machineLog = new MachineLog();

            if (request.evse_id) {
                machineLog.evse_id = request.evse_id;
            }
            let responseData:any = {};
            if(request.event_name){
                machineLog.event_name = request.event_name;
                if(request.event_name == "Heartbeat"){
                    let revenueDataRes = await this.machineLogRepository.createQueryBuilder()
                    .andWhere(`DATE(created_at) = '${currentDate}'`)
                    .andWhere(`event_name = '${request.event_name}'`)
                    .andWhere(`evse_id = '${request.evse_id}'`)
                    .getOne();
                    if(revenueDataRes && revenueDataRes.id){
                        machineLog.id = revenueDataRes.id;
                    }
                    responseData.currentTime = new Date().toISOString();
                    machineLog.response = JSON.stringify(responseData);
                   // await this.evseService.createOrUpdate({status:'Available', evse_id:request.evse_id, uid: evseData.uid});
                }else if(request.event_name == "BootNotification"){
                    let revenueDataRes = await this.machineLogRepository.createQueryBuilder()
                    .andWhere(`DATE(created_at) = '${currentDate}'`)
                    .andWhere(`event_name = '${request.event_name}'`)
                    .andWhere(`evse_id = '${request.evse_id}'`)
                    .getOne();
                    if(revenueDataRes && revenueDataRes.id){
                        machineLog.id = revenueDataRes.id;
                    }
                    if(evseData){
                        responseData.status = 'Accepted';
                    }else{
                        responseData.status = 'Rejected';
                    }
                    responseData.interval = 60;
                    responseData.currentTime = new Date().toISOString();
                    machineLog.response = JSON.stringify(responseData);
                }else if(request.event_name == "StatusNotification"){
                    let requestParse = JSON.parse(request.request);
                    if(evseData.status != requestParse[3].status){
                        await this.evseService.createOrUpdate({status:requestParse[3].status, evse_id:request.evse_id, uid: evseData.uid});
                    }
                    if(requestParse[3].status == 'Finishing'){
                        let machineTransationLogDetails  = await this.machineTransationLogRepository.findOne({ evse_id : request.evse_id, status: 'end'});
                        await this.machineTransationLogRepository.update(machineTransationLogDetails.id, { leave_timestamp : new Date()});
                    }else if(requestParse[3].status == 'Available'){
                        let machineTransationLogDetails  = await this.machineTransationLogRepository.findOne({
                             where: { evse_id : request.evse_id, status: 'end'},
                             order : { id: 'DESC'}
                        });
                        let transationDetail  = await this.transactionRepository.findOne(machineTransationLogDetails.transaction_id);
                        console.log(machineTransationLogDetails,'machineTransationLogDetails');
                        if(machineTransationLogDetails){
                            let dNow = new Date();
                            //let dNow = "2021-07-28T12:05:34.794Z";
                            let total_parking_time = await this.calculateMinutes(machineTransationLogDetails.stop_timestamp, dNow);
                            //total_parking_time = total_parking_time - 15;
                            let dataUpdate:any = {
                                leave_timestamp: dNow,
                                status: 'finish'
                            }
                            let parking_rate = 0;
                            if(total_parking_time <= 0){
                                dataUpdate.total_parking_time = 0;
                            }else{
                                dataUpdate.total_parking_time = total_parking_time;
                                let parking_time = total_parking_time - 15;

                                let terrifData = await this.terrifRepository.findOne({
                                    where: { id: transationDetail.terrif_id },
                                    relations: ['terrif_price', 'price_components'],
                                });
                                let parkingFees = terrifData.parking_fees ? Number(terrifData.parking_fees) : 0;

                                let remainingTime = parking_time%15;
                                parking_rate = ((parking_time-remainingTime)/15) * parkingFees;

                                if(remainingTime >= 0){
                                    parking_rate += parkingFees;
                                }
                            }
                            await this.machineTransationLogRepository.update(machineTransationLogDetails.id, dataUpdate);

                            await this.transactionRepository.update(machineTransationLogDetails.transaction_id, { total_energy: machineTransationLogDetails.total_meter, actual_charging_minutes: machineTransationLogDetails.total_time, parking_rate: parking_rate });
                            await this.userService.lastPaymentProcess({id: machineTransationLogDetails.transaction_id});
                        }
                    }
                     let requestSaveMachineToken = {
                       location_id: evseData.location_id,
                       evse_uuid: evseData.uid,
                       evse_id: evseData.evse_id,
                       connector_id: requestParse[3].connectorId,
                    }
                    this.saveMachineToken(requestSaveMachineToken);
                    machineLog.response = JSON.stringify(responseData);
                }else if(request.event_name == "Authorize"){
                    let requestParse = JSON.parse(request.request);
                    let requestSaveMachineToken = {
                       location_id: evseData.location_id,
                       evse_uuid: evseData.uid,
                       evse_id: evseData.evse_id,
                       id_token: requestParse[3].idTag,
                    }
                    this.saveMachineToken(requestSaveMachineToken);
                    let transationResponse = await this.transactionRepository.findOne({
                        where: { location_id: evseData.location_id, status: 'pending' }
                    });
                    if(transationResponse){
                        responseData.idTagInfo = {
                            status : "Accepted"
                        }
                    }else{
                        responseData.idTagInfo = {
                            status : "Invalid"
                        }
                    }

                    machineLog.response = JSON.stringify(responseData);
                  //  if(evseData.status == '')
                }else{
                    machineLog.response = JSON.stringify(responseData);
                }
            }
            if(request.request){
                machineLog.request = (request.request) ? JSON.stringify(request.request) : null;
            }

            if(machineLog.id){
                await this.machineLogRepository.update(machineLog.id, machineLog);
                return await this.machineLogRepository.findOne(machineLog.id);
            }else{
                return await this.machineLogRepository.save(machineLog);
            }

        } catch (error) {
            throw error;
        }

    }

    async saveTransationLog(request){
        const station = await this.evseRepository.findOne({evse_id : request.evse_id});
       // const stationDetail = await this.machineTokenRepository.findOne({ where: { evse_id: station.evse_id }});
        const transationDetail = await this.transactionRepository.findOne({ where: { location_id: station.location_id, status: 'pending' }, order : { id:'DESC'} });
        if(!transationDetail){
            if(request.event_name == 'StartTransaction'){
                return {
                    transactionId: 1,
                    idTagInfo: {
                        status: 'Invalid'
                    }
                };
            }else if(request.event_name == 'StopTransaction'){
                return {
                    idTagInfo: {
                        status: 'Invalid'
                    }
                };

            }else{
                return {};
            }
        }
        try {
           // let machineTransationLog = new MachineTransationLog();
            if(request.event_name == 'StartTransaction'){
                let startRequest = {
                    location_id : station.location_id,
                    evse_uuid : station.uid,
                    transaction_id : transationDetail.id,
                    evse_id : station.evse_id,
                    meter_start : request.request_value.meterStart,
                    start_timestamp : request.request_value.timestamp,
                    total_parking_time : 0,
                    status : 'ongoing',
                }
                await this.saveMachineTransationLog(startRequest);
                const setChargingProfile = new SetChargingProfileEvent();
                setChargingProfile.evse_id = station.evse_id;
                await this.notificationService.addNotification("Charging Start", `Your car charging will be start soon.`, transationDetail.user_id,{ transation_id: transationDetail.id, evse_id : station.evse_id });
                this.eventEmitter.emit('set-charging-profile', setChargingProfile);

                return {
                    transactionId :transationDetail.id,
                    idTagInfo: {
                        status: 'Accepted'
                    }
                }
            }else if(request.event_name == 'StopTransaction'){
                let machineTransationLogDetails = await this.machineTransationLogRepository.findOne({
                        where : { evse_id : station.evse_id, status: 'ongoing'},
                        order : { id: 'DESC' }
                    });
                let stopRequest = {
                    id : machineTransationLogDetails.id,
                    meter_stop : request.request_value.meterStop,
                    total_meter : request.request_value.meterStop - machineTransationLogDetails.meter_start,
                    stop_timestamp : request.request_value.timestamp,
                    total_time : await this.calculateMinutes(machineTransationLogDetails.start_timestamp, request.request_value.timestamp),
                    status : 'end',
                    user_id : transationDetail.user_id,
                    station_uid : station.uid,
                    evse_uuid : machineTransationLogDetails.evse_uuid
                }
                await this.saveMachineTransationLog(stopRequest);

                return {
                    idTagInfo: {
                        status: 'Accepted'
                    }
                }
            }else if(request.event_name == 'MeterValues'){
                let sampledValue = request.request_value.meterValue[0].sampledValue;
                let i = sampledValue.find(o => (o.context === 'Transaction.Begin' || o.context === 'Transaction.End') );
                if(i){
                    if(i.context === 'Transaction.Begin'){
                        let startRequest = {
                            location_id : station.location_id,
                            evse_uuid : station.uid,
                            transaction_id : transationDetail.id,
                            evse_id : station.evse_id,
                            meter_start : i.value,
                            start_timestamp : request.request_value.meterValue[0].timestamp,
                            total_parking_time : 0,
                            status : 'ongoing',
                        }
                        await this.saveMachineTransationLog(startRequest);
                    }else if(i.context === 'Transaction.End'){
                        let machineTransationLogDetails = await this.machineTransationLogRepository.findOne({evse_id : station.evse_id, status: 'ongoing'});
                    // console.log(machineTransationLogDetails,'machineTransationLogDetails');
                        let stopRequest = {
                            id : machineTransationLogDetails.id,
                            meter_stop : i.value,
                            total_meter : i.value - machineTransationLogDetails.meter_start,
                            stop_timestamp : request.request_value.meterValue[0].timestamp,
                            total_time : await this.calculateMinutes(machineTransationLogDetails.start_timestamp, request.request_value.meterValue[0].timestamp),
                            status : 'end',
                            user_id : transationDetail.user_id,
                            station_uid : station.uid
                        }
                        await this.saveMachineTransationLog(stopRequest);

                    }
                }
                return {}
            }

        }catch(error){
            throw error;
        }
    }

    async saveMachineTransationLog(request){
        let machineTransationLog = new MachineTransationLog();
        if(request.location_id){
            machineTransationLog.location_id = request.location_id;
        }
        if(request.evse_uuid){
            machineTransationLog.evse_uuid = request.evse_uuid;
        }
        if(request.transaction_id){
            machineTransationLog.transaction_id = request.transaction_id;
        }
        if(request.evse_id){
            machineTransationLog.evse_id = request.evse_id;
        }
        if(request.meter_start){
            machineTransationLog.meter_start = request.meter_start;
        }
        if(request.meter_stop){
            machineTransationLog.meter_stop = request.meter_stop;
        }
        if(request.total_meter){
            machineTransationLog.total_meter = request.total_meter;
        }
        if(request.start_timestamp){
            machineTransationLog.start_timestamp = request.start_timestamp;
        }
        if(request.stop_timestamp){
            machineTransationLog.stop_timestamp = request.stop_timestamp;
        }
        if(request.total_time){
            machineTransationLog.total_time = request.total_time;
        }
        if(request.total_parking_time){
            machineTransationLog.total_parking_time = request.total_parking_time;
        }
        if(request.status){
            machineTransationLog.status = request.status;
        }

        if(request.id){
            console.log(machineTransationLog,'machineTransationLog');
            await this.machineTransationLogRepository.update(request.id, machineTransationLog);
            await this.notificationService.addNotification("Charging Complete", `Your charging is compelete. please disconnect gun from your vehicle.`, request.user_id);
            await this.evseRepository.update(request.evse_uuid, { meterValue: request.meter_stop });

        }else{
            await this.machineTransationLogRepository.save(machineTransationLog);
        }
        return true;

    }
    async calculateMinutes(startDate,endDate)
    {
        let startDate1:any = new Date(startDate);
        let endDate1:any = new Date(endDate);
        var diff: any = Math.abs(endDate1 - startDate1);
        var minutes = Math.floor((diff/1000)/60);
        return minutes;
    }

   /*

   {
  evse_id: '38000900101',
  request: '[2,"1","StopTransaction",{"transactionId":1,"meterStop":1000,"timestamp":"2021-07-02T10:32:10.979Z"}]',
  request_value: {
    meterStop: 1000,
    timestamp: '2021-07-02T10:32:10.979Z',
    transactionId: 1
  },
  event_name: 'StopTransaction'
}
{
  evse_id: '/38000900101',
  request: '[2,"1","StartTransaction",{"connectorId":1,"idTag":"04340000000000028989","meterStart":0,"reservationId":1,"timestamp":"2021-07-01T12:38:59.951Z"}]',
  request_value: {
    connectorId: 1,
    idTag: '04340000000000028989',
    meterStart: 0,
    reservationId: 1,
    timestamp: '2021-07-01T12:38:59.951Z'
  },
  event_name: 'StartTransaction'
} TransationLog

 */
}
