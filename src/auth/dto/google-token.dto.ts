import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleTokenDto {
  @ApiProperty({
    description: 'Google ID token returned by Google Sign-In',
    example:
      'eyJhbGciOiJSUzI1NiIsImtpZCI6IjkyN2I4ZmI2N2JiYWQ3NzQ0NWU1ZmVhNGM3MWFhOTg0NmQ3ZGRkMDEiLCJ0eXAiOiJKV1QifQ...',
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}
