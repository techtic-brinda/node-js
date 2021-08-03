import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class ResetOtpDTO {

    @ApiProperty()
    @IsNotEmpty()
    phone_number: string;
   
}
