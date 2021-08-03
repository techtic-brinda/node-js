import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class OtpDTO {

    @ApiProperty()
    @IsNotEmpty()
    phone_number: string;

    @ApiProperty()
    @IsNotEmpty()
    @MinLength(4)
    otp: string;
   
}
