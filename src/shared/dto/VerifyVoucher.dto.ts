import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class VerifyVoucher {

    @ApiProperty()
    @IsNotEmpty()
    voucher_code: string;

    @ApiProperty()
    party_id: string;

    @ApiProperty()
    location_id: string;

    @ApiProperty()
    user_id: string;

    @ApiProperty()
    amount: string;
    
    
}
