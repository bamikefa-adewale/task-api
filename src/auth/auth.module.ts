import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { AuthService } from './provider/auth.service';
import { GoogleAuthenticationController } from './google-authentication.controller';
import { GoogleAuthenticationProvider } from './provider/google-authentication.provider';
import { GenerateTokenProvider } from './provider/generate-token.provider';
import { RefreshTokenProvider } from './provider/refresh-token.provider';
import { TokenBlacklistProvider } from './provider/token-blacklist.provider';
import { UserService } from 'src/user/provider/user.service';
import { findOneByGoogleIdProvider } from 'src/user/provider/find-one-by-google-id.provider';

@Module({
  controllers: [GoogleAuthenticationController],
  providers: [
    AuthService,
    GoogleAuthenticationProvider,
    GenerateTokenProvider,
    RefreshTokenProvider,
    TokenBlacklistProvider,
    UserService,
    findOneByGoogleIdProvider,
  ],
  imports: [
    TypeOrmModule.forFeature([User]),
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 1000,
    }),
  ],
  exports: [AuthService, TokenBlacklistProvider, GenerateTokenProvider],
})
export class AuthModule {}
