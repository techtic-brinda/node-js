import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UserLogDTO {

    @ApiProperty()
    @IsNotEmpty()
    drawer_id: number;
    
}
