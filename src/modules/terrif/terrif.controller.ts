import {
  Controller,
  UnprocessableEntityException,
  UseGuards,
  Get,
  Delete,
  Param,
  Request,
  Body,
  Res,
  HttpStatus,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { TerrifCost } from 'src/shared/dto/TerrifCost.dto';
import { TerrifService } from 'src/shared/services/terrif/terrif.service';
@Controller('api/tariffs')
export class TerrifController {
  constructor(private terrifService: TerrifService) { }

  @Get('admin')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getAllTransaction(
    @Request() request: any,
    @Res() res: Response,
  ): Promise<any> {
    return await this.terrifService
      .getAll(request.query)
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
    return await this.terrifService
      .getAllTerrif()
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

  @Get('all')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getAll(@Request() request: any, @Res() res: Response): Promise<any> {

    return await this.terrifService
      .getAll(request.query)
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
    return await this.terrifService
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

  @Get('details/:id')
  async findOne(@Param('id') id, @Res() res: Response): Promise<any> {
    return await this.terrifService
      .findOne({ id: id }, ['price_components', 'terrif_price'])
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
  @Post('cost')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async terrifCost(
    @Request() request: any,
    @Body() body: TerrifCost,
    @Res() res: Response,
  ): Promise<any> {
    return await this.terrifService
      .terrifCost(body)
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

  //@UseGuards(AuthGuard('jwt'))
  @Get('final-cost')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async generateFinalCost(
    @Request() request: any,
    @Body() body,
    @Res() res: Response,
  ): Promise<any> {
    body.evseLogId = 1;
    body.evseLogOccupancyId = 2;
    body.connector_id = 1;
    body.terrif_id = 1;
    body.transaction_id = 7;
    return await this.terrifService
      .terrifFinalCost(body)
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

    return await this.terrifService
      .delete(id)
      .then(async reasons => {
        return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          message: 'Terrif deleted successfully',
        });
      })
      .catch((error: any) => {
        throw new UnprocessableEntityException(error);
      });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':tariff_id')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getTerrifsDetails(
    @Request() request: any,
    @Res() res: Response,
    @Param('tariff_id') tariff_id,
  ): Promise<any> {
    if (tariff_id) {
      let obj = { tariff_id };
      return await this.terrifService
        .getTerrifsDetails(obj)
        .then(async output => {
          if (output) {
            return res.status(HttpStatus.OK).json({
              status: HttpStatus.OK,
              data: output,
            });
          } else {
            return res.status(HttpStatus.OK).json({
              status: HttpStatus.OK,
              data: null,
            });
          }
        })
        .catch((error: any) => {
          throw new UnprocessableEntityException(error);
        });
    } else {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        error: 'Please enter valid parameter',
      });
    }
  }

}
