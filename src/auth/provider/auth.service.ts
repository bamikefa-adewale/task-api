import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { GoogleAuthenticationProvider } from './google-authentication.provider';
import { RefreshTokenProvider } from './refresh-token.provider';
import { TokenBlacklistProvider } from './token-blacklist.provider';
import { GoogleTokenDto } from '../dto/google-token.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { REQUEST_USER_KEY } from '../constants/auth.constant';

@Injectable()
export class AuthService {

  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly googleAuthProvider: GoogleAuthenticationProvider,
    private readonly refreshTokenProvider: RefreshTokenProvider,
    private readonly tokenBlacklistProvider: TokenBlacklistProvider,
  ) {}

  async signUpWithGoogle(dto: GoogleTokenDto) {
    const user = await this.googleAuthProvider.authenticate(dto);
    return user;
  }

  async refreshTokens(dto: RefreshTokenDto) {
    const tokens = await this.refreshTokenProvider.refreshTokens(
      dto.refreshToken,
    );
    return {
      success: true,
      message: 'Tokens refreshed successfully',
      data: tokens,
    };
  }



  // method to logout
  async logout(request: Request) {
    try {
      this.logger.log('Starting logout process...');
      
      // Extract access token from Authorization header
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        this.logger.error('No valid Bearer token provided');
        throw new UnauthorizedException('No valid Bearer token provided');
      }

      const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
      this.logger.log('Access token extracted successfully');

      // Get user data from the request (set by AccessTokenGuard)
      const userData = request[REQUEST_USER_KEY];
      if (!userData) {
        this.logger.error('User data not found in request');
        throw new UnauthorizedException('User data not found in request');
      }

      const { sub: userId, sessionId } = userData;
      this.logger.log(`User data found - userId: ${userId}, sessionId: ${sessionId}`);

      // Blacklist the access token
      this.logger.log('Blacklisting access token...');
      await this.tokenBlacklistProvider.blacklistAccessToken(accessToken, userId);
      this.logger.log('Access token blacklisted successfully');

      // Blacklist the entire session to invalidate all tokens for this session
      if (sessionId) {
        this.logger.log('Blacklisting session...');
        await this.tokenBlacklistProvider.blacklistSession(sessionId, userId);
        this.logger.log('Session blacklisted successfully');
      } else {
        this.logger.warn('No sessionId found, skipping session blacklist');
      }

      this.logger.log(`User ${userId} logged out successfully. All tokens invalidated.`);

      return {
        success: true,
        message: 'Logout successful. All tokens have been invalidated.',
        data: {
          userId,
          sessionId,
          logoutTime: new Date().toISOString(),
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Logout failed:', error.message);
      this.logger.error('Error details:', error);
      throw new UnauthorizedException(`Logout failed: ${error.message}`);
    }
  }
}
