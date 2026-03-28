import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/config/jwt.config';
import { User } from 'src/user/entities/user.entity';
import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { ActiveUserData } from 'src/interfaces/active-user.interface';

@Injectable()
export class GenerateTokenProvider {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  public async signToken(
    payload: ActiveUserData,
    expiresIn: number | string,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.jwtConfiguration.secret,
      audience: this.jwtConfiguration.audience,
      issuer: this.jwtConfiguration.issuer,
      expiresIn,
    });
  }

  public async generateToken(
    user: User,
    sessionId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: ActiveUserData = {
      sub: user.id,
      email: user.email,
      sessionId,
    };

    const accessToken = await this.signToken(
      payload,
      this.jwtConfiguration.accessToken,
    );

    const refreshToken = await this.signToken(
      payload,
      this.jwtConfiguration.refreshToken,
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
