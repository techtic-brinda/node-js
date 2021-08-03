import { ApiProperty } from '@nestjs/swagger';

export class FirebaseVerificationDTO {

  @ApiProperty()
  phone_number: string;

  @ApiProperty()
  device_token: string;

  @ApiProperty()
  device_type: string;

  @ApiProperty({
    required: true,
  })
  firebase_token: string;
}
