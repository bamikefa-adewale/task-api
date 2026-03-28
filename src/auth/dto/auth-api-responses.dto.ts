import { ApiProperty } from '@nestjs/swagger';

export class GoogleAuthUserDataDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ format: 'uuid' })
  sessionId: string;

  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'email' })
  email: string;

  @ApiProperty({ nullable: true })
  fullName: string | null;

  @ApiProperty({ nullable: true })
  firstName: string | null;

  @ApiProperty({ nullable: true })
  lastName: string | null;

  @ApiProperty({ nullable: true })
  profilePicture: string | null;

  @ApiProperty({ example: 'google' })
  authProvider: string;

  @ApiProperty()
  isEmailVerified: boolean;
}

export class GoogleAuthSuccessDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Authentication successful' })
  message: string;

  @ApiProperty({ type: GoogleAuthUserDataDto })
  data: GoogleAuthUserDataDto;
}

export class TokensPairDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}

/** Inner payload returned by AuthService.refreshTokens (nested under controller envelope). */
export class RefreshTokensInnerDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: TokensPairDto })
  data: TokensPairDto;
}

export class RefreshTokensSuccessDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Tokens refreshed successfully' })
  message: string;

  @ApiProperty({ type: RefreshTokensInnerDto })
  data: RefreshTokensInnerDto;
}

export class LogoutDetailsDto {
  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty({ format: 'uuid', nullable: true })
  sessionId: string | null;

  @ApiProperty({ format: 'date-time' })
  logoutTime: string;
}

export class LogoutInnerDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    example: 'Logout successful. All tokens have been invalidated.',
  })
  message: string;

  @ApiProperty({ type: LogoutDetailsDto })
  data: LogoutDetailsDto;
}

export class LogoutSuccessDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Logout successful' })
  message: string;

  @ApiProperty({ type: LogoutInnerDto })
  data: LogoutInnerDto;
}
