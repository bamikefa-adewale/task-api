import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { REQUEST_USER_KEY } from 'src/auth/constants/auth.constant';
import jwtConfig from 'src/config/jwt.config';
import { TokenBlacklistProvider } from 'src/auth/provider/token-blacklist.provider';
// import { UsersessionService } from 'src/usersession/usersession.service';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly tokenBlacklistProvider: TokenBlacklistProvider,
    // private readonly userSessionService: UsersessionService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractRequestFromHeader(request);
    if (!token) {
      return false;
    }
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );
      console.log('JWT payload:', payload);
      
      // Check if the access token is blacklisted
      const isBlacklisted = await this.tokenBlacklistProvider.isAccessTokenBlacklisted(token);
      if (isBlacklisted) {
        console.log('Access token is blacklisted');
        throw new UnauthorizedException('Token has been revoked');
      }

      // Check if the session is blacklisted
      if (payload.sessionId) {
        const isSessionBlacklisted = await this.tokenBlacklistProvider.isSessionBlacklisted(payload.sessionId);
        if (isSessionBlacklisted) {
          console.log('Session is blacklisted:', payload.sessionId);
          throw new UnauthorizedException('Session has been revoked');
        }
      }
      
      request[REQUEST_USER_KEY] = payload;
      return true;
    } catch (error) {
      console.log('Token validation error:', error.message);
      return false;
    }
  }

  private extractRequestFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer') return undefined;
    return token;
  }
}
