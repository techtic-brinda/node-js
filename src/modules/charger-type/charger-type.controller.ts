import { Controller, UseGuards, Get, Res, Request, HttpStatus, UnprocessableEntityException, Post, Body, Delete, Param } from '@nestjs/common';
import { ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ChargerTypeService } from 'src/shared/services/charger-type/chargerType.service';

@Controller('api/charger-type')
export class ChargerTypeController {
    constructor(
        private chargerTypeService: ChargerTypeService,
    ) { }

    @Get('all')
    @ApiOkResponse({ description: 'Successfully authenticated' })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    async getAll(@Request() request: any, @Res() res: Response): Promise<any> {
        return await this.chargerTypeService.getAllData(request.query)
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
    async getVehicleModel(@Request() request: any, @Res() res: Response): Promise<any> {
        return await this.chargerTypeService.getChargerType()
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

    @Get('standard')
    @ApiOkResponse({ description: 'Successfully authenticated' })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    async getStandardModel(@Request() request: any, @Res() res: Response): Promise<any> {
        return await this.chargerTypeService.getStandard()
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
        return await this.chargerTypeService
            .createOrUpdate(body)
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

        return await this.chargerTypeService
            .delete(id)
            .then(async reasons => {
                return res.status(HttpStatus.OK).json({
                    status: HttpStatus.OK,
                    data: 'Charge type deleted successfully',
                });
            })
            .catch((error: any) => {
                throw new UnprocessableEntityException(error);
            });
    }
}
