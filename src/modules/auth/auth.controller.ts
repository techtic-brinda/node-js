import { Controller, Post, Body, Res, Inject, forwardRef, HttpStatus, BadRequestException, UseGuards, Request, NotFoundException, Get } from '@nestjs/common';
import { RegisterDTO } from 'src/shared/dto/register.dto';
import { SocialLoginDTO } from 'src/shared/dto/social-login.dto';
import { ForgotPasswordDTO } from 'src/shared/dto/forgotPassword.dto';
import {
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { LoginDTO } from 'src/shared/dto/login.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ResetPasswordDTO } from 'src/shared/dto/resetPassword.dto';
import { ChangePasswordDTO } from 'src/shared/dto/changePassword.dto';
import { OtpDTO } from 'src/shared/dto/otp.dto';
import { ResetOtpDTO } from 'src/shared/dto/resetOtp.dto';
import * as admin from 'firebase-admin';
import { FirebaseVerificationDTO } from 'src/shared/dto/firebase-verification.dto';
import { UserService } from '../../shared/services/user/user.service';

@Controller('api/auth')
export class AuthController {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) { }

  @Post('register')
  @ApiOkResponse({ description: 'Successfully registered' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async register(
    @Body() RegisterPayload: RegisterDTO,
    @Res() res: Response,
  ): Promise<any> {
    try {
      return await this.userService
        .create(RegisterPayload, 'register')
        .then(async user => {
          if (!user) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
              message:
                'Something went wrong during register, please try again later',
            });
          } else {
            return res.status(HttpStatus.OK).json({
              status: 200,
              message: "User registration successfully.",
            });
          }
        });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post('verify-otp')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async verifyOtp(@Body() payload: OtpDTO, @Res() response: Response): Promise<any> {

    return await this.userService.verifyOTP(payload.phone_number, payload.otp).then(async user => {
      if (!user) {
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'User Not Found',
        });
      } else {
        const token = await this.authService.createTokenByPhone(user);
        return response.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          data: Object.assign(token, { user: user }),
        });
      }
    })
      .catch((error: any) => {
        throw new BadRequestException(error);
      });
  }

  @Post('login')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async login(@Body() payload: LoginDTO, @Res() res: Response): Promise<any> {
    return await this.authService.validateUser(payload).then(async user => {
      if (!user) {
        if(user == 0){
          return res.status(HttpStatus.BAD_REQUEST).json({
            status: 401,
            message: 'User is not verified or active. Please try again.',
          });
        }else{
          return res.status(HttpStatus.BAD_REQUEST).json({
            status: 401,
            message: 'Invalid email or password. Please try again.',
          });
        }
      } else {
        const token = await this.authService.createToken(user);
        return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          data: Object.assign(token, { user: user }),
        });
      }

    });
  }

  @Post('login-with-otp')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async loginWithOtp(@Body() payload: LoginDTO, @Res() res: Response): Promise<any> {
    return await this.authService.validateUser(payload).then(async user => {
      if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 401,
          message: 'Invalid email or password. Please try again.',
        });
      } else {
        const token = await this.authService.createToken(user);
        return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          data: Object.assign(token, { user: user }),
        });
      }
    });
  }

  @Post('firebase-verification')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async firebaseVerification(@Body() payload: FirebaseVerificationDTO, @Res() res: Response): Promise<any> {
    return await admin.auth().verifyIdToken(payload.firebase_token)
      .then(async (decodedToken) => {
        const user = await this.userService.findByPhone(decodedToken.phone_number);
        if (user) {
          if (user.status == 'inactive') {
            return res.status(HttpStatus.BAD_REQUEST).json({
              message: 'Your account is not active so please contact to administrator.',
            });
          }
          await this.userService.verifiedUser(user);
          await this.userService.createDeviceToken({
            user_id: user.id,
            device_token: payload.device_token,
            device_type: payload.device_type,
          });
          const token = await this.authService.createTokenByPhone(user);
          return res.status(HttpStatus.OK).json({
            status: 200,
            data: Object.assign(token, { user: user }),
          });
        } else {
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'User not found.',
          });
        }
      }).catch(function (error) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 401,
          message: error,
        });
      });
  }

  @Post('social-login')
  @ApiOkResponse({ description: 'Successfully verified' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async socialLogin(
    @Body() SocialLoginPayload: SocialLoginDTO,
    @Res() res: Response,
  ): Promise<any> {
    try {
      let request = SocialLoginPayload;
      let userData: any;
      if (request['social_login_type'] && SocialLoginPayload['social_login_type'] == 'appleId') {
        userData = await this.userService.findOne({ apple_id: request.social_id });
      } else {
        userData = await this.userService.findOne({ email: request.email });
      }

      if (userData && userData.id) {
        request.id = userData.id;
      }
      return await this.userService
        .create(request)
        .then(async user => {
          if (!user) {
            if (
              SocialLoginPayload['social_login_type'] == 'google' ||
              SocialLoginPayload['social_login_type'] == 'facebook' ||
              SocialLoginPayload['social_login_type'] == 'appleId'
            ) {
              const token = this.authService.createToken(user);
              return res.status(HttpStatus.OK).json({
                status: HttpStatus.OK,
                data: Object.assign(token, { user: user }),
              });
            } else {
              return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Something went wrong, please try again later',
              });
            }
          } else {
            const token = this.authService.createToken(user);
            return res.status(HttpStatus.OK).json({
              status: HttpStatus.OK,
              data: Object.assign(token, { user: user }),
            });
          }
        });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @ApiBearerAuth()
  @Post('refresh-token')
  @ApiOkResponse({ description: 'Successful response' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async refreshToken(@Body() payload: any, @Res() res: Response): Promise<any> {
    if (!payload.token) {
      throw new NotFoundException('No token provided.');
    }

    let data = await this.authService.refreshToken(payload);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: {
        token: data.token,
        user: data.user,
      },
    });
  }

  @Post('forgot-password')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async forgotUserPassword(
    @Body() payload: ForgotPasswordDTO,
    @Res() response: Response,
  ): Promise<any> {
    try {
      return await this.userService
        .sendForgotPasswordEmail(payload)
        .then(response_message => {
          return response.status(HttpStatus.OK).json({
            status: HttpStatus.OK,
            message: response_message,
          });
        })
        .catch((error: any) => {
          throw new BadRequestException(error);
        });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post('send-otp')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async restUserOtp(
    @Body() payload: ResetOtpDTO,
    @Res() response: Response,
  ): Promise<any> {
    try {
      return await this.userService
        .resetOtp(payload.phone_number)
        .then(() => {
          return response.status(HttpStatus.OK).json({
            status: HttpStatus.OK,
            message: 'Otp sent successfully.',
          });
        })
        .catch((error: any) => {
          throw new BadRequestException(error);
        });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post('reset-password')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async restUserPassword(
    @Body() payload: ResetPasswordDTO,
    @Res() response: Response,
  ): Promise<any> {
    try {
      return await this.userService
        .resetPassword(payload)
        .then(() => {
          return response.status(HttpStatus.OK).json({
            status: HttpStatus.OK,
            message: 'Password reset successfully.',
          });
        })
        .catch((error: any) => {
          throw new BadRequestException(error);
        });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async changeUserPassword(
    @Request() request: any,
    @Body() payload: ChangePasswordDTO,
    @Res() response: Response,
  ): Promise<any> {
    try {
      return await this.userService.changePassword(request.user, payload)
        .then(() => {
          return response.status(HttpStatus.OK).json({
            status: HttpStatus.OK,
            message: 'Password changed successfully.',
          });
        })
        .catch((error: any) => {
          throw new BadRequestException(error);
        });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('logout')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async logout(@Request() request: any, @Res() res: Response): Promise<any> {
    try {
      let requestData = request.user;
      return await this.userService
        .logout(requestData)
        .then(() => {
          return res.status(HttpStatus.OK).json({
            status: HttpStatus.OK,
            message: "logout successfully.",
          });
        })
        .catch((error: any) => {
          throw new BadRequestException(error);
        });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

}
