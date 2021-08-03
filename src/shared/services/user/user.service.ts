import { Injectable, BadRequestException, Inject, forwardRef, NotAcceptableException } from '@nestjs/common';
import { User } from 'src/modules/entity/user.entity';
//import { Settings } from 'src/modules/entity/settings.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { EmailService } from '../email/email.service';
import { DeviceTokens } from 'src/modules/entity/deviceTokens.entity';
import { UserHasRole } from 'src/modules/entity/userHasRole.entity';
import { UserDocument } from 'src/modules/entity/userDocument.entity';
import { Role } from 'src/modules/entity/role.entity';
import { Setting } from 'src/modules/entity/settings.entity';
import moment = require('moment');
import { Pagination } from 'src/shared/class';
import { saveBase64Image } from 'src/shared/helpers/utill';
var randomize = require('randomatic');
import { pick, map, includes } from "lodash"
import { Vehicle } from 'src/modules/entity/vehicle.entity';
import { becrypt, bindDataTableQuery, incrementNumber } from 'src/common/utils';
import { ConfigService } from '@nestjs/config';
import { Wallet } from 'src/modules/entity/wallet.entity';
import { Evse } from 'src/modules/entity/evse.entity';
import { Location } from 'src/modules/entity/location.entity';
import { NotificationService } from '../notification/notification.service';
import { UserPreferences } from 'src/modules/entity/userPreferences.entity';
import { VehicleChargerType } from 'src/modules/entity/vehicleChargerType.entity';
import { LocationsService } from '../locations/locations.service';
import { Transaction } from 'src/modules/entity/transaction.entity';
import { PromoCode } from 'src/modules/entity/promoCode.entity';
import { PromoCodeUses } from 'src/modules/entity/promoCodeUses.entity';
import { VoucherService } from '../voucher/voucher.service';
import { SettingService } from '../setting/setting.service';
import { Terrif } from 'src/modules/entity/terrif.entity';
import { StationsService } from 'src/modules/stations/stations.service';
const Razorpay = require('razorpay');
const configService = new ConfigService();

