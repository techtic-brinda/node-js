import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LevelDTO {

    @ApiProperty()
    @IsNotEmpty()
    topic_id: number;
    
}
