import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Validate } from 'class-validator';
import { EmailMatch } from '../validations/EmailMatchValidator';

export class ForgotPasswordDTO {

    /**
    * Email parameter
    */
    @ApiProperty({
        required: true
    })
    @IsNotEmpty({
        message: "The email should not be empty"
    })
    @Validate(EmailMatch)
    email: string;

    type:string;
}