@Injectable()
export class UserService {
  public paymentKeyId;
  public paymentKeySecret;
  public razorpay;
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Setting) private readonly settingsRepository: Repository<Setting>,
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(UserHasRole) private readonly userHasRoleRepository: Repository<UserHasRole>,
    @InjectRepository(DeviceTokens) private readonly deviceTokensRepository: Repository<DeviceTokens>,
    @InjectRepository(Vehicle) private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(UserDocument) private readonly userDocumentRepository: Repository<UserDocument>,
    @InjectRepository(Wallet) private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Evse) private readonly evseRepository: Repository<Evse>,
    @InjectRepository(Location) private readonly locationRepository: Repository<Location>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserPreferences)
    private readonly userPreferencesRepository: Repository<UserPreferences>,
    @InjectRepository(VehicleChargerType)
    private readonly vehicleChargerTypeRepository: Repository<VehicleChargerType>,
    @InjectRepository(PromoCode)
    private readonly promoCodeRepository: Repository<PromoCode>,
    @InjectRepository(PromoCodeUses)
    private readonly promoCodeUsesRepository: Repository<PromoCodeUses>,
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,

    @InjectRepository(Terrif)
    private readonly terrifRepository: Repository<Terrif>,

    @Inject(forwardRef(() => EmailService)) private readonly emailService: EmailService,
    @Inject(forwardRef(() => LocationsService)) private readonly locationsService: LocationsService,
    @Inject(forwardRef(() => NotificationService)) private readonly notificationService: NotificationService,
    @Inject(forwardRef(() => VoucherService)) private readonly voucherService: VoucherService,
    //@Inject(forwardRef(() => StationsService)) private readonly stationsService: StationsService,
    @Inject(forwardRef(() => SettingService)) private readonly settingsService: SettingService,
  ) {
    this.paymentKeyId = configService.get('RAZORPAY_KEY_ID');
    this.paymentKeySecret = configService.get('RAZORPAY_SECRATE_KEY');
    this.razorpay = new Razorpay({
      key_id: this.paymentKeyId,
      key_secret: this.paymentKeySecret
    });
  }
  async get(request) {
    try {
      let roles = [];

      if (request.user_type == 'admin') {
        roles.push(request.user_type, 'Super Admin');
      } else {
        roles.push(request.user_type);
      }

      const query = await this.userRepository.createQueryBuilder('user')
        .leftJoinAndSelect("user.roles", "roles")
        .where('roles.name IN (:...roles)', { roles })

      bindDataTableQuery(request, query);

      let response = await (new Pagination(query, User).paginate(request.limit, request.page));

      return response;
    } catch (error) {
      throw error;
    }
  }
  async getAnalyticsData(request, user) {
    var currentDate = moment().format("YYYY-MM-DD");
    let totalUsers = 0;
    let totalCPOUsers = 0;
    let totalChargers = 0;
    let totalLocations = 0;
    let totalUnavailable = 0;
    let totalAvailable = 0;
    let locationsData = [];
    let revenueData = {
      labels: [],
      data: []
    };

    if (user.roles.length > 0 && user.roles[0].name == 'Owner') {
      const totalChargerData = await this.evseRepository.createQueryBuilder('evse')
        .leftJoinAndSelect('evse.location', 'location')
        .leftJoinAndSelect('location.user', 'user')
        .where(`user.id = ${user.id}`)
        .getCount();
      totalChargers = totalChargerData ? totalChargerData : 0;

      let revenueDataRes = await this.transactionRepository.query(`SELECT ts.total_amount, ts.created_at
        FROM transaction as ts
        WHERE ts.party_id = '`+ user.id + `' AND DATE(ts.created_at) = '${currentDate}'
      `);
      if (revenueDataRes && revenueDataRes.length > 0) {
        await this.filter(revenueDataRes, async item => {
          revenueData.labels.push(moment(item.created_at).format("hh:mm a"));
          revenueData.data.push(item.total_amount);
        });
      }
      console.log(user.id);
       /* let locationsData = await this.locationRepository.query(`
        select id from locations
        where party_id =  `+  user.id + ``); */
      let locationsData = await this.locationRepository.createQueryBuilder("locations")
        .where('locations.party_id = :userId',{ userId: user.id })
        .getMany();
      let locationsIds = await map(locationsData, 'id');
      console.log(locationsIds,'locationsIds');
      if(locationsIds.length){
        totalAvailable = await this.evseRepository.createQueryBuilder('evse')
                        .andWhere("status =:status",{status : 'Available'})
                        .andWhere("location_id IN (:...location_id)", { location_id: locationsIds })
                        .getCount();
        totalUnavailable = await this.evseRepository.createQueryBuilder('evse')
                          .andWhere("status =:status",{status : 'Unavailable'})
                          .andWhere("location_id IN (:...location_id)",{ location_id : locationsIds})
                          .getCount();

      }

    } else {
      const totalUserData = await this.userRepository.createQueryBuilder('user')
        .leftJoinAndSelect("user.roles", "roles")
        .where("roles.name = :name", { name: 'User' })
        .getCount();
      totalUsers = totalUserData ? totalUserData : 0;

      const totalCPOUserData = await this.userRepository.createQueryBuilder('user')
        .leftJoinAndSelect("user.roles", "roles")
        .where("roles.name = :name", { name: 'Owner' })
        .getCount();
      totalCPOUsers = totalCPOUserData ? totalCPOUserData : 0;

      const totalLocationData = await this.locationRepository.createQueryBuilder('locations')
        .getCount();
      totalLocations = totalLocationData ? totalLocationData : 0;

      totalAvailable = await this.evseRepository.createQueryBuilder('evse').andWhere("status =:status",{status : 'Available'}).getCount();

      totalUnavailable = await this.evseRepository.createQueryBuilder('evse').andWhere("status =:status",{status : 'Unavailable'}).getCount();
    }


    return {
      totalChargers,
      totalUsers,
      totalCPOUsers,
      totalLocations,
      revenueData,
      totalUnavailable,
      totalAvailable,
    }
  }

  async getOwner() {
    try {
      let user_type = "owner";
      const response = await this.userRepository.createQueryBuilder('user')
        .leftJoinAndSelect("user.roles", "roles")
        .where("roles.name = :name", { name: user_type })
        .getMany();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async findOne(where: Object, relations: Array<any> = []): Promise<User> {
    return this.userRepository.findOne({ where: where, relations: relations });
  }

  async findByPhone(number: string): Promise<User> {
    return this.userRepository.findOne({ where: { phone_number: number } });
  }

  async verifiedUser(payload): Promise<any> {
    await this.userRepository.update(payload.id, { is_verified: true, status: 'active' })
      .then(res => {
        return true;
      })
      .catch(error => {
        throw new BadRequestException(error);
      });
  }

  async findByHashSalt(token: any): Promise<User> {
    return await this.userRepository
      .createQueryBuilder('user')
      .where('token = :token', { token: token })
      .getOne();
  }

  async updateAdminProfile(payload): Promise<any> {
    try {
      let isChangeEmail = false;

      let user = new User();

      if (payload.company_name) {
        user.company_name = payload.company_name;
      }

      if (payload.gst_number) {
        user.gst_number = payload.gst_number;
      }

      if (payload.pan_number) {
        user.pan_number = payload.pan_number;
      }

      if (payload.account_name) {
        user.account_name = payload.account_name;
      }
      if (payload.account_no) {
        user.account_no = payload.account_no;
      }
      if (payload.bank_name) {
        user.bank_name = payload.bank_name;
      }

      if (payload.is_notify != undefined) {
        user.is_notify = (payload.is_notify == true) ? true : false;
      }

      if (payload.name) {
        user.name = payload.name;
      }

      if (payload.email) {
        user.email = payload.email;
        let find = await this.userRepository.findOne({ email: user.email });

        if (find && find.id != payload.id) {
          throw new Error('This email is already used.');
        }
        isChangeEmail = true;
      }

      if (payload.profile_pic) {
        const path = saveBase64Image(payload.profile_pic, 'profile');
        if (path) {
          user.profile_pic = path;
        }
      }

      await this.userRepository.update(payload.id, user);
      user = await this.findOne({ id: payload.id });
      user = Object.assign({ isChangeEmail: isChangeEmail }, user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async createOrUpdateOwner(payload): Promise<any> {
    let user = new User();
    let usedocument = new UserDocument();

    //console.log(payload,"payloadpayloadpayload");
    if (payload.name) {
      user.name = payload.name;
    }

    if (payload.company_name) {
      user.company_name = payload.company_name;
    }

    if (payload.gst_number) {
      user.gst_number = payload.gst_number;
    }

    if (payload.pan_number) {
      user.pan_number = payload.pan_number;
    }

    if (payload.account_name != undefined) {
      user.account_name = payload.account_name;
    }

    if (payload.account_no != undefined) {
      user.account_no = payload.account_no;
    }

    if (payload.bank_name != undefined) {
      user.bank_name = payload.bank_name;
    }

    if (payload.email) {
      user.email = payload.email;
      let find = await this.userRepository.findOne({ email: user.email });
      if (find && find.id != payload.id) {
        throw new Error('This email is already used.');
      }
    }

    if (payload.phone_number) {
      user.phone_number = payload.phone_number;
      let find = await this.userRepository.findOne({ phone_number: user.phone_number });
      if (find && find.id != payload.id) {
        throw new Error('This phone number is already used.');
      }
    }

    if (payload.password) {
      user.password = becrypt(payload.password);
    }

    if (payload.status) {
      user.status = payload.status;
    }

    if (payload.is_verified != undefined) {
      user.is_verified = payload.is_verified ? true : false;
    }

    if (payload.profile_pic) {
      const path = await saveBase64Image(payload.profile_pic, 'profile');
      if (path) {
        user.profile_pic = path;
      }
    }

    if (payload.pan_card) {
      const pan_card = await saveBase64Image(payload.pan_card, 'profile');
      if (pan_card) {
        usedocument.pan_card = pan_card;
      }
    }

    if (payload.bank_detail) {
      const bank_detail = await saveBase64Image(payload.bank_detail, 'profile');
      if (bank_detail) {
        usedocument.bank_detail = bank_detail;
      }
    }

    if (payload.cheque) {
      const cheque = await saveBase64Image(payload.cheque, 'profile');
      if (cheque) {
        usedocument.cheque = cheque;
      }
    }

    if (payload.gst_certificate) {
      const gst_certificate = await saveBase64Image(payload.gst_certificate, 'profile');
      if (gst_certificate) {
        usedocument.gst_certificate = gst_certificate;
      }
    }

    if (payload.id) {
      usedocument.user_id = payload.id;
      await this.userDocumentRepository.update(payload.document_id, usedocument);
      await this.userRepository.update(payload.id, user);
    } else {
      let data = await this.userRepository.save(user);
      let userRole = new UserHasRole();
      userRole.user_id = data.id;
      userRole.role_id = 5;
      await this.userHasRoleRepository.save(userRole);
      usedocument.user_id = data.id;
      await this.userDocumentRepository.save(usedocument);

      payload.id = data.id;
    }
    return await this.findOne({ id: payload.id });
  }

  async create(payload, type = null): Promise<any> {
    try {
      //payload.id = 51;
      let user = new User();

      if (payload.name != undefined) {
        user.name = payload.name;
      }

      if (payload.email) {
        user.email = payload.email;
        let find = await this.userRepository.findOne({ email: user.email });
        if (find && find.id != payload.id) {
          throw new Error('This email is already used.');
        }
      }

      if (payload.phone_number) {
        user.phone_number = payload.phone_number;
        let find = await this.userRepository.findOne({ phone_number: user.phone_number });
        if (find && find.id != payload.id) {
          throw new Error('This phone number is already used.');
        }
      }

      if (payload.password) {
        user.password = becrypt(payload.password);
      }

      if (payload.company_name) {
        user.company_name = payload.company_name;
      }else{
      }

      if (payload.gst_number) {
        user.gst_number = payload.gst_number;
      }else{
        user.gst_number = null;
      }

      if (payload.pan_number) {
        user.pan_number = payload.pan_number;
      }else{
        user.pan_number = null;
      }

      if (payload.is_notify != undefined) {
        user.is_notify = (payload.is_notify == true) ? true : false;
      }

      if (payload.status != undefined) {
        user.status = payload.status;
      }

      if (type == 'register') {
        user.is_verified = false;
      }

      if (payload.profile_pic_multer) {
        user.profile_pic = payload.profile_pic_multer;
      }

      if (payload.address1) {
        user.address1 = payload.address1;
      }
      if (payload.address2) {
        user.address2 = payload.address2;
      }
      if (payload.city) {
        user.city = payload.city;
      }
      if (payload.state) {
        user.state = payload.state;
      }
      if (payload.pincode) {
        user.pincode = payload.pincode;
      }

      if (payload.profile_pic) {
        const path = saveBase64Image(payload.profile_pic, 'profile');
        if (path) {
          user.profile_pic = path;
        }
      }

      if (payload?.id) {

        await this.userRepository.update(payload.id, user);
      } else {
        let data = await this.userRepository.save(user);
        payload.id = data.id;
        if (payload.user_type == undefined) {
          payload.user_type = "User";
          //this.createOTP(data);
        }
      }

      if (payload.user_type) {
        if (!Number.isInteger(payload.user_type)) {
          let roleData = await this.roleRepository.findOne({
            name: payload.user_type,
          });
          payload.user_type = roleData.id;
        }
        let userRole = await this.userHasRoleRepository.findOne({
          user_id: payload.id,
          role_id: payload.user_type,
        });
        if (!userRole) {
          let userRole = new UserHasRole();
          userRole.user_id = payload.id;
          userRole.role_id = payload.user_type;
          await this.userHasRoleRepository.save(userRole);
        }
      }

      if (type == 'admin-register') {
        let context = Object.assign({}, user, { password: payload.password });
        await this.emailService
          .adminRegistrationEmail({ to: user.email, context: context })
          .then(res => {
          })
          .catch(error => {
            throw new BadRequestException(error);
          });
      }

      //if (type == 'register') {
      //this.createOTP(user);
      // let context = Object.assign({}, user, { password: payload.password });
      // await this.emailService
      //   .registrationEmail( v{ to: user.email, context: context })
      //   .then(res => {
      //   })
      //   .catch(error => {
      //     throw new BadRequestException(error);
      //   });
      //}

      return await this.findOne({ id: payload.id });
    } catch (error) {
      throw error;
    }
  }

  async getByEmailAndPass(email: string, password: string) {
    const passHash = crypto.createHmac('sha256', password).digest('hex');
    return await this.userRepository
      .createQueryBuilder('user')
      .where('(user.email = :email) and user.password = :password')
      .setParameter('email', email)
      .setParameter('password', passHash)
      .getOne();
  }

  async sendForgotPasswordEmail(payload): Promise<any> {

    let email = payload.email;
    let user = await this.findOne({ email: email });
    if (user) {
      let passGenerate = randomize('Aa0', 8);
      await this.userRepository.update(user.id, { password: becrypt(passGenerate) });
      let context: any = await this.userRepository.findOne(user.id);

      context.request_type = (payload.type) ? payload.type : 'app';
      context.passGenerate = passGenerate;
      context.name = user.name;

      let response_message = '';
      await this.emailService
        .userForgotPassword({ to: email, context: context })
        .then(res => { })
        .catch(error => {
          throw new BadRequestException(error);
        });
      response_message = 'A new password has been sent to your email.';

      return response_message;
    } else {
      throw new NotAcceptableException(
        'Email does not found',
      );
    }
  }


  async reportUserMail(payload): Promise<any> {
    let settings = await this.settingsRepository.findOne({ key: 'email' });
    let email = settings.value;
    let context: any = await this.userRepository;
    context.type = payload.type;
    context.comment = payload.comment;
    context.name = "Admin";
    context.username = payload.user.name;

    await this.emailService
      .reportUserMail({ to: email, context: context })
      .then(res => { })
      .catch(error => {
        throw new BadRequestException(error);
      });

    return 'Mail sent successfully.';
  }

  async createDeviceToken(payload) {
    try {
      let deviceTokenData = await this.deviceTokensRepository.findOne({
        user_id: payload.user_id,
      });

      let deviceToken = new DeviceTokens();

      deviceToken.user_id = payload.user_id;
      deviceToken.device_token = payload.device_token;
      deviceToken.device_type = payload.device_type;

      if (deviceTokenData) {
        await this.deviceTokensRepository.update(
          deviceTokenData.id,
          deviceToken,
        );
      } else {
        await this.deviceTokensRepository.save(deviceToken);
      }

      return deviceToken;
    } catch (error) {
      throw error;
    }
  }

  async createOTP(user) {
    try {
      //let otp = Math.floor(1000 + Math.random() * 9000);
      let otp = 1234
      await this.userRepository.update(user.id, { otp: otp });

      // this.emailService
      //   .sentOTP({ to: user.email, otp: otp, user: user })
      //   .then(res => { })
      //   .catch(error => {
      //     throw new BadRequestException(error);
      //   });

      return otp;
    } catch (error) {
      throw error;
    }
  }

  async verifyOTP(phone_number, otp) {
    let user = await this.userRepository.findOne({ phone_number: phone_number, otp: otp });
    if (user) {
      await this.userRepository.update(user.id, { otp: null, is_verified: true, status: 'active' });
      return await this.userRepository.findOne(user.id);
    } else {
      throw new NotAcceptableException(
        'Otp is not match.',
      );
    }
  }

  async resetOtp(phone_number) {
    try {
      //let otp = Math.floor(1000 + Math.random() * 9000);
      let otp = 1234
      let user = await this.userRepository.findOne({ phone_number: phone_number });
      if (user) {
        await this.userRepository.update(user.id, { otp: otp });
      } else {
        throw new NotAcceptableException(
          'User not found',
        );
      }
      // this.emailService
      //   .sentOTP({ to: user.email, otp: otp, user: user })
      //   .then(res => { })
      //   .catch(error => {
      //     throw new BadRequestException(error);
      //   });

      return otp;
    } catch (error) {
      throw error;
    }
  }


  async checkVerification(user) {
    let userData = await this.userRepository.findOne({ id: user.id });
    if (userData) {
      return userData;
    } else {
      this.createOTP(user);
      throw new NotAcceptableException(
        'Your verification otp is remaining please check your mail.',
      );
    }
  }

  async resetPassword(input: any): Promise<any> {
    const user = await this.findByHashSalt(input.token);
    if (user) {
      await this.userRepository
        .update(user.id, { password: input.password, token: null })
        .then(res => {
          return true;
        })
        .catch(error => {
          throw new BadRequestException(error);
        });
    } else {
      throw new NotAcceptableException(
        'URL for reset password has been expired.',
      );
    }
  }


  async changePassword(user, input: any): Promise<any> {
    let matchPassword = await this.userRepository.count({ id: user.id, password: becrypt(input.old_password) });
    if (matchPassword > 0) {
      await this.userRepository.update(user.id, { password: becrypt(input.password) })
        .then(res => {
          return true;
        })
        .catch(error => {
          throw new BadRequestException(error);
        });
    } else {
      throw new NotAcceptableException(
        'old password is not match.',
      );
    }
  }

  async logout(input: any) {
    await this.deviceTokensRepository.delete({ user_id: input.id })
  }

  async delete(id) {
    await this.userRepository.softDelete({ id: id })
  }

  // async getSettings() {
  //   let settings = await this.settingRepository.find();
  //   let html = '<html><body><h2>Contact us</h2><p>Email : {{to_email}}</p> <p> Address : {{address}}</p> <p><br></p></body></html>';
  //   if (settings && settings.length > 0) {
  //     let sett = {}
  //     settings = settings.filter((set) => {
  //       sett = Object.assign(sett, { [set.key]: set.value });
  //     });
  //     html = nunjucks.renderString(html, sett);
  //     return html;
  //     //return sett;
  //   }
  //   return null;
  // }

  // async getCountries() {
  //   return await this.countryRepository.find();
  // }

  async updateFcmToken(user_id, payload) {
    let deviceToken = await this.deviceTokensRepository.findOne({ user_id: user_id });
    if (deviceToken) {

    }
    return await this.deviceTokensRepository.update(user_id, { device_token: payload.fcm_token });
  }


  async filter(arr, callback) {
    const fail = Symbol()
    return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i => i !== fail)
  }

  async getPaymentToken(payload) {

    const options = {
      amount: (payload.body.amount * 100),
      currency: 'INR',
      receipt: new Date().getTime(),
      payment_capture: 1
    }

    try {
      const response = await this.razorpay.orders.create(options)
      return {
        order_id: response.id,
        currency: response.currency,
        amount: response.amount
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  /* async paymentProcess(payload) {
    let evseDetails = await this.evseRepository.findOne(payload.evse_id);
    //need id of evse
    await this.stationsService.sendStationOperationRequest(
      evseDetails.evse_id,
      'ClearCache',
      {}
    );
    const transactionRes = await this.transactionRepository.findOne({ order: { id: 'DESC' } });

    const location = await this.locationRepository.findOne(payload.location_id);


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
 *
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

      let wallet = await this.loadWalletMoney(payload, 0);
      /* await this.stationsService.sendStationOperationRequest(
        evseDetails.evse_id,
        'ReserveNow',
        {}
      ); */
      /* await this.stationsService.sendStationOperationRequest(
        evseDetails.evse_id,
        'SetChargingProfile',
        {}
      ); *

      return await this.transactionRepository.findOne({ where: { id: resTerrif.id }, relations: ['terrif', 'terrif.price_component', 'owner', 'connector', 'location', 'chargerType', 'promoCode'] });
    /* } else {
      throw new BadRequestException('something went wrong!, Please try again later');
    } *
  } */

  async lastPaymentProcess(payload){
    //on masccine api have to calulate parking rate, total energy, actual_charging_minutes
    const oldTransaction = await this.transactionRepository.findOne({id:Number(payload.id), status:'pending'});

    if(!oldTransaction){
      throw new BadRequestException('something went wrong!, Please try again later');
    }
    let settings:any = await this.settingsService.get();

    let terrifData = await this.terrifRepository.findOne({
      where: { id: oldTransaction.terrif_id },
      relations: ['terrif_price', 'price_components'],
    });
    let price_components = terrifData.price_components ? terrifData.price_components[0] : [];
    let mainPriceByUnit = price_components.price ? price_components.price : 0;
    let energyAmount = 0;
    let cashbackAmount = 0;

    if (price_components.type == "ENERGY") {
      energyAmount = (Number(mainPriceByUnit) * Number(	oldTransaction.total_energy));
    }else{
      let timeTosecond = oldTransaction.actual_charging_minutes * 60;
      energyAmount = (timeTosecond * mainPriceByUnit);
    }
    oldTransaction.user_electrict_deduction = Number(energyAmount);
    energyAmount += oldTransaction.flat_rate;

    let franchiseDeductionPer = (settings.franchise_deduction) ? Number(settings.franchise_deduction) : 0;
    let electricDeduction = (settings.electric_deduction) ? Number(settings.electric_deduction) : 0;
    let cpo_gst = (settings.cpo_gst) ? Number(settings.cpo_gst) : 0;

    let finalAmount = oldTransaction.amount;

    const userData = await this.userRepository.findOne({id:oldTransaction.user_id});
    //avu possible thay k apne vadhare rs lae lidha hoe?
    let updateUserData:any = {};
    updateUserData.caseback_amount = (userData.caseback_amount) ? userData.caseback_amount : 0;
    if(userData){

      let walletPayload:any = {};
      walletPayload.user_id = oldTransaction.user_id;

      if(oldTransaction.caseback_available){
       // oldTransaction.total_amount = energyAmount - oldTransaction.caseback_available;
        energyAmount = energyAmount - oldTransaction.caseback_available;
        updateUserData.caseback_amount = Number(updateUserData.caseback_amount) - Number(oldTransaction.caseback_available);

        let debitPayload = {
          amount : oldTransaction.caseback_available,
          transactioId : oldTransaction.id,
          user_id : oldTransaction.user_id,
          type : "debit",
          description : "Cashback Debited",
          wallet_type : "caseback"
        }
        let wallet = await this.loadWalletMoney(debitPayload, 1);
      }else{
//oldTransaction.total_amount = energyAmount;
      }

      if(energyAmount < finalAmount){
        let balancePlusAmount = Number(finalAmount) - Number(energyAmount);
        updateUserData.balance = Number(userData.balance) + Number(balancePlusAmount);
        walletPayload.amount = balancePlusAmount;
        walletPayload.type = 'credit';
       // walletPayload.description = 'Money added after calculation of last charging cost.';
        walletPayload.description = 'Bill Adjusted';
        walletPayload.transactioId = oldTransaction.id;
        await this.loadWalletMoney(walletPayload,1);
      }else if(finalAmount < energyAmount){
        let balanceMinusAmount = Number(energyAmount) - Number(finalAmount);
        updateUserData.balance = Number(userData.balance) - Number(balanceMinusAmount);
        walletPayload.amount = balanceMinusAmount;
        walletPayload.type = 'debit';
      //  walletPayload.description = 'Money subtracted after calculation of last charging cost.';
        walletPayload.description = 'Bill Adjusted';
        walletPayload.transactioId = oldTransaction.id;
        await this.loadWalletMoney(walletPayload,1);
      }

      if(oldTransaction.promocode_id){
        let promoCode = await this.promoCodeRepository.findOne(oldTransaction.promocode_id);
        if (promoCode) {
          let checkPayload = {
            net_amount: energyAmount,
            user_id: oldTransaction.user_id,
            promocode_id: oldTransaction.promocode_id,
            location_id: oldTransaction.location_id
          }

          let promocodeData: any = await this.voucherService.checkValidPromocode(promoCode, checkPayload,'process');
          if (promocodeData.status == 200) {
            if (promocodeData.data && promocodeData.data.cashbackAmount) {
              cashbackAmount = Number(promocodeData.data.cashbackAmount);
            }
          }
        }
      }

      if(oldTransaction.parking_rate){
        energyAmount += oldTransaction.parking_rate;
        let b = (updateUserData.balance) ? updateUserData.balance : userData.balance;
        updateUserData.balance = Number(b) - Number(oldTransaction.parking_rate);
        let walletPayloadParkingFee: any = {};
        walletPayloadParkingFee.user_id = oldTransaction.user_id;
        walletPayloadParkingFee.amount = Number(oldTransaction.parking_rate);
        walletPayloadParkingFee.type = 'debit';
        //walletPayloadParkingFee.description = 'Money subtracted for occupancy fee.';
        walletPayloadParkingFee.description = 'Occupancy Fee';
        walletPayloadParkingFee.transactioId = oldTransaction.id;
        await this.loadWalletMoney(walletPayloadParkingFee,1);
      }

      /* if(oldTransaction.parking_rate){
        updateUserData.balance = updateUserData.balance - oldTransaction.parking_rate;
      } */
    }
    //oldTransaction.amount = energyAmount;

    oldTransaction.electrict_deduction = electricDeduction * oldTransaction.total_energy;

    if (franchiseDeductionPer > 0) {
      oldTransaction.franchise_deduction = Number((franchiseDeductionPer / 100) * energyAmount);
    }

    oldTransaction.cpo_gst_deduction = (oldTransaction.franchise_deduction * cpo_gst )/100;
    if(oldTransaction.kwik_promo_avail){
      let cal = (100 + cpo_gst) /100;
      let cal1 = cpo_gst/100;
      oldTransaction.cpo_kwick_cashback = oldTransaction.kwik_promo_avail/cal;
      oldTransaction.cpo_kwick_cashback_gst = oldTransaction.cpo_kwick_cashback * cal1;
    }

    oldTransaction.cpo_final_payout = energyAmount - oldTransaction.kwik_promo_avail - oldTransaction.cpo_coupon_deduction - oldTransaction.franchise_deduction - oldTransaction.electrict_deduction - oldTransaction.cpo_gst_deduction + oldTransaction.cpo_kwick_cashback + oldTransaction.cpo_kwick_cashback_gst;
    oldTransaction.status = 'completed';

    if(cashbackAmount){
        updateUserData.caseback_amount = Number(updateUserData.caseback_amount) + Number(cashbackAmount);
        let walletCasebackPayload: any = {};
        walletCasebackPayload.amount = cashbackAmount;
        walletCasebackPayload.user_id = oldTransaction.user_id;
        walletCasebackPayload.type = 'credit';
       // walletCasebackPayload.description = 'Cashback added.';
        walletCasebackPayload.description = 'Cashback Credited';
        walletCasebackPayload.wallet_type = 'caseback';
        walletCasebackPayload.transactioId = oldTransaction.id;
        await this.loadWalletMoney(walletCasebackPayload,1);
          if(oldTransaction.kwik_promo_avail){
            oldTransaction.kwik_promo_avail = cashbackAmount;
          }else if(oldTransaction.cpo_coupon_deduction){
            oldTransaction.cpo_coupon_deduction = cashbackAmount;
          }
    }else if(oldTransaction.promocode_id){
      oldTransaction.kwik_promo_avail = 0;
      oldTransaction.cpo_coupon_deduction = 0;
      oldTransaction.promocode_id = 0;
    }
    if(updateUserData){
      await this.userRepository.update(userData.id, updateUserData);
    }
    oldTransaction.amount = Number(oldTransaction.flat_rate) + Number(oldTransaction.parking_rate) + Number(oldTransaction.user_electrict_deduction);
    if(oldTransaction.caseback_available){
      oldTransaction.total_amount = Number(oldTransaction.amount) - Number(oldTransaction.caseback_available);
    }else{
      oldTransaction.total_amount = oldTransaction.amount
    }
    /* if (oldTransaction.kwik_promo_avail) {
      oldTransaction.total_amount = energyAmount - oldTransaction.kwik_promo_avail;
    }
    if (oldTransaction.cpo_coupon_deduction) {
      oldTransaction.total_amount = energyAmount - oldTransaction.cpo_coupon_deduction;
    } */
    await this.transactionRepository.update(payload.id, oldTransaction);

  }
  async test(){
    /* const transactionRes = await this.transactionRepository.findOne({ order: { id: 'DESC' } });
    let invoice_number = null;
    if(transactionRes){
        invoice_number = await incrementNumber(transactionRes.invoice_number, 'invoice');
      }else{
        invoice_number = await incrementNumber(null, 'invoice');
      } */
    return new Date().toLocaleString('en-US', {timeZone: 'Asia/Kolkata'});


  }

  async paymentCaptured(payload) {
    let hmac = crypto.createHmac('sha256', this.paymentKeySecret);
    hmac.update(payload.razorpay_order_id + "|" + payload.razorpay_payment_id);
    let generatedSignature = hmac.digest('hex');
    if (generatedSignature == payload.razorpay_signature) {
      let paymentData = await this.razorpay.payments.fetch(payload.razorpay_payment_id);
      if (paymentData) {
        payload.type = 'credit';
        payload.amount = paymentData.amount / 100;
       // payload.description = `Money added.`;
        payload.description = `Wallet Recharge`;
        payload.details = (paymentData) ? JSON.stringify(paymentData) : null;
        payload.method =  paymentData.method;
        await this.loadWalletMoney(payload);
        await this.notificationService.addNotification("Wallet Balance Update", `${(paymentData.amount / 100)} amount added to wallet.`, payload.user_id);
      }
    } else {
      throw new BadRequestException('something went wrong!, Please try again later');
    }
    return;
  }

  async loadWalletMoney(payload, needToUpdateUser = 0) {
    //transaction_id
     if (payload.type && payload.type == 'debit' && !needToUpdateUser) {
      let userData = await this.userRepository.findOne({ id: payload.user_id });
      if (userData) {
        let amount = Number(payload.amount);
        let totalAmount = Number(userData.balance) - amount;
       // let caseback_amount = userData.caseback_amount ? Number(userData.caseback_amount) : 0;
       // let totalAmount = userData.balance ? Number(userData.balance) : 0;

       /*  if(caseback_amount){
          if (caseback_amount > amount){
            caseback_amount = caseback_amount - amount;
            if(payload.transactioId){
              await this.transactionRepository.update({id: payload.transactioId},{caseback_available : amount });
            }
            amount = 0;
          }else{
            if(payload.transactioId){
              await this.transactionRepository.update({id: payload.transactioId},{caseback_available : caseback_amount });
            }
            amount = amount - caseback_amount;
            caseback_amount = 0;
          }
            let walletCasebackPayload: any = {};
            walletCasebackPayload.amount = (caseback_amount) ? (Number(userData.caseback_amount) - Number(caseback_amount)) : userData.caseback_amount;
            walletCasebackPayload.user_id = payload.user_id;
            walletCasebackPayload.type = 'debit';
           // walletCasebackPayload.description = 'Caseback subtracted.';
            walletCasebackPayload.description = 'Cashback Debited';
            walletCasebackPayload.wallet_type = 'caseback';
            walletCasebackPayload.transactioId = payload.transactioId;
            await this.loadWalletMoney(walletCasebackPayload,1);
            payload.amount = amount;
        }
        if(amount){
          totalAmount = totalAmount - amount;
        } */

        await this.userRepository.update(payload.user_id, { balance: totalAmount });
      }
    }

    if (payload.type && payload.type == 'credit' && !needToUpdateUser) {
      let userData = await this.userRepository.findOne({ id: payload.user_id });
      if (userData) {
        let totalAmount = Number(userData.balance ? userData.balance : 0 ) + Number(payload.amount);
        await this.userRepository.update(payload.user_id, { balance: totalAmount });
      }
    }
    let wallet = new Wallet();

    if (payload.amount) {
      wallet.balance = payload.amount;
    }

    if(payload.transactioId){
      wallet.transaction_id = payload.transactioId;
    }

    if (payload.user_id) {
      wallet.user_id = payload.user_id;
    }

    if (payload.type) {
      wallet.type = payload.type;
    }

    if (payload.description) {
      wallet.description = payload.description;
    }

    if(payload.details){
      wallet.details = payload.details;
    }

    if(payload.method){
      wallet.method = payload.method;
    }

    if(payload.wallet_type){
      wallet.wallet_type = payload.wallet_type;
    }

    if (payload.razorpay_payment_id) {
      wallet.payment_id = payload.razorpay_payment_id;
    }
    if (payload.id) {
      await this.walletRepository.update(payload.id, wallet);
    } else {
      const res = await this.walletRepository.save(wallet);
      payload.id = res.id;
    }
    let data = await this.walletRepository.findOne(payload.id);
    return data;
  }

  async qrCodeScanner(payload) {
    if (payload.evse_uid && payload.physical_reference) {
      let data = await this.evseRepository.findOne({
        where: {
          uid: payload.evse_uid,
          physical_reference: payload.physical_reference
        }
      });
      if (data) {
        if (data.status != 'Available') {
          return { status: 400, message: "Not able to reserve due to status is " + data.status }
        } else {
          //await this.evseRepository.update(data.uid, { status: 'RESERVED' })
          return { status: 200, message: 'valid' }
        }
      } else {
        return { status: 400, message: 'Not valid' }
      }
    } else {
      let data = await this.evseRepository.findOne({
        where: {
          physical_reference: payload.physical_reference
        },
        relations: ['connectors', 'location']
      });
      if (data) {
        if (data.status != 'Available') {
          return { status: 400, message: "Not able to reserve due to status is " + data.status }
        } else {
          let userVehiclePorts = [];
          let userPreferencesData = await this.userPreferencesRepository.findOne({ where: { user_id: payload.user_id } });
          if (userPreferencesData) {
            const vehicleChargerTYpes = await this.vehicleChargerTypeRepository.find({ where: { vehicle_id: userPreferencesData.current_vehicle_id }, relations: ['charger_type'] })
            if (vehicleChargerTYpes && vehicleChargerTYpes.length > 0) {
              userVehiclePorts = map(vehicleChargerTYpes, 'charger_type.standard');
            }
          }
          let connectors = [];
          if (data.connectors && data.connectors.length > 0) {
            connectors = await this.filter(data.connectors, async item => {
              if (!item.deleted_at && includes(userVehiclePorts, item.standard)) {
                return item;
              }
            });
            if (connectors.length == 0) {
              return { status: 400, message: 'Connector not matched with selected vehicle standard' }
            } else {
              let connectorsId = map(connectors, 'id');
              let locationData = await this.locationsService.getLocationById(data.location.id);
              if (locationData.evses && locationData.evses.length > 0) {
                locationData.evses = await this.filter(locationData.evses, async item => {
                  if (item.uid == data.uid) {
                    if (item.connectors && item.connectors.length > 0) {
                      item.connectors = await this.filter(item.connectors, async element => {
                        if (includes(connectorsId, element.id)) {
                          return element;
                        }
                      });
                    }
                    return item;
                  }
                })
              }
              return { status: 200, data: locationData };
            }
          } else {
            return { status: 400, message: "Connector not found foe selected evse." }
          }
        }
      } else {
        return { status: 400, message: "Not valid" }
      }
    }
  }
}


