import {
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  Res,
  UnprocessableEntityException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse } from '@nestjs/swagger';
import { CreateOrUpdateStationDto } from './dto/create-update-station.dto';
import { GetStationsFilterDto } from './dto/get-station-filter.dto';
import { StationOperationDto } from './dto/station-operation-dto';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { Evse } from '../entity/evse.entity';
import { MachineService } from 'src/shared/services/machine/machine.service';
import { StationsService } from './stations.service';

@Controller('api/stations')
export class StationsController {
  private logger = new Logger('StationsController');
  constructor(
    @Inject(forwardRef(() => StationsService))
    private readonly stationsService: StationsService,

    @Inject(forwardRef(() => MachineService))
    private readonly machineService: MachineService,

  ) {}

  @Get('all')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getAll(@Request() request: any, @Res() res: Response): Promise<any> {
    return await this.stationsService
      .getAllData(request.query)
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
     return await this.stationsService
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
  async delete(@Param('id') id, @Res() res: Response): Promise<any> {
    return await this.stationsService
      .delete(id)
      .then(async reasons => {
        return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          data: 'Station deleted successfully',
        });
      })
      .catch((error: any) => {
        throw new UnprocessableEntityException(error);
      });
  }

  @Get()
  @UsePipes(ValidationPipe)
  getStations(@Query() filterDto: GetStationsFilterDto){
    return this.stationsService.getStations(filterDto);
  }

  @Get('/:id')
  getStationById(@Param('id', ParseIntPipe) id: string){
    return this.stationsService.getStationById(id);
  }

  // @Post()
  // @UsePipes(new ValidationPipe({ skipMissingProperties: true }))
  // createStation(
  //   @Body() createStationDto: CreateOrUpdateStationDto,
  // ): Promise<Station> {
  //   this.logger.log(
  //     `Creating new station. Data: ${JSON.stringify(createStationDto)}`,
  //   );
  //   return this.stationsService.createStation(createStationDto);
  // }

  @Put('/:id')
  updateStation(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateStationDto: CreateOrUpdateStationDto,
  ) {
    return this.stationsService.updateStation(id, updateStationDto);
  }

  @Post('/:id/operations/:operation')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ skipMissingProperties: true }))
  async createStationOperation(
    @Param('id', ParseIntPipe) id: string,
    @Param('operation') operationName: string,
    @Body() stationOperationDto: StationOperationDto,
    @Res() res: Response
  ) {
    console.log('createStationOperation');
    let r = await this.stationsService.sendStationOperationRequest(
      id,
      operationName,
      stationOperationDto,
    );
    return res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        data: r.response[2]
    });
  }

  @Post('log')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async saveMachineLog(@Request() request: any,  @Body() body: any,@Res() res: Response): Promise<any> {
        console.log(body.evse_id,'body.evse_id');
        body.evse_id =  (body.evse_id) ? body.evse_id.replace('/','') : null;
        console.log(body,'evse');

         return await this.machineService
        .saveMachineLog(body)
        .then(async response => {
            return res.status(HttpStatus.OK).json({
                status: HttpStatus.OK,
                data: JSON.parse(response.response),
            });
        })
        .catch((error: any) => {
            throw new UnprocessableEntityException(error);
        });
  }

  @Post('transation-log')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async saveTransationLog(@Request() request: any,  @Body() body: any,@Res() res: Response): Promise<any> {
        // body.evse_id = (body.evse_id) ? body.evse_id.replaceAll("\\\\", "") : null;
        console.log(body.evse_id,'body.evse_id');
        body.evse_id =  (body.evse_id) ? body.evse_id.replace('/','') : null;
        console.log(body,'evse');

        return await this.machineService
        .saveTransationLog(body)
        .then(async response => {
            return res.status(HttpStatus.OK).json({
                status: HttpStatus.OK,
                data: response,
            });
        })
        .catch((error: any) => {
            throw new UnprocessableEntityException(error);
        });
  }
}
