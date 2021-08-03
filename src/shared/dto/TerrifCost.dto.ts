import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class TerrifCost {

    @ApiProperty()
    @IsNotEmpty()
    terrif_id: number;

    @ApiProperty()
    @IsNotEmpty()
    isTime: boolean;

    @ApiProperty()    
    time: string;

}
