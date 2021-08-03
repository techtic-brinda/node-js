import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class QRCodeScanner {

    @ApiProperty()
    location_id: Number;

    @ApiProperty()
    evse_uid: Number;

    @ApiProperty()
    @IsNotEmpty()
    physical_reference: string;

    @ApiProperty()
    user_id: string;
    
}
