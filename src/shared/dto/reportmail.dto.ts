import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Validate } from 'class-validator';
import { EmailMatch } from '../validations/EmailMatchValidator';

export class ReportMail {

    /**
    * Email parameter
    */

   @ApiProperty()
   @IsNotEmpty()
   comment: string;

   @ApiProperty()
   @IsNotEmpty()
   type: string;
}
