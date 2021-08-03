import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();
        const status = exception.getStatus();
        let message = exception.message.message;        
        
        if (exception.message.error == "Bad Request"){
            message = [];

            exception.message.message.forEach(element => {
                let m = Object.values(element.constraints);
                m.forEach(e=>{
                    message.push(e);
                })
            });
        }
        if(status && exception.message.error == "Unauthorized"){
            message = exception.message.error;
        }
        response
            .status(status)
            .json({
                message: message,
                status: status
            });
    }
}
