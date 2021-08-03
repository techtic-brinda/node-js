import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, Validate } from 'class-validator';
import { IsUserAlreadyExist, IsUserAlreadyPhoneNumber } from '../../shared/validations/IsUserAlreadyExistValidator';

export class RegisterDTO {
  id: string;
  @ApiProperty({
    required: false,
  })
  @IsEmail()
  @Validate(IsUserAlreadyExist)
  @IsNotEmpty({
    message: 'The email should not be empty',
  })
  email: string;

  @ApiProperty({
    required: false,
  })
  @Validate(IsUserAlreadyPhoneNumber)
  @IsNotEmpty({
    message: 'The Phone number should not be empty',
  })
  phone_number: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty({
    message: 'The name should not be empty',
  })
  name: string;

  @ApiProperty({
    required: true,
  })

  // @IsNotEmpty({
  //   message: 'The password should not be empty',
  // })
  // @MinLength(8)
  // password: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  device_token: string;

  @ApiProperty()
  device_type: string;

  @ApiProperty()
  firebase_token: string;

  @ApiProperty()
  type: string;
}
