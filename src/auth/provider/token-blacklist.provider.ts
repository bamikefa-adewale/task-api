import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import jwtConfig from 'src/config/jwt.config';
import { ActiveUserData } from 'src/interfaces/active-user.interface';

@Injectable()
export class TokenBlacklistProvider {
  private readonly logger = new Logger(TokenBlacklistProvider.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  /**
   * Add tokens to blacklist
   * @param accessToken - The access token to blacklist
   * @param refreshToken - The refresh token to blacklist
   * @param userId - User ID for logging purposes
   */
  async blacklistTokens(
    accessToken: string,
    refreshToken: string,
    userId: string,
  ): Promise<void> {
    try {
      // Decode tokens to get expiration times
      const accessTokenPayload = this.jwtService.decode(accessToken) as ActiveUserData;
      const refreshTokenPayload = this.jwtService.decode(refreshToken) as ActiveUserData;

      if (!accessTokenPayload || !refreshTokenPayload) {
        throw new Error('Invalid token payload');
      }

      // Calculate TTL (time to live) for each token
      const now = Math.floor(Date.now() / 1000);
      const accessTokenTTL = (accessTokenPayload.exp || 0) - now;
      const refreshTokenTTL = (refreshTokenPayload.exp || 0) - now;

      // Only blacklist if tokens haven't expired yet
      if (accessTokenTTL > 0) {
        await this.cacheManager.set(
          `blacklist:access:${accessToken}`,
          { userId, blacklistedAt: new Date().toISOString() },
          accessTokenTTL * 1000, // Convert to milliseconds
        );
        this.logger.log(`Access token blacklisted for user ${userId}`);
      }

      if (refreshTokenTTL > 0) {
        await this.cacheManager.set(
          `blacklist:refresh:${refreshToken}`,
          { userId, blacklistedAt: new Date().toISOString() },
          refreshTokenTTL * 1000, // Convert to milliseconds
        );
        this.logger.log(`Refresh token blacklisted for user ${userId}`);
      }

      // Also blacklist by session ID to invalidate all tokens for this session
      if (accessTokenPayload.sessionId) {
        await this.cacheManager.set(
          `blacklist:session:${accessTokenPayload.sessionId}`,
          { userId, blacklistedAt: new Date().toISOString() },
          Math.max(accessTokenTTL, refreshTokenTTL) * 1000,
        );
        this.logger.log(`Session ${accessTokenPayload.sessionId} blacklisted for user ${userId}`);
      }

    } catch (error) {
      this.logger.error('Failed to blacklist tokens:', error.message);
      throw error;
    }
  }

  /**
   * Check if access token is blacklisted
   * @param accessToken - The access token to check
   * @returns Promise<boolean> - True if token is blacklisted
   */
  async isAccessTokenBlacklisted(accessToken: string): Promise<boolean> {
    try {
      const blacklisted = await this.cacheManager.get(`blacklist:access:${accessToken}`);
      return !!blacklisted;
    } catch (error) {
      this.logger.error('Failed to check access token blacklist:', error.message);
      return false; // If Redis is down, allow the request (fail open)
    }
  }

  /**
   * Check if refresh token is blacklisted
   * @param refreshToken - The refresh token to check
   * @returns Promise<boolean> - True if token is blacklisted
   */
  async isRefreshTokenBlacklisted(refreshToken: string): Promise<boolean> {
    try {
      const blacklisted = await this.cacheManager.get(`blacklist:refresh:${refreshToken}`);
      return !!blacklisted;
    } catch (error) {
      this.logger.error('Failed to check refresh token blacklist:', error.message);
      return false; // If Redis is down, allow the request (fail open)
    }
  }

  /**
   * Check if session is blacklisted
   * @param sessionId - The session ID to check
   * @returns Promise<boolean> - True if session is blacklisted
   */
  async isSessionBlacklisted(sessionId: string): Promise<boolean> {
    try {
      const blacklisted = await this.cacheManager.get(`blacklist:session:${sessionId}`);
      return !!blacklisted;
    } catch (error) {
      this.logger.error('Failed to check session blacklist:', error.message);
      return false; // If Redis is down, allow the request (fail open)
    }
  }

  /**
   * Blacklist a single access token
   * @param accessToken - The access token to blacklist
   * @param userId - User ID for logging purposes
   */
  async blacklistAccessToken(accessToken: string, userId: string): Promise<void> {
    try {
      // Decode token to get expiration time
      const accessTokenPayload = this.jwtService.decode(accessToken) as ActiveUserData;
      
      if (!accessTokenPayload) {
        throw new Error('Invalid access token payload');
      }

      // Calculate TTL (time to live) for the token
      const now = Math.floor(Date.now() / 1000);
      const accessTokenTTL = (accessTokenPayload.exp || 0) - now;

      // Only blacklist if token hasn't expired yet
      if (accessTokenTTL > 0) {
        await this.cacheManager.set(
          `blacklist:access:${accessToken}`,
          { userId, blacklistedAt: new Date().toISOString() },
          accessTokenTTL * 1000, // Convert to milliseconds
        );
        this.logger.log(`Access token blacklisted for user ${userId}`);
      } else {
        this.logger.log(`Access token already expired for user ${userId}`);
      }
    } catch (error) {
      this.logger.error('Failed to blacklist access token:', error.message);
      throw error;
    }
  }

  /**
   * Blacklist all tokens for a specific session
   * @param sessionId - The session ID to blacklist
   * @param userId - User ID for logging purposes
   */
  async blacklistSession(sessionId: string, userId: string): Promise<void> {
    try {
      // Set a long TTL for session blacklist (24 hours)
      await this.cacheManager.set(
        `blacklist:session:${sessionId}`,
        { userId, blacklistedAt: new Date().toISOString() },
        24 * 60 * 60 * 1000, // 24 hours in milliseconds
      );
      this.logger.log(`Session ${sessionId} blacklisted for user ${userId}`);
    } catch (error) {
      this.logger.error('Failed to blacklist session:', error.message);
      throw error;
    }
  }
}
