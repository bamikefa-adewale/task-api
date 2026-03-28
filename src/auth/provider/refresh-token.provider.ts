import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import jwtConfig from 'src/config/jwt.config';
import { GenerateTokenProvider } from './generate-token.provider';
import { UserService } from 'src/user/provider/user.service';
import { ActiveUserData } from 'src/interfaces/active-user.interface';
import { TokenBlacklistProvider } from './token-blacklist.provider';

@Injectable()
export class RefreshTokenProvider {
  constructor(
    private readonly jwtService: JwtService,
    private readonly generateTokenProvider: GenerateTokenProvider,
    private readonly userService: UserService,
    private readonly tokenBlacklistProvider: TokenBlacklistProvider,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}



  // method to refresh tokens
  async refreshTokens(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Check if refresh token is blacklisted
      const isBlacklisted = await this.tokenBlacklistProvider.isRefreshTokenBlacklisted(refreshToken);
      if (isBlacklisted) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      // Verify the refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      // Extract user data from the payload
      const { sub: userId, sessionId } = payload as ActiveUserData;

      // Check if session is blacklisted
      if (sessionId) {
        const isSessionBlacklisted = await this.tokenBlacklistProvider.isSessionBlacklisted(sessionId);
        if (isSessionBlacklisted) {
          throw new UnauthorizedException('Session has been revoked');
        }
      }

      // Verify that the user still exists
      const user = await this.userService.findOne(userId);

      // Generate new tokens
      const newTokens = await this.generateTokenProvider.generateToken(
        user,
        sessionId,
      );

      return newTokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }



  // method to validate refresh token used for logout
  async validateRefreshToken(refreshToken: string): Promise<boolean> {
    try {
      await this.jwtService.verifyAsync(refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });
      return true;
    } catch {
      return false;
    }
  }

  decodeRefreshToken(refreshToken: string): ActiveUserData | null {
    try {
      const payload = this.jwtService.decode(refreshToken) as ActiveUserData;
      return payload;
    } catch {
      return null;
    }
  }
}
