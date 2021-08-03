import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class SocialLoginDTO {
         id: string;
         @ApiProperty({
           required: false,
         })
        //  @IsNotEmpty({
        //    message: 'The email should not be empty',
        //  })
         email: string;

        //  @ApiProperty({
        //    required: true,
        //  })
        //  @IsNotEmpty({
        //    message: 'The first name should not be empty',
        //  })
         name: string;

         @ApiProperty({
           required: true,
         })
         social_id: string;

         @ApiProperty({
           required: true,
         })
         social_login_type: string;

         @ApiProperty({
           required: true,
         })
         user_type: string;
}
