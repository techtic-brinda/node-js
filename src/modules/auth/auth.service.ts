import { Injectable, forwardRef, Inject, UnauthorizedException, NotAcceptableException } from '@nestjs/common';
import { LoginDTO } from 'src/shared/dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/modules/entity/user.entity';
import { UserService } from 'src/shared/services/user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    ) { }
    async validateUser(payload: LoginDTO): Promise<any> {
        const verify = await this.userService.getByEmailAndPass(
            payload.email,
            payload.password,
        );
        if (verify == undefined) {
            return verify;
        }
        //await this.userService.checkVerification(verify);

        let data = await this.userService.findOne({ id: verify.id }, ['roles']);

        if(data.roles[0].name == "Owner"){
            if(data.status == "inactive"){
                return 0;
            }
        }

        if(data && payload.device_token){
            payload.user_id = data.id
            await this.userService.createDeviceToken(payload);
            data.fcm_token = payload.device_token;
        }
        return data;
    }

    createToken(user: User) {
        const payload = { email: user.email, id: user.id };
        return {
            token: this.jwtService.sign(payload),
        };
    }

    createTokenByPhone(user: User) {
        const payload = { phone_number: user.phone_number, id: user.id };
        return {
            token: this.jwtService.sign(payload),
        };
    }

    async refreshToken(request: any): Promise<any> {
        try {
            var decoded = this.jwtService.decode(request.token, { complete: true });
            let payload = decoded['payload'];

            if (payload) {
                delete payload.iat;
                delete payload.exp;
            }
            let user = await this.userService.findOne({ email: payload.email });
            let { token } = this.createToken(user);

            return {
                token: token,
                user: user,
            };
        } catch (err) {
            throw new NotAcceptableException('provided token is invalid.');
        }
    }


}
