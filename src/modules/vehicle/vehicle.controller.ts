import { Controller, UseGuards, Get, Res, Request, HttpStatus, UnprocessableEntityException, Post, Body, Delete, Param } from '@nestjs/common';
import { ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AddUpdateVehicleDTO } from 'src/shared/dto/addUpdateVehicle.dto';
import { VehicleService } from 'src/shared/services/vehicle/vehicle.service';

@Controller('api/vehicle')
export class VehicleController {
  constructor(
    private vehicleService: VehicleService,
  ) { }

  @Get('admin')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getAllVehicles(@Request() request: any, @Res() res: Response): Promise<any> {
    return await this.vehicleService.getAll(request.query)
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
  @Get('')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getUserVehicle(@Request() request: any, @Res() res: Response, @Param('id') id = null): Promise<any> {
    return await this.vehicleService.getUserVehicle(request, id)
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
    @Body() payload: AddUpdateVehicleDTO,
    @Res() res: Response,
  ): Promise<any> {
    payload.user_id = request.user ? request.user.id : '';
    return await this.vehicleService
      .createOrUpdate(payload)
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
  @Post('update-status')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async updateVehicleStatus(
    @Request() request: any,
    @Body() payload,
    @Res() res: Response,
  ): Promise<any> {
    return await this.vehicleService
      .updateVehicleStatus(payload)
      .then(async reasons => {
        return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          message: `Vehicle ${payload.status == 'active' ? 'enabled' : 'disabled'} successfully`,
        });
      })
      .catch((error: any) => {
        throw new UnprocessableEntityException(error);
      });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('edit-vehicle')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async editVehicle(
    @Request() request: any,
    @Body() payload: AddUpdateVehicleDTO,
    @Res() res: Response,
  ): Promise<any> {
    payload.user_id = request.user ? request.user.id : '';
    return await this.vehicleService
      .createOrUpdate(payload)
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
    return await this.vehicleService
      .delete(id)
      .then(async reasons => {
        return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          data: 'Vehicle deleted successfully',
        });
      })
      .catch((error: any) => {
        throw new UnprocessableEntityException(error);
      });
  }

  @Get('user-vehicles')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async vehicles(
    @Request() request: any,
    @Body() body: any,
    @Res() res: Response,
  ): Promise<any> {
    return await this.vehicleService
      .getAllVehicles(request.query)
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
}
