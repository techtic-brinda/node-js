import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDTO {

    @ApiProperty()
    @IsNotEmpty()
    @MinLength(6)
    old_password: string;

    @ApiProperty()
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}
