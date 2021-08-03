import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class AddUpdateVehicleDTO {
    @ApiProperty()
    @IsNotEmpty()
    maker_id: number;

    @ApiProperty()
    @IsNotEmpty()
    model_id: number;

    @ApiProperty()
    year: string;

    @ApiProperty()
    charger_type_id: string;

    @ApiProperty()
    reg_no: string;

    @ApiProperty()
    status: string;

    @ApiProperty()
    user_id: number;
}
