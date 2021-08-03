import { Controller, UseGuards, Get, Res, Request, HttpStatus, UnprocessableEntityException, Post, Body, Delete, Param } from '@nestjs/common';
import { ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { EvseService } from 'src/shared/services/evse/evse.service';
import { UserService } from 'src/shared/services/user/user.service';

@Controller('api/evse')
export class EvseController {
    constructor(
        private evseService: EvseService,
        private userService: UserService,
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('all')
    @ApiOkResponse({ description: 'Successfully authenticated' })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    async getAll(@Request() request: any, @Res() res: Response): Promise<any> {
        return await this.evseService.getAllData(request.query, request.user)
            .then(async output => {
                return res.status(HttpStatus.OK).json({
                    status: HttpStatus.OK,
                    data: output,
                });
            })
            .catch((error: any) => {
                throw new UnprocessableEntityException(error);
            });
    }

    @Get('')
    @ApiOkResponse({ description: 'Successfully authenticated' })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    async getLevel(@Request() request: any, @Res() res: Response): Promise<any> {
        return await this.evseService.getAll()
            .then(async output => {
                return res.status(HttpStatus.OK).json({
                    status: HttpStatus.OK,
                    data: output,
                });
            })
            .catch((error: any) => {
                throw new UnprocessableEntityException(error);
            });
    }


    @Get('getByLocation')
    @ApiOkResponse({ description: 'Successfully authenticated' })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    async getBylocation(@Request() request: any, @Res() res: Response): Promise<any> {
        return await this.evseService.getBylocation(request.query.locationId)
            .then(async output => {
                return res.status(HttpStatus.OK).json({
                    status: HttpStatus.OK,
                    data: output,
                });
            })
            .catch((error: any) => {
                throw new UnprocessableEntityException(error);
            });
    }

    @Get('getByParty')
    @ApiOkResponse({ description: 'Successfully authenticated' })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    async getByparty(@Request() request: any, @Res() res: Response): Promise<any> {
        return await this.evseService.getByparty(request.query.party_id)
            .then(async output => {
                return res.status(HttpStatus.OK).json({
                    status: HttpStatus.OK,
                    data: output,
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
    ): Promise<any> {
        return await this.evseService
            .createOrUpdate(body)
            .then(async reasons => {
                return res.status(HttpStatus.OK).json({
                    status: HttpStatus.OK,
                    data: reasons,
                    message: "EVSES Successfully added",
                });
            })
            .catch((error: any) => {
                throw new UnprocessableEntityException(error);
            });
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('/delete/:id')
    async delete(
        @Param('id') uid,
        @Res() res: Response
    ): Promise<any> {

        return await this.evseService
            .delete(uid)
            .then(async reasons => {
                return res.status(HttpStatus.OK).json({
                    status: HttpStatus.OK,
                    data: 'Evse deleted successfully',
                });
            })
            .catch((error: any) => {
                throw new UnprocessableEntityException(error);
            });
    }


    @UseGuards(AuthGuard('jwt'))
    @Get('/evse-detail/:id')
    async getEvse(
        @Param('id') uid,
        @Res() res: Response
    ): Promise<any> {

        return await this.evseService
            .getEvse(uid)
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


     @Get('/test')
    async test(@Res() res: Response): Promise<any> {
        return await this.userService.test();
       /*  var today = new Date();
        today.setHours(today.getHours() + 2);
        let d = {
            id: 2,
            user_id: 41,
            evse_id: 8,
            end_time: new Date(),
            type: 'occupancy'
        };

        return await this.evseService.createOrUpdateEvseLog(d)
            .then(async reasons => {
                return res.status(HttpStatus.OK).json({
                    status: HttpStatus.OK,
                    data: 'Evse deleted successfully',
                });
            })
            .catch((error: any) => {
                throw new UnprocessableEntityException(error);
            }); */
    }


}
