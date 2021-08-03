import { Controller, UseGuards, Get, Res, Request, HttpStatus, UnprocessableEntityException, Post, Body, Delete, Param } from '@nestjs/common';
import { ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { LocationsService } from 'src/shared/services/locations/locations.service';

@Controller('api/locations')
export class LocationsController {
    constructor(
        private locationsService: LocationsService,
    ) { }

    @Get('all')
    @ApiOkResponse({ description: 'Successfully authenticated' })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    async getAll(@Request() request: any, @Res() res: Response): Promise<any> {
        return await this.locationsService.getAllData(request.query)
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
        return await this.locationsService.getAll(request.query)
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

    @Get('details/:id')
    async findOne(
        @Param('id') id,
        @Res() res: Response
    ): Promise<any> {
        return await this.locationsService
            .findOne({ id: id })
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
    @Post('')
    @ApiOkResponse({ description: 'Successfully authenticated' })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    async updateUser(
        @Request() request: any,
        @Body() body: any,
        @Res() res: Response,
    ): Promise<any> {
        return await this.locationsService
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

        return await this.locationsService
            .delete(id)
            .then(async reasons => {
                return res.status(HttpStatus.OK).json({
                    status: HttpStatus.OK,
                    data: 'Locations deleted successfully',
                });
            })
            .catch((error: any) => {
                throw new UnprocessableEntityException(error);
            });
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('near-locations')
    @ApiOkResponse({ description: 'Successfully authenticated' })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    async getNearLocation(
        @Request() request: any,
        @Res() res: Response
    ): Promise<any> {
        return await this.locationsService.getNearLocations(request.user.id, request.query)
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
    @Get('show')
    @ApiOkResponse({ description: 'Successfully authenticated' })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    async getLocationById(
        @Request() request: any,
        @Res() res: Response,
    ): Promise<any> {

        return await this.locationsService.getLocationById(request.query.location_id)
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
    @Get('published-location')
    @ApiOkResponse({ description: 'Successfully authenticated' })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    async getPublishedLocation(
        @Request() request: any,
        @Res() res: Response,
    ): Promise<any> {
        return await this.locationsService.getPublishedLocation()
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

    @Get('machine-log')
    async machineLog(
        @Param('id') id,
        @Request() request: any,
        @Res() res: Response
    ): Promise<any> {
        return await this.locationsService
            .machineLog(id, request.query)
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

}
