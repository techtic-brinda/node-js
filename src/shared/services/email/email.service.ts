import { Injectable } from '@nestjs/common';
import { MailerService } from '@nest-modules/mailer';
import { ConfigService } from '@nestjs/config';
//import { baseUrl } from '../../shared/helpers/utils';
import { baseUrl } from '../../helpers/utill';

@Injectable()
export class EmailService {
    private configService: any;

    constructor(
        private readonly mailerService: MailerService,
    ) {
        this.configService = new ConfigService();
    }
    public async userForgotPassword(data: any = {}): Promise<any> {
        let logo = baseUrl('public/logo.png');
        data = Object.assign({}, data, this.configService);
        let url = 'reset-password/' + data.context.token;
        if (data.context.request_type == 'admin'){
            url = 'admin/set-password/' + data.context.token;
        }
        data.context.reset_password_url = baseUrl(
            url,
          'front-end'
        );

        let res = await this.mailerService.sendMail({
          to: data.to, //List of receivers
          subject: 'Forgot Password - ' + this.configService.get('APP_NAME'), //Subject line
          template: 'user-forgot-password',
          context: {
            settings: { APP_NAME: this.configService.get('APP_NAME') },
            data: data.context,
            logo: logo,
          },
        }).catch((err)=>{
            console.log(err, 'mail error');
        });
        
    }

    public async reportUserMail(data: any = {}): Promise<any> {
        let logo = baseUrl('public/logo.png');
        data = Object.assign({}, data, this.configService);        
        let res = await this.mailerService.sendMail({
          to: data.to,
          subject: 'User Report - ' + this.configService.get('APP_NAME'),
          template: 'report-mail',
          context: {
            settings: { APP_NAME: this.configService.get('APP_NAME') },
            data: data.context,
            logo: logo,
          },
        }).catch((err)=>{
            console.log(err, 'mail error');
        });        
    }

    public async sentOTP(data: any = {}): Promise<any> {
        
        let logo = baseUrl('public/logo.png');
        data = Object.assign({}, data, this.configService);

        return this.mailerService.sendMail({
            to: data.to, //List of receivers
            subject: 'Verify OTP - ' + this.configService.get('APP_NAME'), //Subject line
            template: 'verify-otp',
            context: {
                settings: { APP_NAME: this.configService.get('APP_NAME') },
                otp: data.otp,
                user: data.user,
                logo: logo,
            },
        });
        
    }
    public async sendVouchersCodes(data: any = {}): Promise<any> {
        let logo = baseUrl('public/logo.png');
        data = Object.assign({}, data, this.configService);
        console.log(data.context, 'data.context');
        
        let d = this.mailerService.sendMail({
            to: data.to, //List of receivers
            subject: 'Vouchers codes', //Subject line
            template: 'send-vouchers-to-cpo',
            context: {
                settings: {'APP_NAME': this.configService.get('APP_NAME')},
                data: data.context,
                logo: logo
            },
        });

        return d;
    }
    public async adminRegistrationEmail(data: any = {}): Promise<any> {
        let logo = baseUrl('public/logo.png');
        data = Object.assign({}, data, this.configService);
        let d = this.mailerService.sendMail({
            to: data.to, //List of receivers
            subject: 'Registration - ' + this.configService.get('APP_NAME'), //Subject line
            template: 'admin-user-registration',
            context: {
                settings: {'APP_NAME': this.configService.get('APP_NAME')},
                data: data.context,
                logo: logo
            },
        });

        return d;
    }
    
    public async registrationEmail(data: any = {}): Promise<any> {
        let logo = baseUrl('public/logo.png');
        data = Object.assign({}, data, this.configService);
        let d = this.mailerService.sendMail({
            to: data.to, //List of receivers
            subject: 'Registration - ' + this.configService.get('APP_NAME'), //Subject line
            template: 'initial-registration',
            context: {
                settings: {'APP_NAME': this.configService.get('APP_NAME')},
                data: data.context,
                logo: logo
            },
        });

        return d;
    }
}
