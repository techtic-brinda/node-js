import { Controller, UnprocessableEntityException, UseGuards, Get, Delete, Param, Request, Body, Res, HttpStatus, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from '../auth/auth.service';
import { ReportMail } from 'src/shared/dto/reportmail.dto';
import { QRCodeScanner } from 'src/shared/dto/QRCodeScanner.dto';
import { PaymentProcess } from 'src/shared/dto/paymentProcess.dto';
import { UserService } from 'src/shared/services/user/user.service';
import { StationsService } from '../stations/stations.service';

const Razorpay = require('razorpay')

@Controller('api/user')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private stationsService: StationsService,

  ) { }



  // @UseGuards(AuthGuard('jwt'))
  // @Get('settings')
  // @ApiOkResponse({ description: 'Successfully authenticated' })
  // @ApiBadRequestResponse({ description: 'Bad Request' })
  // async getSettings(
  //   @Res() res: Response,
  // ): Promise<any> {
  //   return await this.userService
  //     .getSettings()
  //     .then(async reasons => {
  //       return res.status(HttpStatus.OK).json({
  //         status: HttpStatus.OK,
  //         data: reasons,
  //       });
  //     })
  //     .catch((error: any) => {
  //       throw new UnprocessableEntityException(error);
  //     });
  // }

  @UseGuards(AuthGuard('jwt'))
  @Post('report-mail')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async reportUserMail(
    @Body() payload: any,
    @Res() response: Response,
    @Request() req
  ): Promise<any> {
    payload.user = req.user;
    return await this.userService
      .reportUserMail(payload)
      .then(async response_message => {
        return response.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          message: response_message,
        });
      })
      .catch((error: any) => {
        throw new UnprocessableEntityException(error);
      });
  }


  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getUser(
    @Request() request: any,
    @Body() body: any,
    @Res() res: Response,
  ): Promise<any> {
    return await this.userService
      .findOne({ id: request.user.id })
      .then(async reasons => {
        return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          data: reasons,
        });
      })
      .catch((error: any) => {
        throw new UnprocessableEntityException(error);
      });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async updateUser(
    @Request() request: any,
    @Body() body: any,
    @Res() res: Response,
    @Request() req,
  ): Promise<any> {
    request.body.id = req.user ? req.user.id : '';
    return await this.userService
      .create(request.body)
      .then(async reasons => {
        return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          data: reasons,
        });
      })
      .catch((error: any) => {
        //throw new UnprocessableEntityException(error);
      });
  }


  @UseGuards(AuthGuard('jwt'))
  @Post('update-admin-profile')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async updateAdminProfile(
    @Body() body: any,
    @Res() res: Response,
    @Body() payload: any,
  ): Promise<any> {
    return await this.userService
      .updateAdminProfile(body)
      .then(async reasons => {
        if (reasons.isChangeEmail) {
          const tokenData = this.authService.createToken(reasons);
          reasons.tokenData = tokenData.token;
        }
        return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          data: reasons,
        });
      })
      .catch((error: any) => {
        throw new UnprocessableEntityException(error);
      });
  }


  @UseGuards(AuthGuard('jwt'))
  @Post('update-user')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async updateAdminUser(
    @Request() request: any,
    @Body() body: any,
    @Res() res: Response,
  ): Promise<any> {
    let type = body.type ? body.type : null;
    return await this.userService
      .create(body, type)
      .then(async reasons => {
        return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          data: reasons,
        });
      })
      .catch((error: any) => {
        throw new UnprocessableEntityException(error);
      });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('profile-pic')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: 'public/profile',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )

  async uploadFile(
    @UploadedFile() file,
    @Request() request: any,
    @Res() res: Response,
  ) {

    let filePath = file.destination + '/' + file.filename;
    return await this.userService
      .create({
        id: request.user.id,
        profile_pic_multer: filePath,
      })
      .then(async reasons => {
        return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          data: reasons,
        });
      })
      .catch((error: any) => {
        throw new UnprocessableEntityException(error);
      });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getUsers(
    @Request() request: any,
    @Body() body: any,
    @Res() res: Response,
  ): Promise<any> {
    return await this.userService
      .get(request.query)
      .then(async reasons => {
        return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          data: reasons,
        });
      })
      .catch((error: any) => {
        throw new UnprocessableEntityException(error);
      });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('owner')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getOwners(
    //@Request() request: any,
    @Body() body: any,
    @Res() res: Response,
  ): Promise<any> {
    return await this.userService
      .getOwner()
      .then(async reasons => {
        return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          data: reasons,
        });
      })
      .catch((error: any) => {
        throw new UnprocessableEntityException(error);
      });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('analytics-data')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getAnalyticsData(
    @Body() body: any,
    @Res() res: Response,
    @Request() request: any,
  ): Promise<any> {
    return await this.userService
      .getAnalyticsData(request, request.user)
      .then(async reasons => {
        return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          data: reasons,
        });
      })
      .catch((error: any) => {
        throw new UnprocessableEntityException(error);
      });
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/delete/:id')
  async delete(
    @Param('id') id,
    @Res() res: Response
  ): Promise<any> {

    return await this.userService
      .delete(id)
      .then(async reasons => {
        return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          data: 'User deleted successfully',
        });
      })
      .catch((error: any) => {
        throw new UnprocessableEntityException(error);
      });
  }

  @Get(':id')
  async findOne(
    @Param('id') id,
    @Res() res: Response
  ): Promise<any> {
    return await this.userService
      .findOne({ id: id }, ['userdocument'])
      .then(async data => {
        return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          data: data,
        });
      })
      .catch((error: any) => {
        throw new UnprocessableEntityException(error);
      });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('owner')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async createUser(
    @Request() request: any,
    @Body() body: any,
    @Res() res: Response,
  ): Promise<any> {
    return await this.userService
      .createOrUpdateOwner(body)
      .then(async reasons => {
        return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          data: reasons,
        });
      })
      .catch((error: any) => {
        throw new UnprocessableEntityException(error);
      });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('payment-token')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getPaymentToken(
    @Request() request: any,
    @Body() body: any,
    @Res() res: Response,
    @Request() req
  ): Promise<any> {
    request.body.userId = req.user ? req.user.id : '';
    return await this.userService
      .getPaymentToken(request)
      .then(async reasons => {
        return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          data: reasons,
        });
      })
      .catch((error: any) => {
        throw new UnprocessableEntityException(error);
      });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('payment-capture')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async paymentCaptured(
    @Request() request: any,
    @Body() body: any,
    @Res() res: Response,
    @Request() req
  ): Promise<any> {
    request.body.user_id = req.user ? req.user.id : '';
    return await this.userService
      .paymentCaptured(request.body)
      .then(async reasons => {
        return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          message: "Money successfully added to wallet.",
        });
      })
      .catch((error: any) => {
        throw new UnprocessableEntityException(error);
      });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('payment-process')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async paymentProcess(
    @Request() request: any,
    @Body() body: PaymentProcess,
    @Res() res: Response,
    @Request() req
  ): Promise<any> {
    request.body.user_id = req.user ? req.user.id : '';
   // request.body.user_id = 51;
    return await this.stationsService
      .paymentProcess(request.body)
      .then(async reasons => {
        return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          data: reasons,
        });
      })
      .catch((error: any) => {
        throw new UnprocessableEntityException(error);
      });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('last-payment-process')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async lastPaymentProcess(
    @Request() request: any,
    @Body() body: any,
    @Res() res: Response,
    @Request() req
  ): Promise<any> {
    request.body.user_id = req.user ? req.user.id : '';
    return await this.userService
      .lastPaymentProcess(request.body)
      .then(async reasons => {
        return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          data: reasons,
        });
      })
      .catch((error: any) => {
        throw new UnprocessableEntityException(error);
      });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('qrcode')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async qrCodeScanner(
    @Request() request: any,
    @Body() body: QRCodeScanner,
    @Res() res: Response,
    @Request() req
  ): Promise<any> {
    body.user_id = req.user ? req.user.id : '';
    return await this.userService
      .qrCodeScanner(body)
      .then(async reasons => {
        if (reasons.status == 200) {
          return res.status(HttpStatus.OK).json(reasons);
        } else {
          return res.status(HttpStatus.BAD_REQUEST).json(reasons);
        }
      })
      .catch((error: any) => {
        throw new UnprocessableEntityException(error);
      });
  }

}
