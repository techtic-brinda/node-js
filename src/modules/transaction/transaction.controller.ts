import { Controller, UnprocessableEntityException, UseGuards, Get, Param, Request, Res, HttpStatus, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { TransactionService } from 'src/shared/services/transaction/transaction.service';

@Controller('api/transaction')
export class TransactionController {
  constructor(
    private transactionService: TransactionService,

  ) { }

  @Get('admin')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getAllTransaction(@Request() request: any, @Res() res: Response): Promise<any> {
    return await this.transactionService.getAll(request.query)
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

  @Get('cpo-invoices')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getAllCpoInvoice(@Request() request: any, @Res() res: Response): Promise<any> {
    return await this.transactionService.getAll(request.query)
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
  @Get('wallet')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getWalletTransaction(@Request() request: any, @Res() res: Response): Promise<any> {
    return await this.transactionService.getWalletTransaction(request.user.id)
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
  @Get('by-vehicle')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async vehicleTransaction(@Request() request: any, @Res() res: Response): Promise<any> {
    return await this.transactionService.vehicleTransaction(request.query.vehicle_id)
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
  async getUserTransaction(@Request() request: any, @Res() res: Response, @Param('id') id = null): Promise<any> {
    return await this.transactionService.getUserTransaction(request, id)
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
  @Get('owner-transaction')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getOwnerTransaction(@Request() request: any, @Res() res: Response): Promise<any> {
    return await this.transactionService.getOwnerTransaction(request.query, request.user)
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
  @Get('transaction-details')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async transactionDetails(@Request() request: any, @Res() res: Response): Promise<any> {
    return await this.transactionService.transactionDetails(request.query.id)
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
  @Get('transaction-pdf')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async transactionPdf(@Request() request: any, @Res() res: Response): Promise<any> {
    return await this.transactionService.transactionPdf(request.query.id, request.user)
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
  @Get('generate-invoice')
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async generateInvoice(@Request() request: any, @Res() res: Response): Promise<any> {
    return await this.transactionService.generateInvoice(request.query, request.user)
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
}
