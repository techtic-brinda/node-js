import { Controller, UseGuards, Get, Res, Request, HttpStatus, UnprocessableEntityException, Post, Body} from '@nestjs/common';
import { ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { NotificationService } from 'src/shared/services/notification/notification.service';
import { lorem } from "faker";

@Controller('api/notification')
export class NotificationController {
    constructor(
        private NotificationService: NotificationService,
    ) { }
    @UseGuards(AuthGuard('jwt'))
    @Get('')
    @ApiOkResponse({ description: 'Successfully authenticated' })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    async getLevel(@Request() request: any, @Res() res: Response): Promise<any> {
        let user_id = request.user ? request.user.id : '';
        return await this.NotificationService.get(user_id)
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
