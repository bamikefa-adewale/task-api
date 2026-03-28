import { Body, Controller, Post, Logger, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { HttpExceptionResponseDto } from 'src/common/dto/http-exception-response.dto';
import type { Request } from 'express';
import { GoogleAuthenticationProvider } from './provider/google-authentication.provider';
import { AuthService } from './provider/auth.service';
import { AuthType } from './enums/auth-types.enum';
import { Auth } from './decorators/auth.decorators';
import {
  GoogleAuthSuccessDto,
  LogoutSuccessDto,
  RefreshTokensSuccessDto,
} from './dto/auth-api-responses.dto';
import { GoogleTokenDto } from './dto/google-token.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Auth(AuthType.None)
@ApiTags('Auth')
@Controller('auth')
export class GoogleAuthenticationController {
  private readonly logger = new Logger(GoogleAuthenticationController.name);

  constructor(
    private readonly googleAuthService: GoogleAuthenticationProvider,
    private readonly authService: AuthService,
  ) {}

  @Auth(AuthType.None)
  @Post('google')
  @ApiOperation({
    summary: 'Authenticate user with Google ID token',
    description:
      'Exchanges a Google ID token for application access and refresh tokens.',
  })
  @ApiBody({ type: GoogleTokenDto })
  @ApiCreatedResponse({
    description: 'Authentication successful; returns tokens and user profile',
    type: GoogleAuthSuccessDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid Google token payload',
    type: HttpExceptionResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Google token verification failed',
    type: HttpExceptionResponseDto,
  })
  public async authenticateWithGoogle(@Body() dto: GoogleTokenDto) {
    try {
      const data = await this.googleAuthService.authenticate(dto);
      this.logger.log('User data:', JSON.stringify(data, null, 2));
      return {
        success: true,
        message: 'Authentication successful',
        data: data,
      };
    } catch (error) {
      this.logger.error('Google authentication failed:', error.message);
      throw error;
    }
  }

  @Auth(AuthType.None)
  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generates a new access token and refresh token pair.',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({
    description:
      'New tokens issued. Response nests the service payload under `data` (includes inner success envelope and token pair).',
    type: RefreshTokensSuccessDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed (e.g. missing refreshToken)',
    type: HttpExceptionResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token is invalid, expired, or revoked',
    type: HttpExceptionResponseDto,
  })
  public async refreshTokens(@Body() dto: RefreshTokenDto) {
    try {
      const data = await this.authService.refreshTokens(dto);
      this.logger.log('Tokens refreshed successfully');
      return {
        success: true,
        message: 'Tokens refreshed successfully',
        data: data,
      };
    } catch (error) {
      this.logger.error('Token refresh failed:', error.message);
      throw error;
    }
  }

  @Auth(AuthType.Bearer)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout current user',
    description:
      'Invalidates the active session associated with the bearer access token.',
  })
  @ApiOkResponse({
    description:
      'Session invalidated. Outer envelope wraps the logout service result under `data`.',
    type: LogoutSuccessDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing bearer token, invalid token, or logout failed',
    type: HttpExceptionResponseDto,
  })
  public async logout(@Req() request: Request) {
    try {
      const data = await this.authService.logout(request);
      this.logger.log('User logged out successfully');
      return {
        success: true,
        message: 'Logout successful',
        data: data,
      };
    } catch (error) {
      this.logger.error('Logout failed:', error.message);
      throw error;
    }
  }
}
