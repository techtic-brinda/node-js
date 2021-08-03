import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class PaymentProcess {

    @ApiProperty()
    @IsNotEmpty()
    amount: String;

    @ApiProperty()
    promocode_id: String;

    @ApiProperty()
    @IsNotEmpty()
    location_id: String;

    @ApiProperty()
    evse_id: String;

    @ApiProperty()
    connector_id: String;

    @ApiProperty()
    vehicle_id: String;

    @ApiProperty()
    party_id: String;

    @ApiProperty()
    terrif_id: String;  
    
    @ApiProperty()
    vat_amount: String;

    @ApiProperty()
    flat_rate: String;

    @ApiProperty()
    target_charging_minutes: String;    

    @ApiProperty()
    @IsNotEmpty()
    connector_uid: String;    

    @ApiProperty()
    @IsNotEmpty()
    charger_type_id: String;
    
}
